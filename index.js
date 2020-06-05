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
    cpu_id: String,
    cpu_score: Number,
    ram: Number,
    storage: Number,
    battery: Number
});
const Laptop = mongoose.model('Laptop', laptopSchema);

const PORT_NUMBER = 3000;





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
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});





app.post('/laptop', async(req, res) => {
    console.info(new Date().toLocaleString() + " - PUT /laptop");
    
    const laptop = new Laptop({
       model: req.body.model,
       price: req.body.price,
       cpu_id: req.body.cpu_id,
       cpu_score: req.body.cpu_score,
       ram: req.body.ram_capacity,
       storage: req.body.storage,
       battery: req.body.battery
    });
    try {
        await laptop.save();
        res.send(`Successfully added '${laptop}' to the database.`);
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});





app.delete('/laptop/:model', async(req, res) => {
   const laptop = new Laptop({
       model: req.params.model
   }) ;
   try {
       await Laptop.deleteOne(laptop);
       res.send(`Successfully removed '${laptop}' from the database.`);
   } catch (error) {
       console.log(error);
       res.status(500).send(error.message);
   }
});

app.listen(PORT_NUMBER, function() {
    console.log('Listening on port ' + PORT_NUMBER + '!');
});
