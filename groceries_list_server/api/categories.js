console.log('Categories API loaded successfully');

const express = require('express');
const router = express.Router();
const mysqlPool = require('../db');

// GET CATEGORIES
router.get('/', (req, res) => {
  mysqlPool.query('SELECT * FROM categories', (err, results, fields) => {
    if (err) {
      console.error('Error executing query:', err);
      return next(err);
    }
    res.json(results);
  });
});

// ADD CATEGORY
router.post('/', (req, res) => {
  const { newCategoryName } = req.body;

  // Validate categoryName is not empty
  if (!newCategoryName) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const insertQuery = 'INSERT INTO categories(name) VALUES (?)';
  mysqlPool.query(insertQuery, [newCategoryName.toLowerCase()], (err, insertResults) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).json( { error: 'Category already exists!'});
        console.error(err.code, 'Error: Category already exists!', );
      } else {
        res.status(500).json({ error: 'Database error' });
      }
      return;
    }

    const newCategoryId = insertResults.insertId;
    const newCategory = { id: newCategoryId,
                          name: newCategoryName.toLowerCase()};

    // Formatting the request time to a more readable format
    const formattedRequestTime = new Date(req.requestTime).toLocaleString();

    console.log(`${newCategoryName.toLowerCase()} inserted into Categories List with `+
                `ID ${newCategoryId} ` +
                `at ${formattedRequestTime}`);
    res.status(200).json(newCategory);
  });
});

// DELETE CATEGORY
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  let categoryName = "";

  const nameQuery = 'SELECT item_name FROM categories WHERE id = ?';
  mysqlPool.query(nameQuery, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    categoryName = results[0].name;
  });

  // Formatting the request time to a more readable format
  const formattedRequestTime = new Date(req.requestTime).toLocaleString();

  const deleteQuery = 'DELETE FROM categories WHERE id = ?';
  mysqlPool.query(deleteQuery, [id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    console.log(`${categoryName} (id#${id}) removed from list at `+
                `${formattedRequestTime}`);
    res.status(200).json({ success: true });
  });
});

// Export the router so it can be used in server.js
module.exports = router;
