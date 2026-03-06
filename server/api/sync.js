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
  const { groceries, lastSync } = req.body;
  console.log("Client request received.");
  console.log("groceries received: ", groceries);
  console.log("last_sync_date received: ", lastSync);
  let uuidMap = {};

  const groceriesQuery = `SELECT name, id, category_id FROM grocery`;
  const [serverGroceries] = await mysqlPool.promise().query(groceriesQuery);
  console.log("groceries in db: ");
  console.log(serverGroceries);

  for( let grocery of groceries) {
    if (checkUuid(grocery, serverGroceries)) {
      console.log(`UUID MATCH FOR GROCERY ${grocery.name}. Updating...`);

      const updateQuery = `
      UPDATE grocery
      SET to_be_bought = ?
      WHERE id = ? AND to_be_bought != ?;
      `;

      await mysqlPool.promise().query( updateQuery,
        [grocery.toBeBought, grocery.uuid, grocery.toBeBought]);

    } else if (checkNameAndCategory(grocery, serverGroceries)) {
      console.log(`NAME & CAT MATCH FOR GROCERY ${grocery.name}. Updating...`);

      const updateQuery = `
      UPDATE grocery
      SET to_be_bought = ?
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

  const allGroceriesQuery = 'SELECT * FROM grocery WHERE last_modified > ?';

  const lastSyncDate = new Date(lastSync);
  const [allGroceries] = await mysqlPool.promise().query(allGroceriesQuery, [lastSyncDate]);

  const newSyncDate = new Date().toISOString();

  const payload = { groceries: allGroceries, uuidMap: uuidMap, syncDate: newSyncDate };

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

// Export the router so it can be used in server.js
module.exports = router;
