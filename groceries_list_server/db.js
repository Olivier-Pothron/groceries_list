console.log('DB module loaded successfully');

const mysql = require('mysql2');

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;

// SQL Connection
const mysqlPool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: 'groceries_list'
});

module.exports = mysqlPool; // Export the pool so other files can use it
