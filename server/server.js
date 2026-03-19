const express = require('express');
const mysqlPool = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config(path.join(__dirname, '.env'));

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const categoriesRoutes = require('./api/categories');
const groceriesRoutes = require('./api/groceries');
const syncRoutes = require('./api/sync');

const app = express();

// Serve static files correctly
app.use(express.static(path.join(__dirname, 'public')));
// /?\ '__dirname' is a special variable representing the absolute path of
// the current directory where my script is located. /?\

// Set the correct views directory
app.set('views', path.join(__dirname, 'views'));

// Set the template engine (if using EJS, Pug, etc.) /|\NOT REALLY NECESSARY /|\
app.set('view engine', 'ejs'); // or 'pug', 'hbs', etc.

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

app.get('/test', (req, res) => {
  res.send('TEST OK');
  console.log("__dirname : ", __dirname);
});

app.get('/admin', (req, res) => {
  const password = req.query.password;

  if (password === ADMIN_PASSWORD) {
    res.send("<html><head><title>Admin Panel</title></head><body><h1>Admin Panel</h1></body></html>");
  } else {
    res.status(401).send('Invalid password');
  }
});

app.get('/groceries', async(req, res, next) => {
  let query = `
      SELECT  g_list.id,
              g_list.name AS name,
              g_list.to_be_bought,
              g_cat.name AS category,
              g_cat.id AS category_id
      FROM    grocery AS g_list
      RIGHT JOIN    category AS g_cat
      ON      g_list.category_id = g_cat.id;
      `;

  try {
    const [results] = await mysqlPool.promise().query(query);

    const { groceriesByCategory, categoriesIdMap } = results.reduce( (acc, grocery) => {
      const  { name, category: categoryName, category_id } = grocery;

      if(!acc.categoriesIdMap[categoryName]) {
        acc.categoriesIdMap[categoryName] = category_id
      }

      if (name) {
        if (!acc.groceriesByCategory[categoryName]) {
          acc.groceriesByCategory[categoryName] = [];
        }
        acc.groceriesByCategory[categoryName].push(grocery);
      }

      return acc;
    }, { groceriesByCategory: {}, categoriesIdMap: {} } );

    console.log(groceriesByCategory);

    res.render('groceries', { groceries: groceriesByCategory, categories: categoriesIdMap });
    console.log("Loaded groceries page.");

  } catch (error) {
    console.log('Error getting groceries: ', error);
    return next(error);
  }
});

app.get('/myList', async(req, res, next) => {
  let query = 'SELECT * FROM grocery WHERE to_be_bought = 1';

  try {
    const [results] = await mysqlPool.promise().query(query);

    res.json(results);
  } catch (error) {
    console.log('Error getting groceries: ', error);
    return next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error: ', err.sqlMessage);
  res.status(500).send('Internal Server Error');
});

// Handle graceful shutdown
let isShuttingDown = false;

process.on('SIGINT', async() => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('Received SIGINT. Closing MySQL connection pool...');
  try {
    await mysqlPool.end();
    console.log('MySQL connection pool closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MySQL connection pool:', err);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});
