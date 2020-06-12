/*global Vue */
/*global axios*/

var App = new Vue({
    el: '#app',
    data: {
        userBudget: 0,
        userCpuScore: 0,
        userRamScore: 0,
        userStorageScore: 0,
        userBatteryScore: 0
    },
    methods: {
        async getUserPref() {
            var budgetID = document.getElementById("budget");
            var batValID = document.getElementById("batteryVal");
            var cpuValID = document.getElementById("cpuVal");
            var ramValID = document.getElementById("ramVal");
            var storValID = document.getElementById("storageVal");
            var recommendation = document.getElementById("recommendation");

            recommendation.innerHTML = "";

            axios.post('/suggestion', {
                    budget: budgetID.value,
                    cpuScore: cpuValID.value,
                    ramScore: ramValID.value,
                    storage: storValID.value,
                    battery: batValID.value
                })
                .then(function(res) {
                    console.log('response:', res.data);
                    let resLaptop = res.data.result;
                    let errorMessages = res.data.errors;

                    errorMessages.forEach(function(item, index) {
                        recommendation.innerHTML += item + '<br>';
                    });

                    recommendation.innerHTML +=
                        `<h1>${resLaptop.model}</h1>
                            <ul>
                                <li>$${resLaptop.price}</li>
                                <li>${resLaptop.cpu_score} CPU score index <a href="https://www.cpubenchmark.net/">(Passmark)</a></li>
                                <li>${resLaptop.ram_capacity} GB of memory</li>
                                <li>${resLaptop.storage} GB of storage space</li>
                                <li>${resLaptop.battery} hours of battery life</li>
                            </ul>`
                })
                .catch(function(err) {
                    console.log(err);
                });
        }
    }
});
