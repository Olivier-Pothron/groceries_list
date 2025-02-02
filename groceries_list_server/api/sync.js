console.log('Sync API loaded successfully');

const express = require('express');
const router = express.Router();
const mysqlPool = require('../db');

// SYNC UP
router.post('/syncup/categories', (req, res) => {
  const categories = req.body;

  const values = categories.map( category => [category.name] );

  const query = 'INSERT IGNORE INTO groceries_categories(name) VALUES ?;';

  mysqlPool.query( query, [values], (err, results) => {
    if (err) {
      console.error('Error executing categories INSERT query:', err);
      res.status(500).json({ error: 'Database error' });
      return next(err);
    }
    console.log("Synced categories table to Server.\n", results);
    res.status(200).json({ success: true });
  });
});

// SYNC UP GROCERIES
router.post('/syncup/groceries', (req, res) => {
  const groceries = req.body;

  // Calling mapping function to match category name to right mysql id
  getCategoryMap((categoryMap) => {
    const values = groceries.map( g => [
      g.name,
      categoryMap[g.category] || null,
      g.toBeBought
    ]);

    const query = `INSERT INTO groceries_list (name, category_id, to_be_bought)
                  VALUES ?
                  ON DUPLICATE KEY UPDATE
                  to_be_bought = VALUES(to_be_bought)
                  `;

    mysqlPool.query( query, [values], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Database error' });
        return next(err);
      }
      console.log("Synced groceries table to Server.\n", results);
      res.status(200).json({ success: true });
    });
  });
});

// FUNCTIONS
const getCategoryMap = (callback) => {
  const query = 'SELECT id, name FROM groceries_categories';

  mysqlPool.query( query, (err, results) => {
    if (err) {
      console.error('Error executing categories SELECT query:', err);
      res.status(500).json({ error: 'Database error' });
      return next(err);
    }
    const categoryMap = {};
    results.forEach(row => {
      categoryMap[row.name] = row.id;
    });
    callback(categoryMap);
  });
}

// Export the router so it can be used in server.js
module.exports = router;
