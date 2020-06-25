/*global Vue */
/*global axios*/

var App = new Vue({
    el: '#app',
    data: {
        userBudget: 0,
        userCpuScore: 0,
        userRamScore: 0,
        userStorageScore: 0,
        userBatteryScore: 0,
        recommendedLaptop: {
            price: 0,
            model: '',
            cpu_score: 0,
            ram_capacity: 0,
            storage: 0,
            battery: 0
        },
        errorMessages: []
    },
    methods: {
        async getUserPref() {
            axios.post('/suggestion', {
                    budget: this.userBudget,
                    cpuScore: this.userCpuScore,
                    ramScore: this.userRamScore,
                    storage: this.userStorageScore,
                    battery: this.userBatteryScore
                })
                .then(res => {
                    console.log('response:', res.data);
                    let result = res.data.result;
                    console.log(result);
                    this.recommendedLaptop = {
                        price: result.price,
                        model: result.model,
                        cpu_score: result.cpu_score,
                        ram_capacity: result.ram_capacity,
                        storage: result.storage,
                        battery: result.battery
                    };
                    this.errorMessages = res.data.errors;
                })
                .catch(function(err) {
                    console.log(err);
                });
                
                
        }
    }
});
