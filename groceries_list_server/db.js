console.log('DB module loaded successfully');

const mysql = require('mysql2');

require('dotenv').config();
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;

// SQL Connection
const mysqlPool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: 'groceries'
});

module.exports = mysqlPool; // Export the pool so other files can use it
