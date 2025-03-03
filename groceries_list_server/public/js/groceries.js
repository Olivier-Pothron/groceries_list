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
