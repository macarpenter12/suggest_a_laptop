const sqlite3 = require('sqlite3').verbose();

function suggestion(userPref) {
    let budget = userPref.budget;
    let userCpuScore = userPref.user_cpu_score;
    let userRamScore = userPref.user_ram_score;
    let userStorageScore = userPref.user_storage_score;
    let userBatteryScore = userPref.user_battery_score;

    let db = new sqlite3.Database('./db/laptops.db');
    let sql = `CREATE VIEW budget_view AS SELECT * FROM laptop WHERE price <= ?`;
    db.run(sql, budget, function(err) {
        if (err) {
            console.log(err.message);
            throw err;
        }
        console.log(`Created budget_view for all laptops under $${budget}`);
    });
    db.close();

    return [userCpuScore, userRamScore, userStorageScore, userBatteryScore].sort(function(a, b) {
            // Sort highest to lowest
            return b - a;
        }
    );
}
