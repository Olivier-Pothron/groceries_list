console.log("'database.js' loaded");

////////////////////////////////
////////// CATEGORIES //////////////
////////////////////////////////
// #region CATEGORIES
function getCategories(callback) {
  try {
    const selectQuery = "SELECT * FROM category;"
    const selectStmt = db.prepare(selectQuery)

    let categoriesArray = [];

    while (selectStmt.step()) {
      const row = selectStmt.getAsObject();
      categoriesArray.push( { id: row.id, name: row.name });
    }

    selectStmt.free();

    if (!categoriesArray.length) console.log("No category found.");
    callback(null, categoriesArray);
  } catch(error) {
    console.error("Error fetching categories:", error);

    callback(error, null);
  }
}

function addCategory(name, categoryUUID, callback) {
  try {
    const insertQuery = `
      INSERT INTO category (name, uuid, is_dirty)
      VALUES (?, ?, ?);
      `;
    const insertStmt = db.prepare(insertQuery);
    insertStmt.bind([name, categoryUUID, 1]);
    insertStmt.step();
    insertStmt.free();
    const idResult = db.exec("SELECT last_insert_rowid();");
    const newId = idResult[0].values[0][0];

    console.log(`%cAdded "${name}" to categories list with insertId ${newId}`,
      'color: green;');

    if (callback) callback(null, newId);

    } catch (error) {
    console.error("Error adding category", error);

    if (callback) callback(error, null);
  }
}

function deleteCategory(id, callback) {
  try {
    const identifyingQuery = "SELECT name FROM category WHERE id = ?;";
    const selectStmt = db.prepare(identifyingQuery);
    selectStmt.bind([id]);

    if (selectStmt.step()) {
      const category = selectStmt.getAsObject();
      const categoryName = category.name;

      const deletionQuery = "DELETE FROM category WHERE id = ?;";
      const deletionStmt = db.prepare(deletionQuery);
      deletionStmt.bind([id]);
      deletionStmt.run();
      deletionStmt.free();

      console.log(`%cCategory "${categoryName}" deleted from database.`,
        'color: green;');

      callback(null, categoryName);
    }
    selectStmt.free();
  } catch (error) {
    console.error("Error deleting category.", error);

    callback(error, null);
  }
}

// SYNCHRONIZATION

function updateCategoriesUuid(uuidMap, callback) {
  const updatedCategories = [];
  const updateQuery = `
      UPDATE category
      SET uuid = ?
      WHERE uuid = ?
      RETURNING name
      ;`;

  try {
    for ( let clientUuid in uuidMap ) {
      const serverUuid = uuidMap[clientUuid];
      const updateStmt = db.prepare(updateQuery);
      updateStmt.bind([serverUuid, clientUuid]);
      if(updateStmt.step()) {
        const category = updateStmt.getAsObject();
        updatedCategories.push(category.name);
      }
      updateStmt.free();
    }
    callback(null, updatedCategories);
  } catch (error) {
    callback(error, null);
  }
}

function addCategoriesFromServer(serverCategories, callback) {
  const processedCategories = [];
  upsertQuery = `
    INSERT INTO category (name, uuid, is_dirty)
    VALUES (?, ?, 0)
    ON CONFLICT(name) DO UPDATE SET
      is_dirty = 0
    RETURNING id;
    `;

  try {

    for( let category of serverCategories ) {
      const upsertStmt = db.prepare(upsertQuery);
      upsertStmt.bind([category.name, category.id]);
      upsertStmt.step()
      const [newId] = upsertStmt.get();
      processedCategories.push({name: category.name, id: newId});
      upsertStmt.free();
    }

    callback(null, processedCategories);
  } catch(error) {
    callback(error, null);
  }
}

// Promises wrappers
function getDirtyCategoriesAsync() {
  return new Promise((resolve,reject) => {
    getDirtyCategories((error, categories) => {
      if(error) {
        const err = new Error("Error fetching dirtyCategories.");
        err.original = error;
        return reject(error);
      }
      resolve(categories);
    })
  })
}

function addCategoriesFromServerAsync(serverCategories) {
  return new Promise((resolve, reject) => {
    addCategoriesFromServer(serverCategories, (error, processedCategories) => {
      if(error) {
        const err = new Error("ERROR ADDING CATEGORIES FROM SERVER!");
        err.original = error;
        return reject(error);
      }
      resolve(processedCategories);
    })
  })
}

function updateCategoriesUuidAsync(uuidMap) {
  return new Promise((resolve, reject) => {
    updateCategoriesUuid(uuidMap, (error, updatedCategories) => {
      if(error) {
        const err = new Error("Categories UUIDs update went wrong");
        err.original(error);
        return reject(err);
      }
      resolve(updatedCategories);
    })
  })
}

// #endregion

/////////////////////////////////
/////////// GROCERIES ///////////////
/////////////////////////////////
// #region GROCERIES
function getGroceries(callback) {
  try {
    let query = `
      SELECT  grocery.id,
              grocery.name AS name,
              grocery.to_be_bought,
              category.name AS category,
              grocery.category_id AS category_id,
              grocery.is_dirty
      FROM    grocery
      LEFT JOIN    category
      ON      grocery.category_id = category.id;
      `;
    const res = db.exec(query);

    let groceriesArray = [];

    if (res.length > 0) {
      groceriesArray = res[0].values.map(row => ({
        id: row[0],
        name: row[1],
        toBeBought: row[2],
        category: row[3],
        category_id: row[4],
        isdirty: row[5]
      }));

    } else {
      console.log("No grocery found.");
    }

    if (callback) callback(null, groceriesArray);
  } catch(error) {
    console.error("Error fetching groceries:", error);

    if (callback) callback(error, null);
  }
}

function addGrocery(name, catId, groceryUUID, callback) {
  try {
    let categoryName = null;
    const insertQuery = `
      INSERT INTO grocery (name, category_id, uuid, is_dirty)
      VALUES (?, ?, ?, ?);
      `;
    const insertStmt = db.prepare(insertQuery);
    insertStmt.bind([name, catId || -1, groceryUUID || null, 1]);
    insertStmt.step();
    insertStmt.free();
    const idResult = db.exec("SELECT last_insert_rowid();");
    const newId = idResult[0].values[0][0];

    console.log(`%cAdded "${name}" to groceries with id "${newId}"`,
      'color: green;');

    if(catId) {
      const categoryQuery = "SELECT name FROM category WHERE id = ?;";
      const categoryStmt = db.prepare(categoryQuery);
      categoryStmt.bind([catId]);

      if (categoryStmt.step()) {
        const category = categoryStmt.getAsObject();
        categoryName = category.name;
        console.log(`%cGrocery added to ${categoryName} category.`,
          'color: green;');
      } else {
        console.log('%cNo category found for that ID : ',
          'color: yellow;' + catId);
      }
      categoryStmt.free();
    } else {
      console.log('%cNo category specified for the grocery.', 'color: violet;');
    }

    if (callback) callback(null, newId);
  } catch (error) {
    console.error("Error adding grocery", error);
    if (callback) callback(error, null);
  }
}

function deleteGrocery(id, callback) {
  try {
    const identifyingQuery = "SELECT name FROM grocery WHERE id = ?;";
    const selectStmt = db.prepare(identifyingQuery);
    selectStmt.bind([id]);

    if (selectStmt.step()) {
      const category = selectStmt.getAsObject();
      const categoryName = category.name;

      const deletionQuery = "DELETE FROM grocery WHERE id = ?;";
      const deletionStmt = db.prepare(deletionQuery);
      deletionStmt.bind([id]);
      deletionStmt.run();
      deletionStmt.free();

      console.log(`%cGrocery "${groceryName}" deleted from database.`,
        'color: green;');

        if (callback) callback(null, groceryName);

    } else {
      console.log("No grocery found for id :" + id);
    }

    selectStmt.free();

  } catch (error) {
    console.error("Error deleting category.", error);

    if (callback) callback(error, null);

  }
}

function toggleToBeBought(id, callback) {
  try {
    const identifyingQuery = "SELECT name, to_be_bought FROM grocery WHERE id = ?;";
    const selectStmt = db.prepare(identifyingQuery);
    selectStmt.bind([id]);

    if (selectStmt.step()) {                                                    // checks if 1st row exists
      const grocery = selectStmt.getAsObject();
      const groceryName = grocery.name;
      const currentState = grocery.to_be_bought;
      const newState = currentState === 0 ? 1 : 0;
      const updatedStateString = newState === 0 ? "Not to be bought" : "To be bought";

      const updateQuery = `UPDATE grocery
      SET to_be_bought = ?, is_dirty = 1
      WHERE id = ?;`;
      const updateStmt = db.prepare(updateQuery);
      updateStmt.bind([newState, id]);
      updateStmt.run();
      updateStmt.free();

      console.log(`%c"${groceryName}" updated to "${updatedStateString}".`,
        'color: green;');

      if (callback) callback(null, updatedStateString);
    } else {
      console.log(`%cGrocery with ID ${id} not found.`, 'color: red;');
    }

    selectStmt.free();

  } catch (error) {
    console.error("Error fetching groceries:", error);

    if (callback) callback(error, null);
  }
}

// SYNCHRONIZATION

function updateGroceriesUuids ( uuidMap, callback ) {
  const updatedGroceries = [];
  const updateQuery = `
      UPDATE grocery
      SET uuid = ?
      WHERE uuid = ?
      RETURNING name
      ;`;

  try {
    for ( let clientUuid in uuidMap) {
      const serverUuid = uuidMap[clientUuid];
      const updateStmt = db.prepare(updateQuery);
      updateStmt.bind([serverUuid, clientUuid]);
      if(updateStmt.step()) {
        const grocery = updateStmt.getAsObject();
        updatedGroceries.push(grocery.name);
      }
      updateStmt.free();
    }
    callback(null, updatedGroceries);
  } catch (error) {
    console.error(`Groceries UUIDs update encountered an error: `, error);
    callback(error, null);
  }
}

function addGroceriesFromServer( serverGroceries, callback ) {
  const processedGroceries = [];

  try {
    const upsertQuery = `
      INSERT INTO grocery (name, uuid, category_id, is_dirty, to_be_bought)
      VALUES (?, ?, (SELECT id FROM category WHERE uuid = ?), 0, ?)
      ON CONFLICT(name, category_id) DO UPDATE SET
        is_dirty = 0,
        to_be_bought = excluded.to_be_bought
      RETURNING id;
      `;

    for ( let grocery of serverGroceries ) {
      const upsertStmt = db.prepare(upsertQuery);
      upsertStmt.bind([
        grocery.name,
        grocery.id,             // 'id' is actually uuid from the server
        grocery.category_id,    // 'category_id' is actually uuid from the server
        grocery.to_be_bought
      ]);
      upsertStmt.step()
      const [returnedId] = upsertStmt.get();
      processedGroceries.push({name: grocery.name, id: returnedId});
      upsertStmt.free();
    }

    callback(null, processedGroceries);
  } catch (error) {
    console.error("Error inserting groceries from server: ", error);
    callback(error, null);
  }
}

// #endregion

////////////////////////////////
/// HANDLING "DIRTY" DATA ///////////
////////////////////////////////
// #region DIRTY

function getDirtyCategories(callback) {
  try {
    const selectQuery = "SELECT * FROM category WHERE is_dirty = 1;"
    const selectStmt = db.prepare(selectQuery)

    let dirtycategoriesArray = [];

    while (selectStmt.step()) {
      const row = selectStmt.getAsObject();
      dirtycategoriesArray.push( { uuid: row.uuid, name: row.name });
    }

    selectStmt.free();

    if (!dirtycategoriesArray.length) console.log("No dirty category found.");
    callback(null, dirtycategoriesArray);
  } catch(error) {
    console.error("Error fetching categories:", error);

    callback(error, null);
  }
}

function getDirtyGroceries(callback) {
  try {
    let query = `
      SELECT  grocery.uuid,
              grocery.name AS name,
              grocery.to_be_bought,
              category.uuid AS category_uuid
      FROM    grocery
      LEFT JOIN category ON grocery.category_id = category.id
      WHERE   grocery.is_dirty = 1
      `;
    const res = db.exec(query);

    let groceriesArray = [];

    if (res.length > 0) {
      groceriesArray = res[0].values.map(row => ({
        uuid: row[0],
        name: row[1],
        toBeBought: row[2],
        categoryUuid: row[3],
      }));

    } else {
      console.log("No grocery found.");
    }

    // console.log("Groceries Array from DB: ", groceriesArray);

    callback(null, groceriesArray);
  } catch(error) {
    callback(error, null);
  }
}

//#endregion

////////////////////////////////
/////////// SYNC DATE ///////////////
////////////////////////////////
// #region DATE

function updateSyncDate(date, callback) {
  const syncQuery = 'UPDATE sync_meta SET value = ?;'
  const syncStmt = db.prepare(syncQuery);
  syncStmt.bind([date]);
  syncStmt.run();
  syncStmt.free();
  callback(`Updating last_sync_date to: ${date}`);
}

function fetchTheDate(callback) {
  try {
      const res = db.exec(`SELECT value FROM sync_meta;`);

      let syncDate = "";

      if (res.length > 0) {
        syncDate = res[0].values[0][0];

        console.log("Syncd4t3");
        console.log(syncDate);
      } else {
        console.log("No date found.");
      }

      if (callback) callback(null, syncDate);
    } catch(error) {
      console.error("Error fetching d4te:", error);

      if (callback) callback(error, null);
    }
}

// #endregion

/////////////////////////////////////
// DATABASE STORING AND LOADING //////////
////////////////////////////////////
// #region DATABASE

function saveDatabase(db) {
  // 1. Export the database to Uint8Array
  const byteArray = db.export();

  // 2. Convert Uint8Array to a binary string
  //    a. with a loop
  let binaryString = '';
  for (let i = 0; i < byteArray.length; i++) {
    binaryString += String.fromCharCode(byteArray[i]);
  }
  //    b. using spread syntax (ES6)
  // const binaryString = String.fromCharCode(...byteArray);

  // 3. Encode the binary string to Base64
  const base64String = btoa(binaryString);

  // 4. Store the Base64 string in localStorage
  localStorage.setItem('groceriesList', base64String);
}

function loadDatabase(base64String) {
  // 1. Encode base64 string to binary string
  const binaryString = atob(base64String);

  // 2. Convert binary string to Uint8Array
  const byteArray = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));

  return byteArray;
}

function removeDatabase() {
  localStorage.removeItem('groceriesList');
  initDatabase();
}

// #endregion

/*
stmt.bind([param]);
stmt.step();            // RETURNS ONE ROW AT EACH STEP
stmt.free();

//OR//

stmt.run([param]);      // RETURNS ALL ROWS
stmt.free();
*/
