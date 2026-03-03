const { table } = require("node:console");

console.log("'db_interactions.js' loaded.");

function loadGroceriesFromDB(callback) {

  getGroceries(function(error, groceries) {                                     // getting all columns for groceries
    if (error) {
      userLog("ERROR FETCHING GROCERIES", 'error');
      callback(error, null);
    } else if (groceries) {
      userLog("SUCCESS FETCHING GROCERIES FROM DB!", 'success');
      callback(null, groceries);
      // console.log("Db interactions Groceries array: ", groceries);
    }
  });
}

function loadCategoriesFromDB(callback) {

  getCategories(function(error, categories) {
    if (error) {
      userLog("ERROR FETCHING CATEGORIES", 'error');
      callback(error, null);
    } else if (categories) {
      userLog("SUCCESS FETCHING CATEGORIES FROM DB!", 'success');
      callback(null, categories);
      // console.log("Db interactions Categories array: ", categories)
    }
  });
}

function toggleToBeBoughtInDB(itemId, groceryElement, callback) {

  let groceryName = groceryElement.dataset.groceryName;

  toggleToBeBought (itemId, function(error, newState) {
    if (error) {
      userLog("ERROR CHANGING STATE!", 'error');
      callback(error, null);
    } else if (newState) {
      userLog(`${groceryName} updated to ${newState}`, 'success');
      callback(groceryElement);
    }
  });
}

// DATABASE SYNCING

function sendTableData( JSONTable, endpoint, callback ) {
  const xhr = new XMLHttpRequest(); // Create a new XMLHttpRequest object
  xhr.open("POST", endpoint, true); // Set the request up
  xhr.setRequestHeader("Content-type", "application/json"); // Set content type as JSON
  xhr.send(JSONTable); // Send the fucker !

  // Set up the onload event to handle the response
  xhr.onload = function() {
    if (xhr.status == 200) {
      const response = JSON.parse(xhr.responseText);
      console.log("%cHttp response: ", 'color: blue;', xhr.status);
      callback(null, response);
    } else {
      console.error("Error sending message with status: ", xhr.status);
      callback(xhr.status, null);
    }
  }
}

function syncCategoriesUp() {
  console.log("%c\n<:: SYNC CATEGORIES UP REQUEST ::>\n",
    'color: orange; text-decoration: underline;');

  getDirtyCategories( (error, dirtyCategories) => {
    if(error) {
      console.error("Error in fetching dirtyCategories.");
      return;
    }
    console.log("%cFetching Dirty Categories: ",
      'color: brown;', dirtyCategories);

    const jsonSyncData = JSON.stringify({categories: dirtyCategories});
    const syncEndPoint = "http://localhost:3000/api/sync/up/categories";

    console.log("Sending *categories* xml req.");
    sendTableData( jsonSyncData, syncEndPoint, (error, response) => {
      if(error) {
        console.error("Error sending categories: ", error);
        return;
      }
      console.log("%c\n<:: RESPONSE ::>\n",
        'color: mediumseagreen; text-decoration: underline;', response);

      const {categories, uuidMap} = response;

      updateCategoriesUuid(uuidMap, (error, updatedCategories) => {
        if (error) {
          console.error("Categories UUIDs update went wrong.", error);
          return;
        }
        console.log("%cCategories UUIDs updated to cannonical ones: ",
          'color: lightblue', updatedCategories);

        addCategoriesFromServer(categories, (error, responseObject) => {
          if(error) {
            console.error("ERROR ADDING CATEGORIES FROM SERVER!");
            return;
          }
          const {duplicate, added} = responseObject;
          console.log("%cCategories already present: ",
            'color: teal;', duplicate);
          console.log("%cCategories added to local db: ", 'color: lime;');
          console.table(added);

          resetDirtyFlags('category', () => {
            if(error) {
              console.error('Error resetting category dirty flags: ', error);
              return;
            }
            console.log("Every category dirty flag set to '0'.");

            console.log("%cCategories after response : ", 'color: pink;');
            console.table(db.exec("SELECT * FROM category;")[0].values);
          });
        });
      });
    });
  });
  // 5. On success, clear is_dirty flags
  // 6. Update last_sync timestamp
}

function syncGroceriesUp() {
  console.log("%c\n<:: SYNC GROCERIES UP REQUEST ::>\n",
    'color: orange; text-decoration: underline;');

  getDirtyGroceries( (error, dirtyGroceries) => {
    if(error) {
      console.error("Error fetching dirty groceries");
      return;
    }
    console.log("%cFetching Dirty Groceries: ",
      'color: brown;', dirtyGroceries);

    const jsonSyncData = JSON.stringify( {groceries: dirtyGroceries} );
    const syncEndPoint = "http://localhost:3000/api/sync/up/groceries";

    console.log("Sending *groceries* xml req.");
    sendTableData( jsonSyncData, syncEndPoint, (error, response) => {
      if(error) {
        console.error("Error sending groceries: ", error);
        return;
      }
      console.log("%c\n<:: RESPONSE ::>\n",
        'color: mediumseagreen; text-decoration: underline;', response);

      const {groceries, uuidMap} = response;

      updateGroceriesUuids( uuidMap, (error, success) => {
        if(error) {
          console.error("Groceries UUIDs update went wrong.", error);
          return;
        }
        console.log("%cGroceries UUIDs updated to cannonical ones!",
          'color: lightblue;');

        addGroceriesFromServer( groceries, (error, responseObject) => {
          if(error) {
            console.error("Error adding groceries from server: ", error);
            return;
          }
          const {duplicate, added} = responseObject;
          console.log("%cGroceries already present: ",
            'color: teal;', duplicate);
          console.log("%cGroceries from server added to local db: ",
            'color: lime;');
          console.table(added);

          resetDirtyFlags('grocery', () => {
            if(error) {
              console.error('Error resetting grocery dirty flags: ', error);
              return;
            }
            console.log("Every grocery dirty flag set to '0'.");

            console.log("%cGroceries after response : ", 'color: pink;');
            console.table(db.exec("SELECT * FROM grocery;")[0].values);
          });
        });
      });
    });
  });
}
