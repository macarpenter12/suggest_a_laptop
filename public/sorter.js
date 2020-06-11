exports.chooseLaptop = function(userPref) {
  chooseBestLaptop(userPref);
  console.log('recommendation: ' + recommendation);
  return recommendation;
};

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

var cpuReady = false;
var ramReady = false;
var batteryReady = false;
var storageReady = false;

var recommendation = null;
var globalUserPref = null;

class UserChoice {
  constructor(spec, num) {
    this._spec = spec;
    this._num = num;
  }

  get spec() {
    return this._spec;
  }

  set spec(spec) {
    this._spec = spec;
  }

  get num() {
    return this._num;
  }

  set num(num) {
    this._num = num;
  }
}

// uses the user scores to select the best fit laptop to give a recommendation
function chooseBestLaptop(userPref) {
  console.log(userPref);
  globalUserPref = userPref;
  dropViews();
  selectByMax(CPU, SCORE, userPref.cpuScore);
  let ramScore = userPref.ramScore;
  let ramStmt = makeRamSelectStmt(ramScore);
  selectRam(ramStmt);
  selectByMax(LAPTOP, BATTERY, userPref.battery);
  selectByMax(LAPTOP, STORAGE, userPref.storage);
  dropViews();
}

// selects only laptops that are at least as good as the user score indicates
// and creates a view to hold the results
function selectByMax(table, col, rating) {
  let db = new sqlite.Database(DB_FILE_NAME, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to database.');
  });

  let sql = `SELECT MAX(${col}) max FROM ${table}`;

  db.get(sql, [], (err, row) => {
    if (err) {
      console.log(new Error().stack);
      throw err;
    }
    let lowerBound = row.max * rating / 10;
    selectBestFit(table, col, lowerBound);
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });

}

// selects the best cpu, battery, and storage choices based on the user score
// makes recommendation once all the choices have been narrowed down
function selectBestFit(table, col, lowerBound) {
  let sql = `CREATE VIEW [best${col}] AS SELECT DISTINCT * FROM ${table} WHERE ${col} >=  ${lowerBound}`;

  let db = new sqlite.Database(DB_FILE_NAME, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to database.');
  });

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.log(new Error().stack);
      throw err;
    }

    if (table == CPU) {
      cpuReady = true;
    }
    else if (col == BATTERY) {
      batteryReady = true;
    }
    else if (col == STORAGE) {
      storageReady = true;
    }

    if (cpuReady && ramReady && batteryReady && storageReady) {
      console.log('globalUserPref before makeRecommendation: ' + globalUserPref);
      makeRecommendation(globalUserPref);
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

// selects the best ram configurations based on the user score
function selectRam(stmt) {
  console.log(stmt);
  let db = new sqlite.Database(DB_FILE_NAME, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to database.');
  });

  db.all(stmt, [], (err, rows) => {
    if (err) {
      console.log(new Error().stack);
      throw err;
    }

    ramReady = true;
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });

}

// make SQL statement to select the ram configurations for the user score
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

// drop the views from the database that were created as part of the recommendation
// process
function dropViews() {
  let db = new sqlite.Database(DB_FILE_NAME, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to database.');
  });

  // db.run(`DROP VIEW IF EXISTS [bestram]`, [], (err, row) => {
  //   if (err) {
  //     throw err;
  //   }
  //   console.log("Dropped [bestram] view.");
  // })
  db.run(`DROP VIEW IF EXISTS best${RAM}`, [], (err, row) => {
    if (err) {
      console.log(new Error().stack);
      throw err;
    }
    console.log("Dropped ram view.");
  });
  db.run(`DROP VIEW IF EXISTS best${STORAGE}`, [], (err, row) => {
    if (err) {
      console.log(new Error().stack);
      throw err;
    }
    console.log("Dropped storage view.");
  });
  db.run(`DROP VIEW IF EXISTS best${BATTERY}`, [], (err, row) => {
    if (err) {
      console.log(new Error().stack);
      throw err;
    }
    console.log("Dropped battery view.");
  });
  db.run(`DROP VIEW IF EXISTS best${SCORE}`, [], (err, row) => {
    if (err) {
      console.log(new Error().stack);
      throw err;
    }
    console.log("Dropped cpu view.");
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

// creates SQL statement to join all the views representing the best
// fit specifications to create a best fit laptop and then queries the database
function makeRecommendation(userPref) {
  let battery = new UserChoice(BATTERY, userPref.battery);
  let storage = new UserChoice(STORAGE, userPref.storage);
  let ramScore = new UserChoice(RAM, userPref.ramScore);
  let cpuScore = new UserChoice(SCORE, userPref.cpuScore);
  
  let scoring = [battery, storage, ramScore, cpuScore];
  scoring.sort(function(a, b) { return b.num - a.num });

  let indices = new Set();
  let j = 0;
  for (j = 0; j < scoring.length; j++) {
    indices.add(j);
  }

  let i = 0;
  while (scoring[i].spec != BATTERY && scoring[i].spec != STORAGE && i < scoring.length) {
    i++;
  }
  let baseView = scoring[i].spec; // used in the SELECT clause
  indices.delete(i); // remove index of option used in SELECT clause

  var sqlstmts = [];
  let sql = `SELECT * FROM best${baseView} `;
  sqlstmts.push(sql);
  for (let k = 0; k < scoring.length; k++) { // make JOIN statements for the rest of the parameters
    if (indices.has(k)) {
      sql += `JOIN best${scoring[k].spec} ON `;
      if (scoring[k].spec == RAM) {
        sql += `best${baseView}.ram_id = best${scoring[k].spec}.ram_id `;
        if (sqlstmts.length != scoring.length - 1) {
          sqlstmts.push(sql);
        }
      }
      else if (scoring[k].spec == SCORE) {
        sql += `best${baseView}.cpu_id = best${scoring[k].spec}.cpu_id `;
        if (sqlstmts.length != scoring.length - 1) {
          sqlstmts.push(sql);
        }
      }
      else if (scoring[k].spec == STORAGE || scoring[k].spec == BATTERY) {
        sql += `best${baseView}.model = best${scoring[k]._spec}.model `;
        if (sqlstmts.length != scoring.length - 1) {
          sqlstmts.push(sql);
        }
      }
    }
  }

  getRecommendation(sql, sqlstmts);
}

// select the best laptop by joining the views containing the best ram, cpu, battery,
// and storage configurations
function getRecommendation(sql, sqlstmts) {
  let db = new sqlite.Database(DB_FILE_NAME, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to database.');
  });

  db.get(sql, [], (err, row) => {
    if (err) {
      console.log(new Error().stack);
      throw err;
    }

    if (typeof row == "undefined" && sqlstmts.length > 0) {
      sql = sqlstmts[sqlstmts.length - 1];
      sqlstmts.pop();
      getRecommendation(sql, sqlstmts);
    }
    else {
      console.log('row' + row);
      recommendation = row;
      dropViews();
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

// for testing
// var userPref = {
//   price: 1500,
//   battery : 4,
//   storage : 2,
//   ramScore : 8,
//   cpuScore : 9
// }

// chooseBestLaptop(userPref);
