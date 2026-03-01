console.log("'database.js' loaded");

////////////////////////////////
////////// CATEGORIES //////////////
////////////////////////////////

function getCategories(callback) {
  try {
    const query = "SELECT * FROM category;"
    const res = db.exec(query);

    let categoriesArray = [];

    if (res.length > 0) {
      categoriesArray = res[0].values.map (row => ({
        id: row[0],
        name: row[1]
      }));

    } else {
      console.log("No category found.");
    }

    if (callback) callback(null, categoriesArray);
  } catch(error) {
    console.error("Error fetching categories:", error);

    if (callback) callback(error, null);
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

function updateCategoriesUuid(uuidMap, callback) {
  try {
    for ( let clientUuid in uuidMap ) {
      const serverUuid = uuidMap[clientUuid];

      const identifyingQuery = "SELECT name FROM category WHERE uuid = ?;";
      const selectStmt = db.prepare(identifyingQuery);
      selectStmt.bind([clientUuid]);
      if (selectStmt.step()) {
        const category = selectStmt.getAsObject();
        const categoryName = category.name;

        const updateQuery = "UPDATE category SET uuid = ? WHERE uuid = ?;";
        const updateStmt = db.prepare(updateQuery);
        updateStmt.bind([serverUuid, clientUuid]);
        updateStmt.run();
        updateStmt.free();

        console.log(`%cCategory "${categoryName}" uuid updated.`,
          'color: blue;');
      }
      selectStmt.free();
    }
  callback(null, true);
  } catch (error) {
  console.error("Error updating category.", error);
  callback(error, null);
  }
}

function addCategoriesFromServer(serverCategories, callback) {
  const duplicateCategories = [];
  try {
    const insertQuery = `
    INSERT INTO category (name, uuid)
    VALUES (?, ?)
    ON CONFLICT(name) DO NOTHING;
    `;
    for( let category of serverCategories ) {
      const insertStmt = db.prepare(insertQuery);
      insertStmt.bind([category.name, category.id]);
      insertStmt.step();
      insertStmt.free();
      const rowsModified = db.getRowsModified();
      if (rowsModified > 0) {
        const idResult = db.exec("SELECT last_insert_rowid();");
        const newId = idResult[0].values[0][0];
        console.log(`%cAdded "${category.name}" to categories list with insertId ${newId}.`,
          'color: green;');
      } else {
        duplicateCategories.push(category.name);
      }
    }
    callback(null, duplicateCategories);
  } catch(error) {
    console.error("ERROR ADDING CATEGORIES! ", error);
    callback(error, null);
  }
}

/////////////////////////////////
/////////// GROCERIES ///////////////
/////////////////////////////////

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
    insertStmt.bind([name, catId || null, groceryUUID || null, 1]);
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

      console.log(`%cCategory "${categoryName}" deleted from database.`,
        'color: green;');

        if (callback) callback(null, categoryName);

    } else {
      console.log("No category found for id :" + id);
    }

    selectStmt.free();

  } catch (error) {
    console.error("Error deleting category.", error);

    if (callback) callback(error, null);

  }
}

function updateGroceriesUuids ( uuidMap, callback) {
  try {
    for ( let clientUuid in uuidMap) {
      const serverUuid = uuidMap[clientUuid];

      const selectQuery = `SELECT name FROM grocery WHERE uuid = ?;`
      const selectStmt = db.prepare(selectQuery);
      selectStmt.bind([clientUuid]);

      if(selectStmt.step()) {
        const grocery = selectStmt.getAsObject();
        const groceryName = grocery.name;

        const updateQuery = `UPDATE grocery SET uuid = ? WHERE uuid = ?;`
        const updateStmt = db.prepare(updateQuery);
        updateStmt.bind([serverUuid, clientUuid]);
        updateStmt.run();
        updateStmt.free();

        console.log(`%cGrocery "${groceryName}" uuid updated.`,
          'color: blue;');
      }
      selectStmt.free();
    }
    callback(null, true);
  } catch (error) {
    console.error(`Groceries UUIDs update encountered an error: `, error);
    callback(error, null);
  }
}

function testingAddGroceryToServer( grocery, callback ) {
  try {
    insertQuery = `
      INSERT INTO grocery (name, uuid, category_id)
      VALUES (?, ?, (SELECT id FROM category WHERE uuid = ?));
      `;

    const stmt = db.prepare(insertQuery);

    console.log("test-grocery: ", grocery);

    stmt.run([grocery.name, grocery.uuid, grocery.category_id])

    stmt.free()

  } catch (error) {
    console.error("watzehell: ", error);
    callback(error, null);
  }
  callback(null, true);
}

function addGroceriesFromServer( serverGroceries, callback) {
  const duplicateGroceries = [];
  try {
    insertQuery = `
      INSERT INTO grocery (name, uuid, category_id)
      VALUES (?, ?, (SELECT id FROM category WHERE uuid = ?))
      ON CONFLICT(name, category_id) DO NOTHING;
      `;

    for ( let grocery of serverGroceries ) {
      const insertStmt = db.prepare(insertQuery);
      insertStmt.bind([grocery.name, grocery.id, grocery.category_id]);
      insertStmt.step();
      insertStmt.free();
      const rowsModified = db.getRowsModified();

      if (rowsModified > 0) {
        const idResult = db.exec("SELECT last_insert_rowid();");
        const newId = idResult[0].values[0][0];
        console.log(`%cAdded "${grocery.name}" to categories list with insertId ${newId}.`,
          'color: green;');
      } else {
        duplicateGroceries.push(grocery.name);
      }
    }
    callback(null, duplicateGroceries);
  } catch (error) {
    console.error("Error inserting groceries from server: ", error);
    callback(error, null);
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

////////////////////////////////
/// HANDLING "DIRTY" DATA ///////////
////////////////////////////////

function getDirtyCategories(callback) {
  try {
    const query = "SELECT * FROM category WHERE is_dirty = 1;"
    const res = db.exec(query);

    // console.log(res);
    // console.log(res[0].values);

    let categoriesArray = [];

    if (res.length > 0) {
      categoriesArray = res[0].values.map (row => ({
        uuid: row[3],
        name: row[1]
      }));

    } else {
      console.log("No dirty category found.");
    }

    callback(null, categoriesArray);
  } catch(error) {
    console.error("Error fetching dirty categories:", error);

    callback(error, null);
  }
}

function getDirtyGroceries(callback) {
  try {
    let query = `
      SELECT  grocery.uuid,
              grocery.name AS name,
              grocery.to_be_bought,
              category.uuid AS category_uuid,
              grocery.is_dirty
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
        isDirty: row[4]
      }));

    } else {
      console.log("No grocery found.");
    }

    // console.log("Groceries Array from DB: ", groceriesArray);

    callback(null, groceriesArray);
  } catch(error) {
    console.error("Error fetching groceries:", error);

    callback(error, null);
  }
}

// DATABASE STORING AND LOADING

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

function updateSyncDate(date, callback) {
  const syncQuery = 'UPDATE sync_meta SET value = ?;'
  const syncStmt = db.prepare(syncQuery);
  syncStmt.bind([date]);
  syncStmt.run();
  syncStmt.free();

  callback("Done updating sync date");
}

/*
function fetchTheDate(callback) {

  const response = db.exec(`SELECT value FROM sync_meta;`);
  console.log("The date :")
  console.log(`%c${response}`, 'color: orange;');
  const syncDate = response[0].values[0][0];
  console.log(response[0].values[0][0]);
  console.log(typeof(syncDate));
  callback(syncDate);
}
*/

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

/*
stmt.bind([param]);
stmt.step();
stmt.free();

//OR//

stmt.run([param]);
stmt.free();
*/
