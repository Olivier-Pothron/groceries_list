console.log('Groceries API loaded successfully');

const express = require('express');
const router = express.Router();
const mysqlPool = require('../db');

// GET GROCERIES
router.get('/', (req, res) => {
  const query = ` SELECT g.id, g.name, g.to_be_bought, c.name AS category
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

// ADD GROCERY
router.post('/', (req, res) => {
  let { itemName, categoryId } = req.body;

  categoryId = categoryId || null;

  // Validate itemName is not empty
  if (!itemName) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  const insertQuery = 'INSERT INTO groceries_list(name, category_id) VALUES (?, ?)';
  mysqlPool.query(insertQuery, [itemName, categoryId], (err, insertResults) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return next(err);
    }

    const newItemId = insertResults.insertId;
    const categoryQuery = `SELECT g.id, g.name, g.to_be_bought, c.name AS category
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

// DELETE GROCERY
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  let itemName = "";

  const nameQuery = 'SELECT name FROM groceries_list WHERE id = ?';
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

// TOGGLE TO_BE_BOUGHT VALUE
router.put('/:id', (req, res) => {
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

    // Update the to_be_bought value
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

// Export the router so it can be used in server.js
module.exports = router;
