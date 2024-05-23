const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'softjobs',
    password: 'naaya7295',
    allowExitOnIdle: true,
});

module.exports = { pool };