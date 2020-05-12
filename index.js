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
            console.error(err.message);
            res.sendStatus(500);
        }
        console.log("Connected to laptop database.");
    });

    // Retrieve database items
    laptopDB.all(`SELECT model, cpu_id, ram_id, storage FROM laptop`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        console.log(rows);
        res.send(rows);
    });

    laptopDB.close((err) => {
        if (err) {
            console.error(err.message);
            res.sendStatus(500);
        }
        console.log("Closed the connection to laptop database.");
    });
})

app.post('/laptop', function(req, res) {
    // Get the request object
    console.log(req.body);
    let model = req.body.model;
    let cpu = req.body.cpu;
    let ram = req.body.ram;
    let storage = req.body.storage;

    let laptopDB = new sqlite.Database(LAPTOP_DB, (err) => {
        if (err) {
            console.error(err.message);
            res.sendStatus(500);
        }
        console.log("Connected to laptop database.");
    });

    // Write to the database
    laptopDB.run(`INSERT INTO laptop(model, cpu_id, ram_id, storage) VALUES(?, ?, ?, ?)`, [model, cpu, ram, storage], function(err) {
        if (err) {
            return console.log(err.message);
            res.sendStatus(500);
        }
        console.log(`Item inserted with rowid ${this.lastID}`);
    });

    laptopDB.close((err) => {
        if (err) {
            console.error(err.message);
            res.sendStatus(500);
        }
        console.log("Closed the connection to laptop database.");
    });

    res.sendStatus(200);
});

app.listen(PORT_NUMBER, function() {
    console.log("Listening on port 3000!");
})
