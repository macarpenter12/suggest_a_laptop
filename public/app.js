/*global axios*/

function getUserPref()
{
    var budgetID = document.getElementById("budget");
    var batValID = document.getElementById("batteryVal");
    var cpuValID = document.getElementById("cpuVal");
    var ramValID = document.getElementById("ramVal");
    var storValID = document.getElementById("storageVal");
    var recommendation = document.getElementById("recommendation");
   
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
            console.log('response:', res.data);
            let resLaptop = res.data;
            recommendation.innerHTML = 
            `<h1>${resLaptop.model}</h1>
            <ul>
                <li>$${resLaptop.price}</li>
                <li>${resLaptop.score} CPU score index <a href="https://www.cpubenchmark.net/">(Passmark)</a></li>
                <li>${resLaptop.capacity} GB of memory at ${resLaptop.speed} MHz</li>
                <li>${resLaptop.storage} GB of storage space</li>
                <li>${resLaptop.battery} hours of battery life</li>
            </ul>
            `
        })
        .catch(function(err) {
            console.log(err);
        });
}
