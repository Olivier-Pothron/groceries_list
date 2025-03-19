console.log("'api_calls.js' loaded.");

function addCategory (name) {       // ✓
  return fetch("http://localhost:3000/api/categories/", {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ newCategoryName: name.toLowerCase() })
  })
  .then(response => {
    if(!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    return data;
  })
  .catch(error => console.error("Error adding category:", error));
};

function addGrocery (name, categoryId) {  // ✓
  return fetch("http://localhost:3000/api/groceries/", {
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
      })
    }
    return response.json();
  })
  .then(data => {
    return data;
  })
  .catch(error => {
    // console.error("<API CALL> Error adding grocery:", error.message);
    throw error;
  });
}

function deleteGrocery (groceryId) {
  return fetch(`http://localhost:3000/api/groceries/${groceryId}`, {
    method: "DELETE"
  })
  .then(response => {
    if(!response.ok) {
      return response.json().then( err => {
        throw new Error(err.error || `HTTP error! Status: ${response.status}`);
      })
    }
    return response;
  })
  .catch(error => {
    console.log("Error deleting grocery:", error.message);
  })
}

function toggleToBeBoughtInDB(element) {  // ✓
  const groceryName = element.dataset.name;
  const groceryId = element.dataset.id;
  const toBeBoughtState = element.dataset.toBeBought;
  const newToBeBoughtState = toBeBoughtState == '0' ? 1 : 0;

  fetch(`http://localhost:3000/api/groceries/${groceryId}`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ toBeBought: newToBeBoughtState })
  })
  .then(response => {
    if (response.ok) {  // Update client side
      element.dataset.toBeBought = newToBeBoughtState;
      element.classList.toggle("to-be-bought");
      userLog(`${groceryName} to_be_bought state updated to ${newToBeBoughtState}`, 'success');
    } else {
      console.error("Error updating to_be_bought value!");
    }
  })
  .catch(error => console.error("Error updating grocery:", error));
}
