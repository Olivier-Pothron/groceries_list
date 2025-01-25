var db = null;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

  db = window.sqlitePlugin.openDatabase({ name: 'groceries.db', location: 'default' });
  initializeDatabase();
}

// DATABASE INITIALIZATION
function initializeDatabase() {

  db.transaction(function(tx) {
    dropTables(tx);
    createTables(tx);
    seedTables(tx);
  }, function onTransactionError(error) {
    console.error('Initialization ERROR: ' + error.message);
  }, function onTransactionSuccess() {
    console.log('%cInitialization SUCCESS!', 'color: blue; font_weight: bold;');

    // Fire the databaseReady event
    const event = new Event("databaseReady");
    document.dispatchEvent(event);
  });
}

// DROPPING TABLES
function dropTables(tx) {

  tx.executeSql('DROP TABLE IF EXISTS groceries_categories');
  // console.log("'groceries_categories' table dropped");
  tx.executeSql('DROP TABLE IF EXISTS groceries_list');
  // console.log("'groceries_list' table dropped");
  console.log('%c### All tables dropped ###', 'color: blue;');
}

// CREATING TABLES
function createTables(tx) {

  tx.executeSql(`CREATE TABLE IF NOT EXISTS groceries_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    UNIQUE(name) )
    `);

  tx.executeSql(`CREATE TABLE IF NOT EXISTS groceries_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    to_be_bought INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES groceries_categories(id) )
    `);

  // creating a unique index to prevent duplicates
  tx.executeSql(`CREATE UNIQUE INDEX idx_grocery_name_category
    ON groceries_list (name, category_id)`);

  console.log('%c### All tables created ###', 'color: blue;');
  }


// SEEDING TABLES
function seedTables(tx) {

  let categories = [
    { name: 'fruits & légumes' },
    { name: 'droguerie parfumerie hygiène' },
    { name: 'surgelés' },
    { name: 'épicerie salée'},
    { name: 'épicerie sucrée'},
    { name: 'crèmerie'},
    { name: 'liquides'},
    { name: 'traiteur'}
  ];
  let items = [
    { name: 'pommes', category: 1 },
    { name: 'shampooing', category: 2 },
    { name: 'frites', category: 3 },
    { name: 'moutarde', category: 4},
    { name: 'lait', category: 6},
    { name: 'haricots verts', category: 3},
    { name: "jus d'orange", category: 7},
    { name: 'gâteaux', category: 5},
    { name: "pavés de saumon", category: 8}
  ];
  // Insert categories
  for (const category of categories) {
    let query = "INSERT INTO groceries_categories (name) VALUES (?)"
    tx.executeSql(query, [category.name],
      function onInsertSuccess(tx) {
      }, function onInsertError(tx, error) {
        console.error(`Insert ERROR! Code: ${error.message}`);
      });
  }
  // Insert items
  for (const item of items) {
    let query = "INSERT INTO groceries_list (name, category_id) VALUES (?, ?)"
    tx.executeSql(query, [item.name, item.category],
      function onInsertSuccess(tx) {
    }, function onInsertError(tx, error) {
      console.error(`Insert ERROR! Code: ${error.message}`);
    });
  }
}

// CRUD STUFF


// - CATEGORIES
function getCategories(callback) {

  db.transaction(function (tx) {
    let query = "SELECT * FROM groceries_categories";
    tx.executeSql(query, [], function(tx, resultSet) {
      let categoriesArray = [];
      for (let i = 0; i < resultSet.rows.length ; i++ ) {
        let category = resultSet.rows.item(i);
        categoriesArray.push({
          ID: category.id,
          name: category.name
        });
      }

      callback(null, categoriesArray);
    }, function(tx, error) {
      console.log("Query Error! " + error.message);

      callback(error, null);
    });
  }, function onTransactionError(error) {
    console.error('Get categories transaction ERROR: ' + error.message);
  }, function onTransactionSuccess() {
    console.log('%cGet categories transaction SUCCESS!',
      'color: green; font_weight: bold;');
  });
}

function addCategory (name, callback) {

  db.transaction(function(tx) {
    let query = "INSERT INTO groceries_categories (name) VALUES (?)"
    tx.executeSql(query, [name],
      function(tx, result) {
        console.log(`%cCategory "${name}" added with ID ${result.insertId}`, 'color: green;');

        if (callback) callback(null, result.insertId);
      },
      function(tx, error) {
        console.error('Insert ERROR : ' + error.message);

        if (callback) callback(error, null);
      }
    );
  }, function onTransactionError(error) {
    console.error("Category Transaction error" + error.message);
  }, function onTransactionSuccess() {
    console.log("Category Transaction Success");
  });
}

function deleteCategory (id) {

  db.transaction(function(tx) {
    let identifyingQuery = "SELECT name FROM groceries_categories WHERE id = ?";
    tx.executeSql(identifyingQuery, [id],
      function onIdentifyingSuccess(tx, resultSet) {
        if (resultSet.rows.length > 0) {
          let categoryName = resultSet.rows.item(0).name;
          let deletionQuery = "DELETE FROM groceries_categories WHERE id = ?";
          tx.executeSql(deletionQuery, [id],
            function onDeleteSuccess(tx) {
              console.log(`"${categoryName}" deleted from database.`);
            },
            function onDeleteError(tx, error) {
              console.log("Deletion Error" + error.message);
            }
          );
        } else {
          console.log(`Category with id ${id} not found.`)
        }
      },
      function onIdentifyingError(tx, error) {
        console.log("Identifying Error" + error.message);
      }
    );
  }, function onTransactionError(error) {
    console.error('Deleting category ERROR: ' + error.message);
  }, function onTransactionSuccess() {
    console.log('%cDeleting category SUCCESS!',
      'color: green; font_weight: bold;');
  });
}

// - GROCERIES
function getGroceries(callback) {

  db.transaction(function(tx) {
    let query = `
      SELECT  groceries_list.id,
              groceries_list.name AS name,
              groceries_list.to_be_bought,
              groceries_categories.name AS category
      FROM    groceries_list
      LEFT JOIN    groceries_categories
      ON      groceries_list.category_id = groceries_categories.id
      `;
      // "LEFT JOIN" to handle groceries without a category

    tx.executeSql(query, [],
      function(tx, resultSet) {
        let groceriesArray = [];
        for ( let i = 0 ; i < resultSet.rows.length ; i++ ) {
          let grocery = resultSet.rows.item(i);                                 // everything is put in an object
          groceriesArray.push({                                                 // into an array to send to the UI
            id: grocery.id,                                                     // or display in the console
            name: grocery.name,                                                 // more efficiently
            category: grocery.category || "no category",
            toBeBought: grocery.to_be_bought
          });
        }
        if (callback) callback(null, groceriesArray);                           // callback function returns
      }, function(tx, error) {                                                  // array of items to the UI
        console.log("Query Error! " + error.message);                           // or error
        if (callback) callback(error, null);
      }
    );
  }, function onTransactionError(error) {
    console.error('Get groceries ERROR: ' + error.message);
  }, function onTransactionSuccess() {
    console.log('%cGet groceries transaction SUCCESS!',
      'color: green; font_weight: bold;');
  });
}

////////// WATCHOUT ! HAVE TO SIMPLIFY LOGIC OF NULL CATEGORY!//////////////////
////////////////// AND MAYBE RETURN A 'RESULT' OBJECT TO THE CALLBACK ? ////////
///////////////// TEST OUT THAT SHIT IN CORDOVA ////////////////////////////////
function addGrocery (name, category, callback) {

  db.transaction(function(tx) {
    let insertQuery = "INSERT INTO groceries_list (name, category_id) VALUES (?, ?)"

    let categoryId = category || null;                                          // checks if a category is provided

    tx.executeSql(insertQuery, [name, categoryId],
      function onInsertSuccess(tx, groceryResult) {
        console.log(`%cGrocerie "${name}" inserted with id "${groceryResult.insertId}"`,
          'color: green;');
        if (categoryId != null) {                                               // executes if category provided
          let categoryQuery = "SELECT name FROM groceries_categories WHERE id = ?";
          tx.executeSql(categoryQuery, [categoryId],
            function(tx, categoryResult) {                                      // fetches category_name
            if (categoryResult.rows.length > 0) {                               // executes if provided category exists
              let category_name = categoryResult.rows.item(0).name;
              console.log(`%c"${name}" added to category "${category_name}"`,
                'color: purple;');

              if (callback) callback(null, groceryResult.insertId);
            } else {                                                            // no match between id and a category
              console.log('%cNo category found for that ID : ',
                'color: yellow;' + + categoryId);

              if (callback) callback(new Error("No category found for that ID."), null);
            }
            }, function(tx, error) {
              console.error('Error fetching category name : ' + error.message);

              if (callback) callback(error, null);
          });
        } else {
          console.log('%cNo category specified for this item.',
            'color: violet;');

          if (callback) callback(null, groceryResult.insertId);
        }
      }, function onInsertError(tx, error) {
        console.error(`Insert ERROR! ${error.message}`);

        if (callback) callback(error, null);
      }
    );
  }, function onTransactionError(error) {
    console.error(`Adding grocery transaction ERROR! ${error.message}`);
  }, function onTransactionSuccess() {
    console.log('%cAdding grocery transaction SUCCESS!',
      'color: green; font_weight: bold;');
  });
}

function deleteGrocery (id) {

  db.transaction(function(tx) {
    let identifyingQuery = "SELECT name FROM groceries_list WHERE id = ?";
    tx.executeSql(identifyingQuery, [id],
      function onIdentifyingSuccess(tx, resultSet) {
        if (resultSet.rows.length > 0) {
          let groceryName = resultSet.rows.item(0).name;
          let deletionQuery = "DELETE FROM groceries_list WHERE id = ?";
          tx.executeSql(deletionQuery, [id],
            function onDeleteSuccess(tx) {
              console.log(`%c"${groceryName}" deleted from database.`,
                'color: green;');
            },
            function onDeleteError(tx, error) {
              console.log("Deletion Error" + error.message);
            }
          );
        } else {
          console.log(`Grocery with id ${id} not found.`)
        }
      },
      function onIdentifyingError(tx, error) {
        console.log("Identifying Error" + error.message);
      }
    );
  }, function onTransactionError(error) {
    console.log("Transaction error!" + error.message);
  }, function onTransactionSuccess() {
    console.log("Transaction success!");
  });
}

function toggleToBeBought (id, callback) {

  db.transaction(function (tx) {
    let identifyingQuery = "SELECT name, to_be_bought FROM groceries_list WHERE id = ?";
    tx.executeSql(identifyingQuery, [id], function (tx, resultSet) {
      if (resultSet.rows.length > 0) {
        let groceryName = resultSet.rows.item(0).name
        let currentState = resultSet.rows.item(0).to_be_bought;
        let newState = currentState === 0 ? 1 : 0;
        let updatedStateString = newState === 0 ? "Not to be bought" : "To be bought";

        let updateQuery = "UPDATE groceries_list SET to_be_bought = ? WHERE id = ?";
        tx.executeSql(updateQuery, [newState, id], function (tx, result) {
          console.log(`%c"${groceryName}" updated to "${updatedStateString}".`,
            'color: green;');

          if (callback) callback(null, updatedStateString);
        }, function (tx, error) {
          console.error('ERROR Updating grocery.' + error.message);
        });
      } else {
        console.log(`%cGrocery with ID ${id} not found.`, 'color: red;');
      }
    }, function (tx, error) {
      console.error('ERROR finding data : ' + error.message);
    });
  }, function onTransactionError(error) {
    console.error('Updating groceries ERROR: ' + error.message);
  }, function onTransactionSuccess() {
    console.log('%cUpdating groceries SUCCESS!',
      'color: green; font_weight: bold;');
  });
}

// function whatever (id) {

//   db.transaction(function (tx) {
//     tx.executeSql(query, [], function name(params) {

//     }, function name(tx, resultSet) {

//     }, function name(tx, error) {

//     });
//   }, function (error) {
//     console.error('%cFetching groceries ERROR: ', 'color: red;' + error.message);
//   }, function () {
//     console.log('%cFetching groceries SUCCESS!', 'color: green; font_weight: bold;');
//   });
// }


// basic syntax :

// tx.executeSql(sqlStatement, parameters, successCallback, errorCallback);
//  * sqlStatement is an sql statement
//  * parameters is an array
//  * successCallback is passed the |transaction object| and a resultSet array (if applicable)
//  * the errorCallback is passed the |transaction object| and the |error| object
