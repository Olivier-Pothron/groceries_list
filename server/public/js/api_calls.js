console.log("'api_calls.js' loaded.");

function addCategory (name) {
  return fetch(`api/categories/`, {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ newCategoryName: name.toLowerCase() })
  })
  .then(response => {
    if(!response.ok) {
      return response.json().then( err => {
        throw new Error(err.error || `HTTP error! Status: ${response.status}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log("<API CALL> addCategory: ", data);
    return data;
  })
  .catch(error => {
    console.error("Error adding category:", error);
    throw error;
  })
};

function addGrocery (name, categoryId) {
  return fetch(`api/groceries/`, {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ newGroceryName: name, categoryId: categoryId})
  })
  .then(response => {
    if(!response.ok) {
      return response.json().then( err => {
        throw new Error(err.error || `HTTP error! Status: ${response.status}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log("<API CALL> addGrocery: ", data);
    return data;
  })
  .catch(error => {
    console.error("<API CALL> Error adding grocery:", error.message);
    throw error;
  });
}

function deleteGrocery (groceryId) {
  return fetch(`api/groceries/${groceryId}`, {
    method: "DELETE"
  })
  .then(response => {
    if(!response.ok) {
      return response.json().then( err => {
        throw new Error(err.error || `HTTP error! Status: ${response.status}`);
      });
    }
    return response.json();
  })
  .catch(error => {
    console.log("<API CALL> Error deleting grocery:", error.message);
    throw error;
  })
}

function toggleToBeBoughtInDB(groceryId, newToBeBoughtState) {
  return fetch(`api/groceries/${groceryId}`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ toBeBought: newToBeBoughtState })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then( err => {
        throw new Error(err.error || `HTTP error! Status: ${response.status}`);
      });
    }
    return response.json();
  })
  .catch(error => {
    console.error("<API CALL> Error updating grocery:", error);
    throw error;
  })
}
