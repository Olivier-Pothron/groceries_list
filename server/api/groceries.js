console.log("Groceries API loaded");

const express = require("express");
const router = express.Router();
const mysqlPool = require("../db");

// GET GROCERIES
router.get("/", (req, res, next) => {
  const query = ` SELECT g.id, g.name, g.to_be_bought, c.name AS category
                  FROM grocery AS g
                  LEFT JOIN category AS c
                  ON g.category_id = c.id`;
  mysqlPool.query(query, (err, results, fields) => {
    if (err) {
      console.error("Error executing query:", err);
      return next(err);
    }
    res.json(results);
  });
});

// ADD GROCERY
router.post('/', async(req, res) => {
  let { newGroceryName, categoryId } = req.body;

  if (!newGroceryName) {
    return res.status(400).json({ error: "Item name is required" });
  }
  categoryId = categoryId || null;

  const insertQuery = `
    INSERT INTO grocery(name, category_id)
    VALUES (?, ?)
    RETURNING id;
    `;

  const returnQuery = `
    SELECT
    g.id,
    g.name,
    c.name AS category,
    c.id AS category_id
    FROM grocery AS g
    LEFT JOIN category AS c
    ON g.category_id = c.id
    WHERE g.id = ?;
    `;

    try {
      const params = [newGroceryName, categoryId];
      const [insertResults] = await mysqlPool.promise().query(insertQuery, params);

      const insertId = insertResults[0].id
      const [returnResult] = await mysqlPool.promise().query(returnQuery, insertId);

      const { name, id, category, category_id } = returnResult[0];
      const newGrocery = {
        id: id,
        name: name,
        toBeBought: 0,
        category: category,
        categoryId: category_id
      }

      // Formatting the request time to a more readable format
      const formattedRequestTime = new Date(req.requestTime).toLocaleString();

      console.log(
        `${newGrocery.name} inserted into grocery List with ` +
        `ID ${newGrocery.id} and Category ${newGrocery.category} ` +
        `at ${formattedRequestTime}`
      );

      res.status(200).json(newGrocery);
  } catch (error) {
    console.log('Error adding grocery: ', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE GROCERY
router.delete('/:id', async(req, res) => {
  const groceryId = req.params.id;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(groceryId)) {
  return res.status(400).json({ error: 'Invalid ID format' });
  }

  const nameQuery = `
  SELECT
  g.name,
  c.name AS category
  FROM grocery AS g
  JOIN category AS c
  ON g.category_id = c.id
  WHERE g.id = ?;
  `
  const deleteQuery = "DELETE FROM grocery WHERE id = ?";

  try {
    const [nameResult] = await mysqlPool.promise().query(nameQuery, groceryId);

    if (!nameResult.length) {
      return res.status(404).json({error: 'grocery not found!' });
    }

    const { name: groceryName, category } = nameResult[0];

    await mysqlPool.promise().query(deleteQuery, groceryId);

    // Formatting the request time to a more readable format
    const formattedRequestTime = new Date(req.requestTime).toLocaleString();

    console.log(
      `${groceryName} (id#${groceryId}) from category ${category} ` +
      `removed from list at${formattedRequestTime}`
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.log('Error deleting grocery: ', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// TOGGLE TO_BE_BOUGHT VALUE
router.patch('/:id', async(req, res) => {
  const groceryId = req.params.id;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(groceryId)) {
  return res.status(400).json({ error: 'Invalid ID format' });
  }

  const selectQuery = `SELECT name, to_be_bought FROM grocery WHERE id = ?`
  const updateQuery = `
    UPDATE grocery
    SET to_be_bought = NOT to_be_bought
    WHERE id = ?;`
    ;

  try {
    const [nameResult] = await mysqlPool.promise().query(selectQuery, groceryId);
    let { name: groceryName, to_be_bought: toBeBought } = nameResult[0];

    const [updateResults] = await mysqlPool.promise().query(updateQuery, groceryId);

    if (updateResults.affectedRows === 0) {
      return res.status(404).json({error: 'grocery not found'});
    }

    toBeBought = toBeBought ? 0 : 1;

    console.log(`${groceryName} / To be bought : ${toBeBought}`);
    res.status(200).json({ toBeBought });
  } catch (error) {
    console.error("Error updating grocery:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Export the router so it can be used in server.js
module.exports = router;
