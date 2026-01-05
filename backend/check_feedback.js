const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('pds_requests.db');
db.all('SELECT * FROM beta_feedback', (err, rows) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(rows, null, 2));
});
