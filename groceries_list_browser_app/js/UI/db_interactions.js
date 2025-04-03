console.log("'db_interactions.js' loaded.");

function loadGroceriesFromDB() {
  let groceriesArray = [];

  getGroceries(function(error, groceries) {                                     // getting all columns for groceries
    if (error) {
      userLog("ERROR FETCHING GROCERIES", 'error');
    } else if (groceries) {
      userLog("SUCCESS FETCHING GROCERIES FROM DB!", 'success');

      groceriesArray =  groceries;
    }
  });
  return groceriesArray;
}

function loadCategoriesFromDB() {
  let categoriesObject = {};

  getCategories(function(error, categories) {
    if (error) {
      userLog("ERROR FETCHING CATEGORIES", 'error');
    } else if (categories) {
      userLog("SUCCESS FETCHING CATEGORIES FROM DB!", 'success');

      categoriesObject = categories;
    }
  });
  return categoriesObject;
}

function toggleToBeBoughtInDB(itemId, groceryElement, callback) {

  groceryName = groceryElement.dataset.groceryName;

  toggleToBeBought (itemId, function(error, newState) {
    if (error) {
      userLog("ERROR CHANGING STATE!", 'error');
    } else if (newState) {
      userLog(`${groceryName} updated to ${newState}`, 'success');
      if (callback) callback(groceryElement);
    }
  });
}


// DATABASE SYNCING

function exportGroceriesToJSON() {
  data = loadGroceriesFromDB();
  jsonData = JSON.stringify(data);

  return jsonData;
}

function exportCategoriesToJSON() {
  data = loadCategoriesFromDB();
  jsonData = JSON.stringify(data);

  return jsonData;
}

function sendTableData( JSONTable, endpoint, callback ) {
  const xhr = new XMLHttpRequest(); // Create a new XMLHttpRequest object
  xhr.open("POST", endpoint, true); // Set the request up
  xhr.setRequestHeader("Content-type", "application/json"); // Set content type as JSON
  xhr.send(JSONTable); // Send the fucker !

  // Set up the onload event to handle the response
  xhr.onload = function() {
    if (xhr.status == 200) {
      const response = JSON.parse(xhr.responseText);
      console.log("Server response : ", response);
      if (callback) {
        callback(xhr.status);
      }
    } else {
      console.error("Error sending message with status: ", xhr.status);
    }
  }
}

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

function syncGroceriesToServer(callback) {
  const groceriesToSend = [
    { newGroceryName: "portos", category: "alcool" },
    { newGroceryName: "aramis", category: "apéro"}
  ]


}
