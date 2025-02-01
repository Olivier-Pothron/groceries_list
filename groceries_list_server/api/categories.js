console.log('Categories API loaded successfully');

const express = require('express');
const router = express.Router();
const mysqlPool = require('../db');

// GET CATEGORIES
router.get('/', (req, res) => {
  mysqlPool.query('SELECT * FROM groceries_categories', (err, results, fields) => {
    if (err) {
      console.error('Error executing query:', err);
      return next(err);
    }
    res.json(results);
  });
});

// DELETE CATEGORY
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  let categoryName = "";

  const nameQuery = 'SELECT item_name FROM groceries_categories WHERE id = ?';
  mysqlPool.query(nameQuery, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return next(err);
    }
    categoryName = results[0].name;
  });

  // Formatting the request time to a more readable format
  const formattedRequestTime = new Date(req.requestTime).toLocaleString();

  const deleteQuery = 'DELETE FROM groceries_categories WHERE id = ?';
  mysqlPool.query(deleteQuery, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return next(err);
    }
    console.log(`${categoryName} (id#${id}) removed from list at `+
                `${formattedRequestTime}`);
    res.status(200).json({ success: true });
  });
});

// SYNC UP
router.post('/syncup', (req, res) => {
  const categories = req.body;

  const values = categories.map( category => [category.name] );

  const query = 'INSERT IGNORE INTO groceries_categories(name) VALUES ?;';

  mysqlPool.query( query, [values], (err, results) => {
    if (err) {
      console.error('Error executing categories INSERT query:', err);
      res.status(500).json({ error: 'Database error' });
      return next(err);
    }
    console.log("Synced categories table to Server.", results);
    res.status(200).json({ success: true });
  });
});

// Export the router so it can be used in server.js
module.exports = router;
