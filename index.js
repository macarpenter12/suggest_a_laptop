const express = require('express');
const bodyParser = require('body-parser');
// const sorter = require('./public/sorter');   INCLUDE /suggestion CODE IF UNCOMMENTED

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

const PORT_NUMBER = 3000;





app.get('/', function(req, res) {
    console.info(new Date().toLocaleString() + " - GET /");
    res.sendFile('public/index.html', { root: __dirname });
});

app.put('/suggestion', function(req, res) {
    console.info(new Date().toLocaleString() + " - PUT /suggestion");
    console.info('Generating suggestion...');
    
    let ramCapacity = 0;
    if (req.body.ramScore < 4) {
        ramCapacity = 4;
    } else if (req.body.ramScore < 7) {
        ramCapacity = 8;
    } else if (req.body.ramScore < 9) {
        ramCapacity = 16;
    } else {
        ramCapacity = 32;
    }

    let sql =
        `SELECT MAX(speed) max_speed, MIN(speed) min_speed FROM ram WHERE capacity = ?`;

    let db = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            console.log(err.message);
            return;
        }
        console.log('Connected to database');
    });

    db.get(sql, [ramCapacity], (err, data) => {
        if (err) {
            console.log(err.message);
            return;
        }

        console.log('Filter data:', data);
        let ramSpeed = getRamSpeed(req.body.ramScore, data.max_speed, data.min_speed);
        console.log('Ram capacity', ramCapacity);
        console.log('Ram speed:', ramSpeed);
        
        let values = [
            req.body.budget,
            req.body.cpuScore,
            ramCapacity,
            ramSpeed,
            req.body.storage,
            req.body.battery
        ];

        sql =
            `SELECT * FROM laptop l
               JOIN cpu c ON l.cpu_id = c.cpu_id
               JOIN ram r ON l.ram_id = r.ram_id
              WHERE price <= ?
                AND score >= ? * (SELECT MAX(score) FROM cpu) / 10
                AND capacity >= ?
                AND speed >= ?
                AND storage >= 100 * ?
                AND battery >= ?
             ORDER BY price`;

        db.get(sql, values, (err, recommendation) => {
            if (err) {
                console.log(err.message);
                return;
            }
            console.log(recommendation);
            res.status(200).json(recommendation);
        });
    });

    db.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });



    /* FOR USE WITH [sorter.js] */
    // let laptopSuggestion = sorter.chooseLaptop(req.body);
    // console.log('app.put: suggestion: ' + laptopSuggestion);
    // res.status(200).send(laptopSuggestion);
});





app.get('/admin', function(req, res) {
    console.info(new Date().toLocaleString() + " - GET /admin");
    res.sendFile('public/admin.html', { root: __dirname });
});

// app.post('/admin/sql', function(req, res) {
//     console.info(new Date().toLocaleString() + " - POST /admin/sql");
//     let sql = req.body.sql_statement;

//     if (sql.toLowerCase().includes('delete') || sql.toLowerCase().includes('insert')) {
//         res.status(400).send('DELETE and INSERT statements not allowed through this endpoint.');
//         console.log("ERROR: Attempted to DELETE/INSERT at /admin/sql: '" + sql + "'");
//         return;
//     }

//     let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
//         if (err) {
//             res.status(500).send(err.message);
//         }
//         console.log("Connected to laptop database.");
//     });

//     // Retrieve database items
//     laptopDB.all(sql, (err, rows) => {
//         if (err) {
//             res.status(500).send(err.message);
//         }
//         console.log(rows);
//         res.status(200).send(rows);
//     });

//     laptopDB.close((err) => {
//         if (err) {
//             res.status(500).send(err.message);
//         }
//         console.log("Closed the connection to laptop database.");
//     });
// });





app.get('/laptop', function(req, res) {
    console.info(new Date().toLocaleString() + " - GET /laptop");
    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
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

app.get('/cpu/:cpu_id', function(req, res) {
    let cpuID = req.params.cpu_id;
    console.info(new Date().toLocaleString() + " - GET /cpu/ " + cpuID);

    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });


    laptopDB.all(`SELECT cpu_id, score FROM cpu WHERE cpu_id = ?`, [cpuID], (err, rows) => {
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

app.get('/cpu', function(req, res) {
    console.info(new Date().toLocaleString() + " - GET /cpu");
    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    laptopDB.all(`SELECT * FROM cpu`, [], (err, rows) => {
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

app.get('/ram', function(req, res) {
    console.info(new Date().toLocaleString() + " - GET /ram");
    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    laptopDB.all(`SELECT * FROM ram`, [], (err, rows) => {
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

app.get('/ram/:ram_id', function(req, res) {
    let ramID = req.params.ram_id;
    console.info(new Date().toLocaleString() + " - GET /ram/ " + ramID); // log the get request

    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => { // connect to database
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    // get all the columns from the ram table
    laptopDB.all(`SELECT ram_id, capacity, speed FROM ram WHERE ram_id = ?`, [ramID], (err, rows) => {
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





app.put('/laptop', function(req, res, next) {
    // Get the request object
    console.info(new Date().toLocaleString() + " - PUT /laptop");
    console.log(req.body);
    let model = String(req.body.model);
    let price = Number(req.body.price);
    let cpuID = String(req.body.cpu_id);
    let ramID = String(req.body.ram_id);
    let storage = Number(req.body.storage);
    let battery = Number(req.body.battery);

    dbInsert(LAPTOP_TABLE, [model, price, cpuID, ramID, storage, battery]);

    res.status(200).send(`Successfully added laptop model '${model}'.`);
});

app.put('/cpu', function(req, res) {
    // Get the request object
    console.info(new Date().toLocaleString() + " - PUT /cpu");
    console.log(req.body);
    let cpuID = req.body.cpu_id;
    let score = req.body.score;

    dbInsert(CPU_TABLE, [cpuID, score]);

    res.status(200).send(`Successfully added cpu '${cpuID}'.`);
});

app.put('/ram', function(req, res) {
    // Get ram info to put into database
    console.info(new Date().toLocaleString() + " - PUT /ram");
    console.log(req.body);
    let ramID = req.body.ram_id;
    let capacity = req.body.capacity;
    let speed = req.body.speed;

    dbInsert(RAM_TABLE, [ramID, capacity, speed]);

    res.status(200).send(`Successfully added ram '${ramID}'.`);
});





app.delete('/laptop/:model', function(req, res) {
    let model = req.params.model;
    console.info(new Date().toLocaleString() + " - DELETE /laptop/" + model);

    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
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

    res.status(200).send(`Successfully deleted laptop model '${model}''.`);
});

app.delete('/cpu/:cpu_id', function(req, res) {
    let cpuID = req.params.cpu_id;
    console.info(new Date().toLocaleString() + " - DELETE /cpu/" + cpuID);

    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    laptopDB.run(`DELETE FROM cpu WHERE cpu_id = ?`, cpuID, function(err) {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log(`Deleted CPU ${cpuID} from cpu table.`);
    });

    laptopDB.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });

    res.status(200).send(`Successfully deleted cpu with ID '${cpuID}''.`);
});

app.delete('/ram/:ram_id', function(req, res) {
    let ramID = req.params.ram_id;
    console.info(new Date().toLocaleString() + " - DELETE /ram/" + ramID);

    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    laptopDB.run(`DELETE FROM ram WHERE ram_id = ?`, ramID, function(err) {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log(`Deleted RAM ${ramID} from ram table.`);
    });

    laptopDB.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });

    res.status(200).send(`Successfully deleted ram with ID '${ramID}''.`);
});





app.listen(PORT_NUMBER, function() {
    console.log("Listening on port " + PORT_NUMBER + "!");
});





function getRamSpeed(ramScore, maxSpeed, minSpeed) {
    let ramSpeed = 0;
    let ramSpeedDelta = maxSpeed - minSpeed;
    if (ramScore < 4) {
        ramSpeed = minSpeed + (ramSpeedDelta * (ramScore - 1) / 3);
    }
    else if (ramScore < 7) {
        ramSpeed = minSpeed + (ramSpeedDelta * (ramScore - 4) / 3);
    }
    else if (ramScore < 9) {
        ramSpeed = minSpeed + (ramSpeedDelta * (ramScore - 7) / 2);
    }
    else {
        ramSpeed = minSpeed + (ramSpeedDelta * (ramScore - 9) / 2);
    }

    return ramSpeed;
}

/**
 * This function will insert the given set of attributes into the given table.
 *
 * EXAMPLE:
 * dbInsert("laptop(model, cpu_id, ram_id, storage, battery)", [Dell, 'some_cpu', 'some_ram', 256, 6]);
 */
function dbInsert(tableName, values) {
    let sql = `INSERT INTO ${tableName} VALUES(`;
    for (let i = 0; i < values.length; ++i) {
        if (i != values.length - 1) {
            sql += '?,';
        }
        else {
            sql += '?)';
        }
    }

    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            throw err.message;
        }
        console.log("Connected to laptop database.");
    });

    laptopDB.run(sql, values, function(err) {
        if (err) {
            throw err.message;
        }
        console.log(`${values} inserted with rowid ${this.lastID} into ${tableName}`);
    });

    laptopDB.close((err) => {
        if (err) {
            throw err.message;
        }
        console.log("Closed the connection to laptop database.");
    });
}
