const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pds_requests.db');
db.all('SELECT count(*) as c FROM requests', (err, rows) => {
    if (err) console.error(err);
    else console.log('Requests count:', rows);
});
