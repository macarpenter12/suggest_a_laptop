const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));

const DB_ADDRESS = 'mongodb://localhost:27017/suggest_a_laptop';
const mongoose = require('mongoose');
mongoose.connect(DB_ADDRESS, {
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





app.get('/', async(req, res) => {
    console.info(new Date().toLocaleString() + ' - GET /');
    res.sendFile('public/index.html', { root: __dirname });
});

app.get('/admin', async(req, res) => {
    console.info(new Date().toLocaleString() + ' - GET /admin');
    res.sendFile('public/admin.html', { root: __dirname });
});

app.get('/laptop', async(req, res) => {
    console.info(new Date().toLocaleString() + ' - GET /laptop');
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
    let userScores = [{
            'name': 'cpuScore',
            'score': req.body.cpuScore
        },
        {
            'name': 'ramScore',
            'score': req.body.ramScore
        },
        {
            'name': 'storageScore',
            'score': req.body.storage
        },
        {
            'name': 'battery',
            'score': req.body.battery
        }
    ];

    userScores = userScores.sort(function(a, b) { return b.score - a.score });
    
    var oldResult = await budgetSelect(req.body.budget);
    var newResult;

    for (let i = 0; i < userScores.length; i++) {
        let nextScore = userScores[i];
        switch (nextScore.name) {
            case 'cpuScore':
                newResult = await cpuSelect(oldResult, nextScore.score);
                if (newResult.length < 1) {
                    newResult = oldResult;
                }
                oldResult = newResult;
                break;
            // case "ramScore":
            //     newResult = await ramSelect(nextScore.score);
            //     break;
            // case "storageScore":
            //     newResult = await storageSelect(nextScore.score);
            //     break;
            // case "battery":
            //     newResult = await batterySelect(nextScore.score);
            //     break;
        }
    }
    newResult = selectCheapest(newResult);
    res.send(newResult);
});



app.post('/laptop', async(req, res) => {
    console.info(new Date().toLocaleString() + ' - PUT /laptop');

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


async function budgetSelect(userBudget) {
    let suggestions = await Laptop.find({
        price: { $lt: userBudget }
    });
    return suggestions;
}

async function cpuSelect(laptopSet, userScore) {
    let minScore = userScore * 800;
    let resultSet = [];
    laptopSet.forEach(function(item, index) {
        if (item.cpu_score >= minScore) {
            resultSet.push(item);
        }
    });
    return resultSet;
}

function ramSelect(userScore) {

}

function storageSelect(userScore) {

}

function batterySelect(userScore) {

}

function selectCheapest(laptops) {
    let min = laptops[0];
    laptops.forEach(function(item, index) {
        if (item.price < min.price) {
            min = item;
        }
    });
    return min;
}
