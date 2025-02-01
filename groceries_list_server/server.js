const express = require('express');
const mysql = require('mysql2');
const mysqlPool = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;

const categoriesRoutes = require('./api/categories');
const groceriesRoutes = require('./api/groceries');

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(express.json()); // parses req automatically
app.use('/api/categories', categoriesRoutes);
app.use('/api/groceries', groceriesRoutes);



// Serve static files from the 'public' directory
// ** Useless now, might put pictures in public directory for shit & giggles **
app.use(express.static('public'));

app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

// ** Middleware to authenticate JWT **
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// };

// Define a route to handle GET requests to the root URL
app.get('/', (req, res) => {
  res.send('This is the groceries server.');
});

app.get('/admin', (req, res) => {
  const password = req.query.password;

  if (password === ADMIN_PASSWORD) {
    res.send("<html><head><title>Admin Panel</title></head><body><h1>Admin Panel</h1></body></html>");
  } else {
    res.status(401).send('Invalid password');
  }
});

app.get('/myList', (req, res) => {
  mysqlPool.query('SELECT * FROM groceries_list WHERE to_be_bought = 1', (err, results, fields) => {
    if (err) {
      console.error('Error executing query:', err);
      return next(err);
    }
    res.json(results);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing MySQL connection pool...');
  mysqlPool.end((err) => {
    if (err) {
      console.error('Error closing MySQL connection pool:', err);
    }
    console.log('MySQL connection pool closed.');
    process.exit(0); // Exit the process after closing the connection pool
  });
});

const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
