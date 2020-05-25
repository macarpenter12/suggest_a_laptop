/*global axios*/

var laptopList = document.getElementById("laptopList");
var cpuList = document.getElementById("cpuList");
var ramList = document.getElementById("ramList");
updateAllLists();

async function updateLaptopList() {
    laptopList.innerHTML = "";
    await axios.get('/laptop')
        .then(function(res) {
            let rows = res.data;
            rows.forEach(function(item, index) {
                laptopList.innerHTML += `${item.model}<br>`;
            });
        });
}

async function updateCpuList() {
    cpuList.innerHTML = "";
    await axios.get('/cpu')
        .then(function(res) {
            let rows = res.data;
            rows.forEach(function(item, index) {
                cpuList.innerHTML += `${item.cpu_id}<br>`;
            });
        });
}

async function updateRamList() {
    ramList.innerHTML = "";
    await axios.get('/ram')
        .then(function(res) {
            let rows = res.data;
            rows.forEach(function(item, index) {
                ramList.innerHTML += `${item.ram_id}<br>`;
            });
        });
}

async function updateAllLists() {
    updateLaptopList();
    updateCpuList();
    updateRamList();
}

async function submitLaptop() {
    let price = document.getElementById("price").value;
    let model = document.getElementById("model").value;
    let cpu = document.getElementById("cpu").value;
    let ram = document.getElementById("ram").value;
    let storage = document.getElementById("storage").value;
    let battery = document.getElementById("battery").value;

    await axios.put('/laptop', {
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

async function deleteLaptop() {
    let model = document.getElementById("model").value;
    console.log(`DELETE /laptop/${model}`);
    await axios.delete(`/laptop/${model}`)
        .then(function(res) {
            console.info(res);
        })
        .catch(function(err) {
            console.log(err);
        });
    updateLaptopList();
}

async function submitCpu() {
    let cpuID = document.getElementById("cpu_id").value;
    let cpuScore = document.getElementById("cpu_score").value;

    await axios.put('/cpu', {
            cpu_id: cpuID,
            score: cpuScore
        })
        .then(function(res) {
            console.info(res);
        })
        .catch(function(err) {
            console.log(err);
        });
    updateCpuList();
}

async function deleteCpu() {
    let cpuID = document.getElementById("cpu_id").value;
    console.log(`DELETE /cpu/${cpuID}`);
    await axios.delete(`/cpu/${cpuID}`)
        .then(function(res) {
            console.info(res);
        })
        .catch(function(err) {
            console.log(err);
        });
    updateCpuList();
}

async function submitRam() {
    let ramID = document.getElementById("ram_id").value;
    let ramCapacity = document.getElementById("ram_capacity").value;
    let ramSpeed = document.getElementById("ram_speed").value;

    await axios.put('/ram', {
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
    updateRamList();
}

async function deleteRam() {
    let ramID = document.getElementById("ram_id");
    console.log(`DELETE /ram/${ramID}`);
    await axios.delete(`/ram/${ramID}`)
        .then(function(res) {
            console.info(res);
        })
        .catch(function(err) {
            console.log(err);
        });
    updateRamList();
}
