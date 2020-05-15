const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));

const sqlite = require('sqlite3');
const LAPTOP_DB = "./db/laptops.db";

const PORT_NUMBER = 3000;





app.get('/', function(req, res) {
    console.log("GET /");
    res.sendfile('index.html');
});

app.get('/laptop', function(req, res) {
    console.log("GET /laptop");
    let laptopDB = new sqlite.Database(LAPTOP_DB, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    // Retrieve database items
    laptopDB.all(`SELECT * FROM laptop`, [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log(rows);
        res.status(200).send(rows);
    });

    laptopDB.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });
});

// app.get('/cpu/:cpu_id', ...

// app.get('/ram/:ram_id', ...





app.put('/laptop', function(req, res) {
    // Get the request object
    console.log("PUT /laptop");
    console.log(req.body);
    let model = req.body.model;
    let cpuID = req.body.cpu_id;
    let ramID = req.body.ram_id;
    let storage = req.body.storage;
    let battery = req.body.battery;

    let laptopDB = new sqlite.Database(LAPTOP_DB, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    // Write to the database
    laptopDB.run(`INSERT INTO laptop(model, cpu_id, ram_id, storage, battery) VALUES(?, ?, ?, ?, ?)`, [model, cpuID, ramID, storage, battery], function(err) {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log(`Item inserted with rowid ${this.lastID} into laptop table.`);
    });

    laptopDB.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });

    res.status.send(`Successfully added laptop model '${model}'.`)
});

// app.put('/cpu', ...

// app.put('/ram', ...


/**
 *  WORK IN PROGRESS:
 * This function will insert the given set of attributes into the given table.
 * 
 * EXAMPLE:
 * dbInsert("laptop(model, cpu_id, ram_id, storage, battery)", [Dell, 'some_cpu', 'some_ram', 256, 6]);
 */
// function dbInsert(tableName, values) {
//     let sql = `INSERT INTO ${tableName} VALUES(`;
//     for (let i = 0; i < values.length; ++i) {
//         if (i != values.length - 1) {
//             sql += values[i] + '?,';
//         } else {
//             sql += values[i] + '?)';
//         }
//     }

//     let laptopDB = new sqlite.Database(LAPTOP_DB, (err) => {
//         if (err) {
//             throw err.message;
//         }
//         console.log("Connected to laptop database.");
//     });

//     laptopDB.run(sql, values, function(err) {
//         if (err) {
//             throw err.message;
//         }
//         console.log(`${values} inserted with rowid ${this.lastID} into ${tableName}`);
//     });
// }





app.delete('/laptop/:model', function(req, res) {
    console.log("DELETE /laptop/[model]");
    let model = req.body.model;

    let laptopDB = new sqlite.Database(LAPTOP_DB, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    laptopDB.run(`DELETE FROM laptop WHERE model = ?`, model, function(err) {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log(`Deleted model ${model} from laptop table.`);
    });

    laptopDB.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });
    
    res.status(200).send(`Successfully deleted laptop model '${model}''.`)
});





//-----------------------------------------------
// CPU - I got the '/cpu' endpoints working with this code. Feel free to use this after giving it a try.
//-----------------------------------------------

// app.get('/cpu/:cpu_id', function(req, res) {
//     let cpuID = req.params.cpu_id;
//     console.log("GET /cpu/" + cpuID);
//     let laptopDB = new sqlite.Database(LAPTOP_DB, (err) => {
//         if (err) {
//             console.error(err.message);
//             res.sendStatus(500);
//         }
//         console.log("Connected to laptop database.");
//     });

//     // Retrieve database items
//     laptopDB.all(`SELECT DISTINCT cpu_id, score FROM cpu WHERE cpu_id = ?`, [cpuID], (err, rows) => {
//         if (err) {
//             throw err;
//         }
//         console.log(rows);
//         res.send(rows);
//     });

//     laptopDB.close((err) => {
//         if (err) {
//             console.error(err.message);
//             res.sendStatus(500);
//         }
//         console.log("Closed the connection to laptop database.");
//     });
// });

// app.put('/cpu', function(req, res) {
//     console.log("PUT /cpu");
//     console.log(req.body);
//     let cpuName = req.body.cpu_id;
//     let cpuScore = req.body.score;

//     let db = new sqlite.Database(LAPTOP_DB, (err) => {
//         if (err) {
//             console.error(err.message);
//             res.sendStatus(500);
//             return console.log(err.message);
//         }
//         console.log("Connected to the laptop database.");
//     });

//     db.run(`INSERT INTO cpu(cpu_id, score) VALUES(?, ?)`, [cpuName, cpuScore], function(err) {
//         if (err) {
//             res.sendStatus(500);
//             return console.log(err.message);
//         }
//         console.log(`Item inserted with rowid ${this.lastID} into cpu table.`);
//     });

//     db.close((err) => {
//         if (err) {
//             console.error(err.message);
//             res.sendStatus(500);
//             return console.log(err.message);
//         }
//         console.log("Closed the connection to laptop database.");
//     });

//     res.sendStatus(200);
// });





//-----------------------------------------------
// RAMI got the '/ram' endpoints working with this code. Feel free to use this after giving it a try.
//-----------------------------------------------

// app.get('/ram/:ram_id', function(req, res) {
//     let ramID = req.params.ram_id;
//     console.log("GET /ram/" + ramID);
//     let laptopDB = new sqlite.Database(LAPTOP_DB, (err) => {
//         if (err) {
//             console.error(err.message);
//             res.sendStatus(500);
//         }
//         console.log("Connected to laptop database.");
//     });

//     // Retrieve database items
//     laptopDB.all(`SELECT DISTINCT ram_id, capacity, intel_score, amd_score FROM ram WHERE ram_id = ?`, [ramID], (err, rows) => {
//         if (err) {
//             throw err;
//         }
//         console.log(rows);
//         res.send(rows);
//     });

//     laptopDB.close((err) => {
//         if (err) {
//             console.error(err.message);
//             res.sendStatus(500);
//         }
//         console.log("Closed the connection to laptop database.");
//     });
// });

// app.put('/ram', function(req, res) {
//     console.log(req.body);
//     let capacity = req.body.capacity;
//     let intelScore = req.body.intel_score;
//     let amdScore = req.body.amd_score;

//     let db = new sqlite.Database(LAPTOP_DB, (err) => {
//         if (err) {
//             console.error(err.message);
//             res.sendStatus(500);
//         }
//         console.log("Connected to the laptop database.");
//     });

//     db.run(`INSERT INTO ram(capacity, intel_score, amd_score) VALUES(?, ?, ?)`, [capacity, intelScore, amdScore], function(err) {
//         if (err) {
//             res.sendStatus(500);
//             return console.log(err.message);
//         }
//         console.log(`Item inserted with rowid ${this.lastID} into ram table.`);
//     });

//     db.close((err) => {
//         if (err) {
//             console.error(err.message);
//             res.sendStatus(500);
//         }
//         console.log("Closed the connection to laptop database.");
//     });

//     res.sendStatus(200);
// });





app.listen(PORT_NUMBER, function() {
    console.log("Listening on port " + PORT_NUMBER + "!");
});
