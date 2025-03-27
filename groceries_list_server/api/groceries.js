console.log("Groceries API loaded");

const express = require("express");
const router = express.Router();
const mysqlPool = require("../db");

// GET GROCERIES
router.get("/", (req, res, next) => {
  const query = ` SELECT g.id, g.name, g.to_be_bought, c.name AS category
                  FROM groceries AS g
                  LEFT JOIN categories AS c
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
router.post("/", (req, res) => {
  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // <!> BELOW IS FOR HANDLING WITHOUT JAVASCRIPT <!>
  // const contentType = req.headers['content-type'];
  // if (contentType.includes('application/x-www-form-urlencoded')) {
  //   newGroceryName = req.body.newGroceryName;
  //   categoryId = req.body.categoryId;
  // } else {
  //   ({ newGroceryName, categoryId } = req.body);
  // }
  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  let { newGroceryName, categoryId } = req.body;

  categoryId = categoryId || null;

  // Validate newGroceryName is not empty
  if (!newGroceryName) {
    return res.status(400).json({ error: "Item name is required" });
  }

  const insertQuery =
    "INSERT INTO groceries(name, category_id) VALUES (?, ?)";
  mysqlPool.query(
    insertQuery,
    [newGroceryName.toLowerCase(), categoryId],
    (err, insertResults) => {
      if (err) {
        console.error("Error executing query:", err);
        if (err.code === "ER_DUP_ENTRY") {
          res
            .status(409)
            .json({ error: "Grocery already exists in category!" });
        } else {
          res.status(500).json({ error: "Database error" });
        }
        return;
      }

      const newItemId = insertResults.insertId;
      const responseQuery = `SELECT g.id, g.name, g.to_be_bought,
                          c.name AS category, c.id AS category_id
                          FROM groceries AS g
                          LEFT JOIN categories AS c
                          ON g.category_id = c.id
                          WHERE g.id = LAST_INSERT_ID();
                          `;
      mysqlPool.query(responseQuery, (err, queryResults) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Database error" });
          return;
        }

        const categoryName = queryResults[0].category;
        const categoryId = queryResults[0].category_id;
        const newItem = {
          id: newItemId,
          name: newGroceryName,
          category: categoryName,
          category_id: categoryId,
          to_be_bought: 0,
        };

        // Formatting the request time to a more readable format
        const formattedRequestTime = new Date(req.requestTime).toLocaleString();

        console.log(
          `${newGroceryName} inserted into Groceries List with ` +
            `ID ${newItemId} and Category ${categoryName} ` +
            `at ${formattedRequestTime}`
        );
        res.status(200).json(newItem);
      });
    }
  );
});

// ADD GROCERY /REVISITED\
// router.post("/", (req, res) {

// })

// DELETE GROCERY
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  let itemName = "";

  const nameQuery = "SELECT name FROM groceries WHERE id = ?";
  mysqlPool.query(nameQuery, [id], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Database error" });
      return;
    }
    itemName = results[0].name;

    // Formatting the request time to a more readable format
    const formattedRequestTime = new Date(req.requestTime).toLocaleString();

    const deleteQuery = "DELETE FROM groceries WHERE id = ?";
    mysqlPool.query(deleteQuery, [id], (err, results) => {
      if (err) {
        console.error("Error deleting row:", err);
        res.status(500).json({ error: "Database error" });
        return;
      }
      console.log(
        `${itemName} (id#${id}) removed from list at ` +
          `${formattedRequestTime}`
      );
      res.status(200).json({ success: true });
    });
  });
});

// TOGGLE TO_BE_BOUGHT VALUE
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { toBeBought } = req.body;

  // Check if id exists in the database
  const idQuery = "SELECT id FROM groceries WHERE id = ?";
  mysqlPool.query(idQuery, [id], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Database error" });
      return;
    }
    if (!results.length) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    // Update the to_be_bought value
    const updateQuery =
      "UPDATE groceries SET to_be_bought = ? WHERE id = ?";
    mysqlPool.query(updateQuery, [toBeBought, id], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Database error" });
        return;
      }
      console.log(`Item #${id} / To be bought : ${toBeBought}`);
      res.status(200).json({ success: true });
    });
  });
});

// Export the router so it can be used in server.js
module.exports = router;
