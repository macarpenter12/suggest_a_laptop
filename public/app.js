/*global axios*/

function getUserPref()
{
    var budgetID = document.getElementById("budget");
    var batValID = document.getElementById("batteryVal");
    var cpuValID = document.getElementById("cpuVal");
    var ramValID = document.getElementById("ramVal");
    var storValID = document.getElementById("storageVal");
   
    // console.log("cpuValID = " + cpuValID.value);
    // console.log("ramValID = " + ramValID.value);
    // console.log("batteryValID = " + batValID.value);
    // console.log("budget = " + budgetID.value);
    
    axios.put('/suggestion', {
            budget: budgetID.value,
            cpuScore: cpuValID.value,
            ramScore: ramValID.value,
            storage: storValID.value,
            battery: batValID.value
        })
        .then(function(res) {
            console.info('response' + res);
        })
        .catch(function(err) {
            console.log(err);
        });
}
