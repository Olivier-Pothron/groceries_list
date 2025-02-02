console.log("'database.js' loaded");

function getCategories(callback) {
  try {
    const query = "SELECT * FROM groceries_categories;"
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

function addCategory(name, callback) {
  try {
    const insertQuery = "INSERT INTO groceries_categories (name) VALUES (?) RETURNING id;";
    const insertStmt = db.prepare(insertQuery);
    insertStmt.bind([name]);
    let insertId = null;                                                        // ? check this.lastID

    if (insertStmt.step()) {
      const result = insertStmt.get();
      insertId = result[0];
    }

    insertStmt.free();

    console.log(`%cAdded "${name}" to categories list with insertId ${insertId}`,
      'color: green;');

    if (callback) callback(null, insertId);

    } catch (error) {
    console.error("Error adding category", error);

    if (callback) callback(error, null);
  }
}

function deleteCategory(id, callback) {
  try {
    const identifyingQuery = "SELECT name FROM groceries_categories WHERE id = ?;";
    const selectStmt = db.prepare(identifyingQuery);
    selectStmt.bind([id]);

    if (selectStmt.step()) {
      const category = selectStmt.getAsObject();
      const categoryName = category.name;

      const deletionQuery = "DELETE FROM groceries_categories WHERE id = ?;";
      const deletionStmt = db.prepare(deletionQuery);
      deletionStmt.bind([id]);
      deletionStmt.run();
      deletionStmt.free();

      console.log(`%cCategory "${categoryName}" deleted from database.`,
        'color: green;');

        if (callback) callback(null, categoryName);
      }
  } catch (error) {
    console.error("Error deleting category.", error);

    if (callback) callback(error, null);
  }
}

function getGroceries(callback) {
  try {
    let query = `
      SELECT  groceries_list.id,
              groceries_list.name AS name,
              groceries_list.to_be_bought,
              groceries_categories.name AS category,
              groceries_list.category_id AS category_id
      FROM    groceries_list
      LEFT JOIN    groceries_categories
      ON      groceries_list.category_id = groceries_categories.id;
      `;
    const res = db.exec(query);

    let groceriesArray = [];

    if (res.length > 0) {
      groceriesArray = res[0].values.map(row => ({
        id: row[0],
        name: row[1],
        toBeBought: row[2],
        category: row[3],
        category_id: row[4]
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

function addGrocery(name, catId, callback) {   // LOOK FOR THAT CALLBACK SHIT !
  try {
    let categoryName = null;

    const insertQuery = "INSERT INTO groceries_list (name, category_id) VALUES (?, ?) RETURNING id;";
    const insertStmt = db.prepare(insertQuery);
    insertStmt.bind([name, catId || null]);
    let insertId = null;

    if (insertStmt.step()) {
      const result = insertStmt.get();
      insertId = result[0];
    }

    insertStmt.free();

    console.log(`%cAdded "${name}" to groceries_list with ID ${insertId}`,
      'color: green;');

    if(catId) {
      const categoryQuery = "SELECT name FROM groceries_categories WHERE id = ?;";
      const categoryStmt = db.prepare(categoryQuery);
      categoryStmt.bind([catId]);

      if (categoryStmt.step()) {
        const category = categoryStmt.getAsObject();
        categoryName = category.name;
        console.log(`%cGrocery added to ${categoryName} category.`,
          'color: green;');
      } else {
        console.log('%cNo category found for that ID : ',
          'color: violet;' + catId);
      }
      categoryStmt.free();
    } else {
      console.log("No category specified for the grocery.");
    }
    insertStmt.free();

    if (callback) callback(null, insertId);
  } catch (error) {
    console.error("Error adding grocery", error);
    if (callback) callback(error, null);
  }
}

function deleteGrocery(id, callback) {
  try {
    const identifyingQuery = "SELECT name FROM groceries_list WHERE id = ?;";
    const selectStmt = db.prepare(identifyingQuery);
    selectStmt.bind([id]);

    if (selectStmt.step()) {
      const category = selectStmt.getAsObject();
      const categoryName = category.name;

      const deletionQuery = "DELETE FROM groceries_list WHERE id = ?;";
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

function toggleToBeBought(id, callback) {
  try {
    const identifyingQuery = "SELECT name, to_be_bought FROM groceries_list WHERE id = ?;";
    const selectStmt = db.prepare(identifyingQuery);
    selectStmt.bind([id]);

    if (selectStmt.step()) {                                                    // checks if 1st row exists
      const grocery = selectStmt.getAsObject();
      const groceryName = grocery.name;
      const currentState = grocery.to_be_bought;
      const newState = currentState === 0 ? 1 : 0;
      const updatedStateString = newState === 0 ? "Not to be bought" : "To be bought";

      const updateQuery = "UPDATE groceries_list SET to_be_bought = ? WHERE id = ?;";
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
  localStorage.setItem('myDatabase', base64String);
}

function loadDatabase(base64String) {
  // 1. Encode base64 string to binary string
  const binaryString = atob(base64String);

  // 2. Convert binary string to Uint8Array
  const byteArray = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));

  return byteArray;
}

function removeDatabase() {
  localStorage.removeItem('myDatabase');
  initDatabase();
}
