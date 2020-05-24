const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));

const sqlite = require('sqlite3');
const DB_FILE_NAME = "./db/laptops.db";
const LAPTOP_TABLE = "laptop(model, price, cpu_id, ram_id, storage, battery)";
const CPU_TABLE = "cpu(cpu_id, score)";
const RAM_TABLE = "ram(ram_id, capacity, speed)";
const CPU = "cpu";
const RAM = "ram";
const SCORE = "score";
const LAPTOP = "laptop";
const BATTERY = "battery";
const STORAGE = "storage";
const SPEED = "speed";
const RAMID = "ram_id";
const CAPACITY = "capacity";

const PORT_NUMBER = 3000;

var cpuReady = false;
var ramReady = false;
var batteryReady = false;
var storageReady = false;

function chooseBest(userPref) {
  selectByMax(CPU, SCORE, userPref.cpuScore);
  let ramScore = userPref.ramScore;
  let ramStmt = makeRamSelectStmt(ramScore);
  selectRam(ramStmt);
  selectByMax(LAPTOP, BATTERY, userPref.battery);
  selectByMax(LAPTOP, STORAGE, userPref.storage);


  // SELECT DISTINCT * FROM batteryView
  // JOIN ramView ON batteryView.ram_id = ramView.ram_id
  // JOIN cpuView ON batteryView.cpu_id = cpuView.cpu_id
  // JOIN storageView ON batteryView.model = storageView.model
  // GROUP BY model

  // return best laptop
}

function dropViews() {
  // open database in memory
  let db = new sqlite.Database(DB_FILE_NAME, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to database.');
  });

  db.run(`DROP VIEW IF EXISTS best${RAM}`, [], (err, row) => {
    if (err) {
      throw err;
    }
    console.log("Dropped ram view.");
  });
  db.run(`DROP VIEW IF EXISTS best${STORAGE}`, [], (err, row) => {
    if (err) {
      throw err;
    }
    console.log("Dropped storage view.");
  });
  db.run(`DROP VIEW IF EXISTS best${BATTERY}`, [], (err, row) => {
    if (err) {
      throw err;
    }
    console.log("Dropped battery view.");
  });
  db.run(`DROP VIEW IF EXISTS best${SCORE}`, [], (err, row) => {
    if (err) {
      throw err;
    }
    console.log("Dropped cpu view.");
  });

  // close the database connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

function selectRam(stmt) {
  // open database in memory
  let db = new sqlite.Database(DB_FILE_NAME, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to database.');
  });

  db.get(stmt, [], (err, row) => {
    if (err) {
      throw err;
    }

    bestRam = row;
    ramReady = true;
  });

  // close the database connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });

}

function makeRamSelectStmt(ramScore) {
  let ramView = "[bestram]";
  if (ramScore == 1) {
    return `CREATE VIEW ${ramView} AS SELECT ${RAMID}, ${CAPACITY}, MIN(${SPEED}) AS speed ` +
    `FROM ${RAM} WHERE capacity = 4 GROUP BY ${RAMID}, ${CAPACITY}`;
  }
  else if (ramScore == 3) {
    return `CREATE VIEW ${ramView} AS SELECT ${RAMID}, ${CAPACITY}, MAX(${SPEED}) AS speed ` +
    `FROM ${RAM} WHERE capacity = 4 GROUP BY ${RAMID}, ${CAPACITY}`;
  }
  else if (ramScore == 2) {
    return `CREATE VIEW ${ramView} AS SELECT ${RAMID}, ${CAPACITY}, AVG(${SPEED}) AS speed ` +
    `FROM ${RAM} WHERE capacity = 4 GROUP BY ${RAMID}, ${CAPACITY}`;
  }
  else if (ramScore == 4) {
    return `CREATE VIEW ${ramView} AS SELECT ${RAMID}, ${CAPACITY}, MIN(${SPEED}) AS speed ` +
    `FROM ${RAM} WHERE capacity = 8 GROUP BY ${RAMID}, ${CAPACITY}`;
  }
  else if (ramScore == 6) {
    return `CREATE VIEW ${ramView} AS SELECT ${RAMID}, ${CAPACITY}, MAX(${SPEED}) AS speed ` +
    `FROM ${RAM} WHERE capacity = 8 GROUP BY ${RAMID}, ${CAPACITY}`;
  }
  else if (ramScore == 5) {
    return `CREATE VIEW ${ramView} AS SELECT ${RAMID}, ${CAPACITY}, AVG(${SPEED}) AS speed ` +
    `FROM ${RAM} WHERE capacity = 8 GROUP BY ${RAMID}, ${CAPACITY}`;
  }
  else if (ramScore == 7) {
    return `CREATE VIEW ${ramView} AS SELECT * FROM ${RAM} WHERE capacity = 16 AND speed <= 2700`;
  }
  else if (ramScore == 8) {
    return `CREATE VIEW ${ramView} AS SELECT * FROM ${RAM} WHERE capacity = 16 AND speed > 2700`;
  }
  else if (ramScore == 9 || ramScore == 10) {
    return `CREATE VIEW ${ramView} AS SELECT * FROM ${RAM} WHERE capacity = 32`;
  }
}

function selectBestFit(table, col, lowerBound) {
  let sql = `CREATE VIEW [best${col}] AS SELECT DISTINCT * FROM ${table} WHERE ${col} >=  ${lowerBound}`;

  // open database in memory
  let db = new sqlite.Database(DB_FILE_NAME, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to database.');
  });

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }

    if (table == CPU) {
      cpuReady = true;
    } else if (col == BATTERY) {
      batteryReady = true;
    } else if (col == STORAGE) {
      storageReady = true;
    }
    console.log(`${col}: `);
    console.log(rows);

    if (cpuReady && ramReady && batteryReady && storageReady) {
      // TODO: join the views based on ram and cpu id's
      // keep track of which joins gave non-zero results
      // do all the joins
      // work backwards from the last result to the first, returning the first
      // legitimate result
      dropViews();
    }
  });

  // close the database connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

function selectByMax(table, col, rating) {
  // open database in memory
  let db = new sqlite.Database(DB_FILE_NAME, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to database.');
  });

  let sql = `SELECT MAX(${col}) max FROM ${table}`;

  db.get(sql, [], (err, row) => {
    if (err) {
      throw err;
    }
    let lowerBound = row.max * rating / 10;
    selectBestFit(table, col, lowerBound);
  });

  // close the database connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });

}

let userPref = {
  battery : 5,
  storage : 5,
  ramScore : 5,
  cpuScore : 5
}

chooseBest(userPref);
