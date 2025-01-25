const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const app = express();

app.use(express.json());

// Enable CORS for all routes
app.use(cors());

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

// SQL Connection
const mysqlPool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'oliv',
  password: 'S@mPyJ4M!',
  database: 'groceries'
});

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
  const query = ` SELECT g.id, g.item_name, g.to_be_bought, c.name AS category
                  FROM groceries_list AS g
                  LEFT JOIN groceries_categories AS c
                  ON g.category_id = c.id`;
  mysqlPool.query(query, (err, results, fields) => {
      if (err) {
        console.error('Error executing query:', err);
        return next(err);
      }
      res.json(results);
    });
});

app.get('/categories', (req, res) => {
  mysqlPool.query('SELECT * FROM groceries_categories', (err, results, fields) => {
      if (err) {
        console.error('Error executing query:', err);
        return next(err);
      }
      res.json(results);
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

app.put('/groceries/:id', (req, res) => {
  const id = req.params.id;
  const { toBeBought } = req.body;

  // Check if id exists in the database
  const idQuery = 'SELECT id FROM groceries_list WHERE id = ?';
  mysqlPool.query(idQuery, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return next(err);
    }
    if (!results.length) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    // Update the tobebought value
    const updateQuery = 'UPDATE groceries_list SET to_be_bought = ? WHERE id = ?';
    mysqlPool.query(updateQuery, [toBeBought, id], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Database error' });
        return next(err);
      }
      console.log(`Item #${id} / To be bought : ${toBeBought}`);
      res.status(200).json({ success: true });
    });
  });
});

app.post('/groceries', (req, res) => {
  let { itemName, categoryId } = req.body;

  categoryId = categoryId || null;

  // Validate itemName is not empty
  if (!itemName) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  const insertQuery = 'INSERT INTO groceries_list(item_name, category_id) VALUES (?, ?)';
  mysqlPool.query(insertQuery, [itemName, categoryId], (err, insertResults) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return next(err);
    }

    const newItemId = insertResults.insertId;
    const categoryQuery = `SELECT g.id, g.item_name, g.to_be_bought, c.name AS category
                          FROM groceries_list AS g
                          LEFT JOIN groceries_categories AS c
                          ON g.category_id = c.id
                          WHERE g.id = LAST_INSERT_ID();
                          `;
    mysqlPool.query(categoryQuery, (err, queryResults) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      const categoryName = queryResults[0].category;
      const newItem = { id: newItemId,
                        item_name: itemName,
                        category: categoryName,
                        to_be_bought: 0 };

      // Formatting the request time to a more readable format
      const formattedRequestTime = new Date(req.requestTime).toLocaleString();

      console.log(`${itemName} inserted into Groceries List with `+
                  `ID ${newItemId} and Category ${categoryName} ` +
                  `at ${formattedRequestTime}`);
      res.status(200).json(newItem);
    });
  });
});

app.delete('/groceries/:id', (req, res) => {
  const id = req.params.id;
  let itemName = "";

  const nameQuery = 'SELECT item_name FROM groceries_list WHERE id = ?';
  mysqlPool.query(nameQuery, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return next(err);
    }
    itemName = results[0].item_name;
  });

  // Formatting the request time to a more readable format
  const formattedRequestTime = new Date(req.requestTime).toLocaleString();

  const deleteQuery = 'DELETE FROM groceries_list WHERE id = ?';
  mysqlPool.query(deleteQuery, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return next(err);
    }
    console.log(`${itemName} (id#${id}) removed from list at `+
                `${formattedRequestTime}`);
    res.status(200).json({ success: true });
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
