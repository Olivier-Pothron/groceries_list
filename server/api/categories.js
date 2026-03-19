console.log('Categories API loaded');

const express = require('express');
const router = express.Router();
const mysqlPool = require('../db');

// GET CATEGORIES
router.get('/', async(req, res, next) => {
  try {
    const [results] = await mysqlPool.promise().query('SELECT * FROM category');
    res.json(results);
  } catch(err) {
    console.error('Error executing query:', err);
    next(err);
  }
});

// ADD CATEGORY
router.post('/', async(req, res) => {
  const { newCategoryName } = req.body;

  // Validate categoryName is not empty
  if (!newCategoryName) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const insertQuery = 'INSERT INTO category(name) VALUES (?) RETURNING id';

  try {
    const [insertResults] = await mysqlPool.promise().query(insertQuery, [newCategoryName.toLowerCase()]);

    const newCategoryId = insertResults[0].id;

    const newCategory = { id: newCategoryId,
                          name: newCategoryName.toLowerCase()};

    // Formatting the request time to a more readable format
    const formattedRequestTime = new Date(req.requestTime).toLocaleString();

    console.log(`${newCategoryName.toLowerCase()} inserted into category table with `+
                `ID ${newCategoryId} ` +
                `at ${formattedRequestTime}`);

    res.status(200).json(newCategory);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error(error.code, 'Error: Category already exists!', );
      res.status(409).json( { error: 'Category already exists!'});
    } else {
      console.log('Error adding category: ', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
});

router.delete('/:id', async(req, res) => {
  const id = req.params.id;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
  return res.status(400).json({ error: 'Invalid ID format' });
  }

  const nameQuery = 'SELECT name FROM category WHERE id = ?';
  const deleteQuery = 'DELETE FROM category WHERE id = ?';

  try {
    const [nameResult] = await mysqlPool.promise().query(nameQuery, [id]);

    if (!nameResult.length) {
    return res.status(404).json({ error: 'Category not found' });
    }

    const categoryName = nameResult[0].name;

    await mysqlPool.promise().query(deleteQuery, [id]);

    // Formatting the request time to a more readable format
    const formattedRequestTime = new Date(req.requestTime).toLocaleString();

    console.log(`${categoryName} (id#${id}) removed from list at `+
                `${formattedRequestTime}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error deleting category: ", error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Export the router so it can be used in server.js
module.exports = router;
