const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/suggest_a_laptop', {
    useNewUrlParser: true
});

const laptopSchema = new mongoose.Schema({
    model: String,
    price: Number,
    cpu_score: Number,
    ram_capacity: Number,
    storage: Number,
    battery: Number
});
const Laptop = mongoose.model('Laptop', laptopSchema);

const PORT_NUMBER = 3000;
const VIEW_NAME = 'suggestion_view';





app.get('/', async(req, res) => {
    console.info(new Date().toLocaleString() + " - GET /");
    res.sendFile('public/index.html', { root: __dirname });
});

app.get('/admin', async(req, res) => {
    console.info(new Date().toLocaleString() + " - GET /admin");
    res.sendFile('public/admin.html', { root: __dirname });
});

app.get('/laptop', async(req, res) => {
    console.info(new Date().toLocaleString() + " - GET /laptop");
    try {
        let laptops = await Laptop.find();
        res.send(laptops);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});



app.post('/suggestion', async(req, res) => {
    let userScores = [
        {
            "name": "cpuScore",
            "score": req.body.cpuScore
        },
        {
            "name": "ramScore",
            "score": req.body.ramScore
        },
        {
            "name": "storageScore",
            "score": req.body.storage
        },
        {
            "name": "battery",
            "score": req.body.battery
        }
    ];
    
    userScores = userScores.sort(function(a, b) { return b.score - a.score });
    res.send(userScores);
    
    for (let i = 0; i < userScores.length; i++) {
        let nextScore = userScores[i];
        var oldResult;
        var newResult;
        switch (nextScore) {
            case "cpuScore":
                newResult = await cpuSelect(nextScore.score);
                // if newResult is empty...
                // send back oldResult
                break;
            case "ramScore":
                newResult = await ramSelect(nextScore.score);
                break;
            case "storageScore":
                newResult = await storageSelect(nextScore.score);
                break;
            case "battery":
                newResult = await batterySelect(nextScore.score);
                break;
        }
        oldResult = newResult;
    }
});



app.post('/laptop', async(req, res) => {
    console.info(new Date().toLocaleString() + " - PUT /laptop");

    const laptop = new Laptop({
        model: req.body.model,
        price: req.body.price,
        cpu_score: req.body.cpu_score,
        ram_capacity: req.body.ram_capacity,
        storage: req.body.storage,
        battery: req.body.battery
    });
    try {
        await laptop.save();
        res.send(`Successfully added '${laptop}' to the database.`);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});





app.delete('/laptop/:model', async(req, res) => {
    const laptop = new Laptop({
        model: req.params.model
    });
    try {
        await Laptop.deleteOne(laptop);
        res.send(`Successfully removed '${laptop}' from the database.`);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});

app.listen(PORT_NUMBER, function() {
    console.log('Listening on port ' + PORT_NUMBER + '!');
});




async function cpuSelect(userScore) {
    
}

function ramSelect(userScore) {
    
}

function storageSelect(userScore) {
    
}

function batterySelect(userScore) {
    
}
