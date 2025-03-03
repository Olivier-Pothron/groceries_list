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
  return fetch("http://localhost:3000/api/categories/", {
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
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    return data;
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

// ELEMENT CREATION

function createCategoryElement(categoryName) {
  const categoryElement = document.createElement("li");
  categoryElement.classList.add("category-element");

  categoryElement.setAttribute('data-name', categoryName);

  const categoryHeader = document.createElement("div");
  categoryHeader.classList.add("category-header");

  const categoryTitle = document.createElement("h3");
  categoryTitle.classList.add("category-title");
  categoryTitle.textContent = categoryName;

  const categoryButton = document.createElement("div");
  categoryButton.classList.add("category-button");
  categoryButton.textContent = expandSign;

  const groceriesList = document.createElement("ul");
  groceriesList.classList.add("groceries-list");

  // ASSEMBLING THE HEADER
  categoryHeader.appendChild(categoryTitle);
  categoryHeader.appendChild(categoryButton);
  categoryElement.appendChild(categoryHeader);
  categoryElement.appendChild(groceriesList);

  return categoryElement;
}

function createGroceryElement(grocery) {
  const groceryElement = document.createElement("li");
  groceryElement.classList.add("grocery-element");

  groceryElement.setAttribute('data-id', grocery.id);
  groceryElement.setAttribute('data-name', grocery.name);
  groceryElement.setAttribute('data-category', grocery.category);
  groceryElement.setAttribute('data-to-be-bought', grocery.to_be_bought);

  const groceryName = document.createElement("div");
  groceryName.textContent = grocery.name;
  groceryName.classList.add("grocery-text");

  const groceryCategory = document.createElement("div");
  groceryCategory.classList.add("category-text");

  // ASSEMBLING THE GROCERY
  groceryElement.appendChild(groceryName);
  groceryElement.appendChild(groceryCategory);

  return groceryElement;
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
