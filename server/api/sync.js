console.log('Sync API loaded');

const express = require('express');
const router = express.Router();
const mysqlPool = require('../db');

// SYNCING CATEGORIES FROM CLIENT
router.post('/up/categories', async (req, res) => {
  const { categories } = req.body;
  console.log("categories received: ", categories);
  let uuidMap = {};

  const categoriesQuery = `SELECT name, id FROM category`;
  const [serverCategories] = await mysqlPool.promise().query(categoriesQuery);
  console.log("categories in db: ");
  console.log(serverCategories);

  for ( let category of categories ) {
    if (checkUuid(category, serverCategories)) {
      console.log(`UUID MATCH FOR CATEGORY ${category.name}!`);
    } else if (checkName(category, serverCategories)) {
      console.log(`NAME MATCH FOR CATEGORY ${category.name}!`);
      console.log(`ADDING CATEGORY UUID TO MAP!`);
      const serverCategory = serverCategories.find(cat => cat.name === category.name);
      uuidMap[category.uuid] = serverCategory.id;
    } else {
      console.log(`TIME TO INSERT ${category.name}!`);
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

  console.log("payload: ")
  console.log(payload);

  // res.json({ categories: allCategories, uuidMap: uuidmap});
  res.json({ payload });
});

// SYNCING GROCERIES FROM CLIENT
//router.post('/up/groceries', async (req, res) => {

const checkUuid = (clientCategory, serverCategories) => {
  for ( let category of serverCategories ) {
    if ( category.id === clientCategory.uuid) {
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
