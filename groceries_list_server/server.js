const express = require('express');
const mysqlPool = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const categoriesRoutes = require('./api/categories');
const groceriesRoutes = require('./api/groceries');
const syncRoutes = require('./api/sync');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parses req automatically
app.use(express.json());

// Middleware to add request timestamp
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

// API routes
app.use('/api/categories', categoriesRoutes);
app.use('/api/groceries', groceriesRoutes);
app.use('/api/sync', syncRoutes);

app.set("view engine", "ejs"); // Set EJS as the templating engine

app.use(express.static('public')); // Serve static files from the 'public' directory


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

app.get('/groceries', (req, res) => {
  let query = `
      SELECT  g_list.id,
              g_list.name AS name,
              g_list.to_be_bought,
              g_cat.name AS category,
              g_list.category_id AS category_id
      FROM    groceries_list AS g_list
      LEFT JOIN    groceries_categories AS g_cat
      ON      g_list.category_id = g_cat.id;
      `;

  mysqlPool.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return next(err);
    }
    res.render('groceries', { groceries: results });
    console.log("Loaded groceries page.");
  });
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
