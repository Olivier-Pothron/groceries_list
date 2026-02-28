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
      console.log("Server response (sendTableData): ", response);
      callback(null, response);
    } else {
      console.error("Error sending message with status: ", xhr.status);
      callback(xhr.status, null);
    }
  }
}

function syncCategoriesUp() {

  getDirtyCategories( (error, dirtyCategories) => {
    if(error) {
      console.error("Error in fetching dirtyCategories.");
      return;
    }
    console.log("%cDirty Categories: ", "color: blue;");
    console.log(dirtyCategories);

    const syncData = {
      categories: dirtyCategories
    }

    const jsonSyncData = JSON.stringify(syncData);

    console.log(jsonSyncData);

    const syncEndPoint = "http://localhost:3000/api/sync/up/categories";

    console.log("Sending *categories* xml req.");
    sendTableData( jsonSyncData, syncEndPoint, (error, response) => {
      if(error) {
        console.error("Error sending categories: ", error);
        return;
      }
      console.log("Server response (syncCategoriesUp): ", response);

      const {categories, uuidMap} = response.payload;

      console.log("ServerCategories : ");
      console.log(categories);

      console.log("uuidMap");
      console.log(uuidMap);

      updateCategoriesUuid(uuidMap, (error, success) => {
        if (error) {
          console.error("Categories UUIDs update went wrong.", error);
          return;
        }
        console.log("Categories UUIDs updated to cannonical ones!");
      });

    });
  });
  // 5. On success, clear is_dirty flags
  // 6. Update last_sync timestamp
}

/*
function syncUp() {

  getDirtyCategories( (error, categoriesArray) => {
    if(error) {
      console.error("Error in fetching dirtyCategories.");
      return;
    }
    console.log("%cDirty Categories: ", "color: blue;");
    console.log(categoriesArray);

    getDirtyGroceries( (error, groceriesArray) => {
      if(error) {
        console.error("Error fetching dirtyGroceries.");
        return;
      }
      console.log("%cDirty Groceries: ", "color: blue;");
      console.log(groceriesArray);

      fetchTheDate( (error, lastSync) => {
        if(error) {
          console.error("Error fetching the date.");
          return;
        }
        console.log("%cLast Sync Date: ", "color: blue;");
        console.log(lastSync);

        const syncData = {
          last_sync: lastSync,
          categories: categoriesArray,
          groceries: groceriesArray
        }

        const jsonSyncData = JSON.stringify(syncData);

        console.log(jsonSyncData);

        const syncEndPoint = "http://localhost:3000/api/sync/up";

        console.log("Sending *categories* xml req.");
        sendTableData( jsonSyncData, syncEndPoint, (status) => {
          console.log(status);
        });
      });
    });
  });
  // 5. On success, clear is_dirty flags
  // 6. Update last_sync timestamp
}

function syncDown(callback) {
  // 1. Get last_sync timestamp
  // 2. Request changes from server
  // 3. Insert/update from received records
  // 4. Update last_sync timestamp
}
*/

/*
// function first sends categories and then groceries if categories success
function syncUpDatabase() {
  const categoriesUrl =  "http://localhost:3000/api/sync/syncup/categories";
  const categoriesJSONData = exportCategoriesToJSON();
  console.log("Sending *categories* xml req.");

  sendTableData( categoriesJSONData, categoriesUrl, function(response) {
    if (response == 200) {
      const groceriesUrl =  "http://localhost:3000/api/sync/syncup/groceries/";
      const groceriesJSONData = exportGroceriesToJSON();
      console.log("Sending *groceries* xml req.");

      sendTableData( groceriesJSONData, groceriesUrl);
    } else {
      console.error("Error sending categories table");
    }
  });
}
*/

// SYNC TEST :

// function syncGroceriesToServer(callback) {
//   const groceriesToSend = [
//     { newGroceryName: "portos", category: "alcool" },
//     { newGroceryName: "aramis", category: "apéro"}
//   ]
// }
