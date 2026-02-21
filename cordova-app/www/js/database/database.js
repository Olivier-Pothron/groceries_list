console.log("'database.js' loaded.");

// CRUD STUFF

// - CATEGORIES
function getCategories(callback) {

  db.transaction(function (tx) {
    let query = "SELECT * FROM category";
    tx.executeSql(query, [],
      function(tx, resultSet) {
      let categoriesArray = [];
      for (let i = 0; i < resultSet.rows.length ; i++ ) {
        let category = resultSet.rows.item(i);
        categoriesArray.push({
          id: category.id,
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

function addCategory (name, categoryUUID, callback) {

  db.transaction(function(tx) {
    let query = "INSERT INTO category (name, id, is_dirty) VALUES (?, ?, ?)"
    tx.executeSql(query, [name, categoryUUID, 1],
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
    console.error("Category Addition error" + error.message);
  }, function onTransactionSuccess() {
    console.log("Category Addition Success");
  });
}

function deleteCategory (id) {

  db.transaction(function(tx) {
    let identifyingQuery = "SELECT name FROM category WHERE id = ?";
    tx.executeSql(identifyingQuery, [id],
      function onIdentifyingSuccess(tx, resultSet) {
        if (resultSet.rows.length > 0) {
          let categoryName = resultSet.rows.item(0).name;
          let deletionQuery = "DELETE FROM category WHERE id = ?";
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
      SELECT  grocery.id,
              grocery.name AS name,
              grocery.to_be_bought,
              category.name AS category,
              grocery.category_id AS category_id,
              grocery.is_dirty
      FROM    grocery
      LEFT JOIN    category
      ON      grocery.category_id = category.id
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
            category: grocery.category || "no category",
            toBeBought: grocery.to_be_bought,
            categoryId: grocery.category_id,
            isDirty: grocery.is_dirty
          });
        }
        if (callback) callback(null, groceriesArray);                           // callback function returns
      }, function(tx, error) {                                                  // array of items to the UI
        console.log("Error fetching groceries:" + error.message);               // or error
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
function addGrocery (name, categoryId, groceryUUID, callback) {

  db.transaction(function(tx) {
    let insertQuery = `
    INSERT INTO grocery (name, category_id, id, is_dirty)
    VALUES (?, ?, ?, ?)`;

    tx.executeSql(insertQuery, [name, categoryId || null, groceryUUID || null, 1],
      function onInsertSuccess(tx, groceryResult) {
        console.log(`%cGrocerie "${name}" inserted with id "${groceryResult.insertId}"`,
          'color: green;');
        if (categoryId != null) {                                               // executes if category provided
          let categoryQuery = "SELECT name FROM category WHERE id = ?";
          tx.executeSql(categoryQuery, [categoryId],
            function(tx, categoryResult) {                                      // fetches category_name
            if (categoryResult.rows.length > 0) {                               // executes if provided category exists
              let category_name = categoryResult.rows.item(0).name;
              console.log(`%c"${name}" added to category "${category_name}"`,
                'color: purple;');

              callback(null, groceryResult.insertId);
            } else {                                                            // no match between id and a category
              console.log('%cNo category found for that ID : ',
                'color: yellow;' + categoryId);

              callback(new Error("No category found for that ID."), null);
            }
            }, function(tx, error) {
              console.error('Error fetching category name : ' + error.message);

              callback(error, null);
          });
        } else {
          console.log('%cNo category specified for this item.',
            'color: violet;');

          callback(null, groceryResult.insertId);
        }
      }, function onInsertError(tx, error) {
        console.error(`Insert ERROR! ${error.message}`);

        callback(error, null);
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
    let identifyingQuery = "SELECT name FROM grocery WHERE id = ?";
    tx.executeSql(identifyingQuery, [id],
      function onIdentifyingSuccess(tx, resultSet) {
        if (resultSet.rows.length > 0) {
          let groceryName = resultSet.rows.item(0).name;
          let deletionQuery = "DELETE FROM grocery WHERE id = ?";
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
    let identifyingQuery = "SELECT name, to_be_bought FROM grocery WHERE id = ?";
    tx.executeSql(identifyingQuery, [id], function (tx, resultSet) {
      if (resultSet.rows.length > 0) {
        let groceryName = resultSet.rows.item(0).name
        let currentState = resultSet.rows.item(0).to_be_bought;
        let newState = currentState === 0 ? 1 : 0;
        let updatedStateString = newState === 0 ? "Not to be bought" : "To be bought";

        let updateQuery = `UPDATE grocery
        SET to_be_bought = ?, is_dirty = 1
        WHERE id = ?`;
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
