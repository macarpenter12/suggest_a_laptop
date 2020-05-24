/*global axios*/

var laptopList = document.getElementById("laptopList");
var cpuList = document.getElementById("cpuList");
var ramList = document.getElementById("ramList");
updateLaptopList();
updateCpuList();
updateRamList();

function updateLaptopList() {
    laptopList.innerHTML = "";
    axios.get('/laptop')
        .then(function(res) {
            let rows = res.data;
            rows.forEach(function(item, index) {
                laptopList.innerHTML += `${item.model}<br>`;
            });
        });
}

function updateCpuList() {
    laptopList.innerHTML = "";
    axios.get('/cpu')
        .then(function(res) {
            let rows = res.data;
            rows.forEach(function(item, index) {
                cpuList.innerHTML += `${item.cpu_id}<br>`;
            });
        });
}

function updateRamList() {
    laptopList.innerHTML = "";
    axios.get('/ram')
        .then(function(res) {
            let rows = res.data;
            rows.forEach(function(item, index) {
                ramList.innerHTML += `${item.ram_id}<br>`;
            });
        });
}

function submitLaptop() {
    let price = document.getElementById("price").value;
    let model = document.getElementById("model").value;
    let cpu = document.getElementById("cpu").value;
    let ram = document.getElementById("ram").value;
    let storage = document.getElementById("storage").value;
    let battery = document.getElementById("battery").value;

    axios.put('/laptop', {
            price: price,
            model: model,
            cpu_id: cpu,
            ram_id: ram,
            storage: storage,
            battery: battery
        })
        .then(function(res) {
            console.info(res);
        })
        .catch(function(err) {
            console.log(err);
        });
    updateLaptopList();
}

function deleteLaptop() {
    let model = document.getElementById("model").value;
    console.log(`/laptop/${model}`);
    axios.delete(`/laptop/${model}`)
    .then(function(res) {
        console.info(res);
    })
    .catch(function(err) {
        console.log(err);
    });
    updateLaptopList();
}

function submitCpu() {
    let cpuID = document.getElementById("cpu_id").value;
    let cpuScore = document.getElementById("cpu_score").value;

    axios.put('/cpu', {
            cpu_id: cpuID,
            score: cpuScore
        })
        .then(function(res) {
            console.info(res);
        })
        .catch(function(err) {
            console.log(err);
        });
}

function submitRam() {
    let ramID = document.getElementById("ram_id").value;
    let ramCapacity = document.getElementById("ram_capacity").value;
    let ramSpeed = document.getElementById("ram_speed").value;

    axios.put('/ram', {
            ram_id: ramID,
            capacity: ramCapacity,
            speed: ramSpeed
        })
        .then(function(res) {
            console.info(res);
        })
        .catch(function(err) {
            console.log(err);
        });
}
