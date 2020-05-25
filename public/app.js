const axios = require('axios').default;

function getUserPref()
{
    var budgetID = document.getElementById("budget");
    var batValID = document.getElementById("batteryVal");
    var cpuValID = document.getElementById("cpuVal");
    var ramValID = document.getElementById("ramVal");
    var storValID = document.getElementById("storageVal");
   
    console.log("cpuValID = " + cpuValID.value);
    console.log("ramValID = " + ramValID.value);
    console.log("batteryValID = " + batValID.value);
    console.log("budget = " + budgetID.value);
    
    axios.put('/suggestion', {
            budget: budgetID.value,
            user_cpu_score: cpuValID.value,
            user_ram_score: ramValID.value,
            user_storage_score: storValID.value,
            user_battery_score: user_battery_score
        })
        .then(function(res) {
            console.info(res);
        })
        .catch(function(err) {
            console.log(err);
        });
}
