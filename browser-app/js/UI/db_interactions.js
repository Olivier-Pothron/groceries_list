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
function sendTableData( JSONTable, endpoint) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest(); // Create a new XMLHttpRequest object
    xhr.open("POST", endpoint, true); // Set the request up
    xhr.setRequestHeader("Content-type", "application/json"); // Set content type as JSON

    // Set up the onload event to handle the response
    xhr.onload = () => {
      if (xhr.status == 200) {
        const response = JSON.parse(xhr.responseText);
        console.log("%cHttp response: ", 'color: blue;', xhr.status);
        resolve(response);
      } else {
        const err = new Error("Error sending categories");
        err.original = xhr.status;
        reject(err);
      }
    }
    xhr.onerror = () => reject(new Error("Network error while sending categories"));
    xhr.send(JSONTable); // Send the fucker !
  })
}

async function syncCategoriesUp() {
  console.log("%c\n<:: SYNC CATEGORIES UP REQUEST ::>\n",
    'color: orange; text-decoration: underline;');

  try {
    const dirtyCategories = await getDirtyCategoriesAsync();
    console.log("%cFetching Dirty Categories: ",
      'color: brown;', dirtyCategories);

    const jsonSyncData = JSON.stringify({categories: dirtyCategories});
    const syncEndPoint = "http://localhost:3000/api/sync/up/categories";

    console.log("Sending *categories* xml req.");

    const response = await sendTableData(jsonSyncData, syncEndPoint);
    console.log("%c\n<:: RESPONSE ::>\n",
      'color: mediumseagreen; text-decoration: underline;', response);

    const {categories, uuidMap} = response;

    const updatedCategories = await updateCategoriesUuidAsync(uuidMap);
    console.log("%cCategories UUIDs updated to cannonical ones: ",
      'color: lightblue', updatedCategories);

    const processedCategories = await addCategoriesFromServerAsync(categories);
    console.log("%cCategories upserted to local db: ",
      'color: lime;', processedCategories);
  } catch (error) {
    console.error(error.message);
    console.error(error.original);
  }
}

async function syncGroceriesUp() {
  console.log("%c\n<:: SYNC GROCERIES UP REQUEST ::>\n",
    'color: orange; text-decoration: underline;');

  const lastSyncDate = await fetchTheDateAsync();
  const dirtyGroceries = await getDirtyGroceriesAsync();
  console.log("%cFetching Dirty Groceries: ",
        'color: brown;', dirtyGroceries);

  const jsonSyncData = JSON.stringify({
    groceries: dirtyGroceries,
    lastSync: lastSyncDate
  });
  const syncEndPoint = "http://localhost:3000/api/sync/up/groceries";

  console.log("Sending *groceries* xml req.");

  const response = await sendTableData(jsonSyncData, syncEndPoint);

  const {groceries, uuidMap, syncDate} = response;

  const updatedGroceries = await updateCategoriesUuidAsync(uuidMap);
  console.log("%cGroceries UUIDs updated to cannonical ones!",
    'color: lightblue;', updatedGroceries);

  const processedGroceries = await addGroceriesFromServerAsync(groceries);
  console.log("%cGroceries from server upserted to local db: ",
        'color: lime;', processedGroceries);

  const syncMessage = await updateSyncDateAsync(syncDate);
  console.log(`%c${syncMessage}`, 'color: teal;');
}
