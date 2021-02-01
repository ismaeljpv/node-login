const Pool = require('pg').Pool;

const dbConnection = new Pool({
    user: 'admin',
    password: 'admin',
    database: 'dbblog',
    host: 'localhost',
    port: '5432'
});

module.exports = dbConnection;