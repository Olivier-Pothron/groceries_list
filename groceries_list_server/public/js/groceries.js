console.log("'groceries.js' loaded.");

// DOM ELEMENTS
const allGroceriesList = document.getElementById("all-groceries-list");
const testParagraph = document.getElementById("listTest");
const updateButton = document.getElementById("update-button");
const logContainer = document.getElementById("log-container");
const myGroceriesList = document.getElementById("my-groceries-list");

const localButt = document.getElementById("local-button");
const myListButt = document.getElementById("fetch-tbb-groceries");
const testButt = document.getElementById("test-button");
const localRemButt = document.getElementById("local-rem-button");
const syncupButt = document.getElementById("syncup-button");

// CONSTANTS
const collapseSign = '\u005E';
const expandSign = '\u2335';

// GROCERIES LIST DROPDOWN FUNCTION
function groceriesDropDown(groceriesList, categoryButton) {

  if (!groceriesList.classList.contains("visible")) {
    groceriesList.classList.add("visible");
    groceriesList.style.maxHeight = groceriesList.scrollHeight + "px";
    categoryButton.textContent = collapseSign;
  } else {
    groceriesList.classList.remove("visible");
    groceriesList.style.maxHeight = 0;
    categoryButton.textContent = expandSign;
  }
}

// EVENTS //

allGroceriesList.addEventListener("click", (event) => {
  const categoryHeader = event.target.closest(".category-header");              // get clicked category list
  const groceryElement = event.target.closest(".grocery-element");              // get clicked grocery

  // TOGGLING GROCERY TO_BE_BOUGHT STATE
  if (groceryElement) {
    toggleToBeBoughtInDB(groceryElement);
  }

  // TOGGLING DISPLAY OF CATEGORY LIST
  if (categoryHeader) {
    const groceriesList = categoryHeader.nextElementSibling;
    const categoryButton = categoryHeader.querySelector('.category-button');
    groceriesDropDown(groceriesList, categoryButton);
  }
});

// API CALLS

function addCategory (name) {       // ✓
  console.log(name);

  fetch("http://localhost:3000/api/categories/", {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ newCategoryName: name})
  })
  .then(response => {
    if(!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const newCategory = data.name;
    const newCategoryId = data.id;
    addCategoryToSelector(newCategory, newCategoryId);
    userLog(`Category '${newCategory}' added with ID '${categoryId}'`, 'success');
  })
  .catch(error => console.error("Error adding category:", error));
};

function addGrocery (name, categoryId) {  // writes in db with cat_id
  console.log(name);

  fetch("http://localhost:3000/api/groceries/", {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ newGroceryName: name, categoryId: categoryId})
  })
  .then(response => {
    if(!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
    const newGrocery = data.item_name;
    const newGroceryId = data.id;
    const newGroceryCategoryName = data.category;
    const newGroceryCategoryId = data.category_id;
    userLog(`Grocery '${newGrocery}' added with ID '${newGroceryId}'
      in category '${newGroceryCategoryName}' of ID '${newGroceryCategoryId}'`,
      'success');

  })
  .catch(error => console.error("Error adding grocery:", error));
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
  .catch(error => console.error("Error updating grocerie:", error));
}

/*
// ON DATABASE LOADED
// RENDERS GROCERIES LIST AND CATEGORY SELECTOR OPTIONS
document.addEventListener("databaseReady", () => {
  const groceriesArray = loadGroceriesFromDB();
  const categoriesArray = loadCategoriesFromDB();
  renderGroceriesList(groceriesArray);
  renderCategorySelectorOptions(categoriesArray);
});

// REFRESH LIST BUTTON
updateButton.addEventListener("click", () => {
  const groceriesArray = loadGroceriesFromDB();
  const categoriesArray = loadCategoriesFromDB();
  renderGroceriesList(groceriesArray);
  renderCategorySelectorOptions(categoriesArray);
});

// DATABASE STORING AND RETRIEVING
localRemButt.addEventListener("click", () => {
  removeDatabase();
  console.log("Database removed from localStorage");
})

// SYNCING DB
syncupButt.addEventListener("click", () => {
  syncUpDatabase();
})
*/
