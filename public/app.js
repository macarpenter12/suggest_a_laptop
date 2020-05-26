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

/*
SELECT * FROM laptop l
               JOIN cpu c ON l.cpu_id = c.cpu_id
               JOIN ram r ON l.ram_id = r.ram_id
              WHERE price < 1200
                AND score > 1 * (SELECT MAX(score) FROM cpu) / 10
                AND capacity > 4
                AND speed > 1000
                AND storage > 100 * 1
                AND battery > 1
             ORDER BY price

SELECT MAX(score) max_score, MAX(speed) max_speed, MIN(speed) min_speed
       FROM cpu
       JOIN ram


*/