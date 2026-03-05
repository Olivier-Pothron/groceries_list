console.log('Sync API loaded');

const express = require('express');
const router = express.Router();
const mysqlPool = require('../db');

// SYNCING CATEGORIES FROM CLIENT
router.post('/up/categories', async (req, res) => {
  const { categories } = req.body;
  console.log("CLIENT REQUEST RECEIVED.");
  console.log("categories received: ", categories);
  let uuidMap = {};

  const categoriesQuery = `SELECT name, id FROM category`;
  const [serverCategories] = await mysqlPool.promise().query(categoriesQuery);
  console.log("categories in db: ", serverCategories);

  for ( let category of categories ) {
    if (checkUuid(category, serverCategories)) {
      console.log(`UUID MATCH FOR CATEGORY ${category.name}!`);
    } else if (checkName(category, serverCategories)) {
      console.log(`NAME MATCH FOR CATEGORY ${category.name} / `
        + `ADDING CATEGORY UUID TO MAP!`);

      const serverCategory = serverCategories.find(cat => cat.name === category.name);
      uuidMap[category.uuid] = serverCategory.id;
    } else {
      console.log(`INSERTING ${category.name}!`);
      try {
        const insertQuery = `INSERT INTO category (id, name) VALUES (?, ?);`
        await mysqlPool.promise().query( insertQuery, [category.uuid, category.name]);
        console.log(`Category '${category.name}' inserted into category table `
          + `/ id '${category.uuid}'`);
      } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json({ error: "Insert category error" });
      }
    }
  }

  const allCategoriesQuery = 'SELECT * FROM category';
  const [allCategories] = await mysqlPool.promise().query(allCategoriesQuery);

  const payload = { categories: allCategories, uuidMap: uuidMap };

  console.log("response payload: ", payload)

  res.json( payload );
});

// SYNCING GROCERIES FROM CLIENT
router.post('/up/groceries', async (req, res) => {
  const { groceries } = req.body;
  console.log("Client request received.");
  console.log("groceries received: ", groceries);
  let uuidMap = {};

  const groceriesQuery = `SELECT name, id, category_id FROM grocery`;
  const [serverGroceries] = await mysqlPool.promise().query(groceriesQuery);
  console.log("groceries in db: ");
  console.log(serverGroceries);

  for( let grocery of groceries) {
    if (checkUuid(grocery, serverGroceries)) {
      console.log(`UUID MATCH FOR GROCERY ${grocery.name}. Updating...`);

      const updateQuery = `UPDATE grocery SET to_be_bought = ? WHERE id = ?;`;
      await mysqlPool.promise().query( updateQuery,
        [grocery.toBeBought, grocery.uuid]);
    } else if (checkNameAndCategory(grocery, serverGroceries)) {
      console.log(`NAME & CAT MATCH FOR GROCERY ${grocery.name}. Updating...`);

      const updateQuery = `UPDATE grocery SET to_be_bought = ?
      WHERE name = ? AND category_id = ?;`;
      await mysqlPool.promise().query( updateQuery,
        [grocery.toBeBought, grocery.name, grocery.categoryUuid]);

      console.log(`ADDING GROCERY UUID TO MAP!`);
      const serverGrocery = serverGroceries.find(gro =>
        gro.name === grocery.name && gro.category_id === grocery.categoryUuid);
      uuidMap[grocery.uuid] = serverGrocery.id;
    } else {
      console.log(`TIME TO INSERT ${grocery.name}!`);
      try {
        const insertQuery = `INSERT INTO grocery (id, name, category_id)
          VALUES (?, ?, ?);`
        await mysqlPool.promise().query( insertQuery,
          [grocery.uuid, grocery.name, grocery.categoryUuid]);
        console.log(`Grocery '${grocery.name}' inserted into grocery table `
          + `/ id '${grocery.uuid}'`);
      } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json({ error: "Insert grocery error" });
      }
    }
  }

  const allGroceriesQuery = 'SELECT * FROM grocery';
  const [allGroceries] = await mysqlPool.promise().query(allGroceriesQuery);

  const payload = { groceries: allGroceries, uuidMap: uuidMap };

  console.log("payload: ", payload)

  res.json( payload );
});


const checkUuid = (clientItem, serverItems) => {
  for ( let item of serverItems ) {
    if ( item.id === clientItem.uuid) {
      return true;
    }
  }
  return false;
}

const checkName = (clientCategory, serverCategories) => {
  for ( let category of serverCategories ) {
    if ( category.name === clientCategory.name) {
      return true;
    }
  }
  return false;
}

const checkNameAndCategory = (clientGrocery, serverGroceries) => {
  for ( let grocery of serverGroceries ) {
    if ( grocery.name === clientGrocery.name
      && grocery.category_id === clientGrocery.categoryUuid ) {
      return true;
    }
  }
  return false;
}

/*
router.post('/up', (req, res) => {
  const { categories, groceries, last_sync } = req.body;
  console.log("Request from client received.");
  console.log("categories: ", categories);
  console.log("groceries: ", groceries);
  console.log("last_sync: ", last_sync);

  if (categories.length > 0) {
    for( let category of categories ) {
      console.log(`Trying a loop : ${category.name} / ${category.id}`);
      upsertCategory(category, (err, result) => {
        if(err) {
          console.error("upsertCategory returned error!");
          console.error(err);
          return;
        }
        console.log(`upsertCategory successful!`);
        console.log(result);
      });
    }
  }

  if (groceries.length > 0) {
    for( let grocery of groceries ) {
      console.log(`Trying a loop : ${grocery.name} / ${grocery.id}`);
      upsertGrocery(grocery, (err, result) => {
          if(err) {
            console.error("upsertGrocery returned error!");
            console.error(err);
            return;
          }
          console.log("upsertGrocery successful!");
          console.log(result);
      });
    }
  }

  // TODO: Insert/update categories
  // TODO: Insert/update groceries
  // TODO: return success

  res.json({ success: true });
});

router.post('/down', (req, res) => {
  const { last_sync } = req.body;
  console.log("Request from client received.");

  // TODO: GET categories modified since last_sync
  // TODO: GET groceries modified since last_sync

  res.json({
    categories: [],
    groceries: [],
    server_time: new Date().toISOString()
  });
});
*/

// Export the router so it can be used in server.js
module.exports = router;
