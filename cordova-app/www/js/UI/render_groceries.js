console.log("'render_groceries.js' loaded");

// DOM ELEMENTS
const allGroceriesList = document.getElementById("all-groceries-list");
const updateButton = document.getElementById("update-button");
const myGroceriesList = document.getElementById("my-groceries-list");

const resetButton = document.getElementById("reset-button");
const seedButton = document.getElementById("seed-button");
const syncCatUpButt = document.getElementById("sync-categories-up-button");
const syncGroUpButt = document.getElementById("sync-groceries-up-button");

// CONSTANTS
const collapseSign = '\u005E';
const expandSign = '\u2335';

// RENDERING FUNCTIONS

function renderGroceriesList(arrayOfGroceries) {

  allGroceriesList.innerHTML = "";

  const categoriesMap = arrayOfGroceries.reduce((acc, grocery) => {             // reorganize groceries by category
    const categoryKey = grocery.category || "No category";
    if (!acc[categoryKey]) {
      acc[categoryKey] = []
    }
    acc[categoryKey].push(grocery);

    return acc;
  }, {});

  for(let category in categoriesMap) {
    const categoryElement = createCategoryElement(category, categoriesMap[category]);
    allGroceriesList.appendChild(categoryElement);
  }
}

// might need to refactor/rename function below. Causes confusion in modal_form.
function createCategoryElement(categoryName, groceriesArray) {
  const categoryElement = document.createElement("li");
  categoryElement.classList.add("category-element");

  categoryElement.setAttribute('data-category-name', categoryName);

  const categoryHeader = document.createElement("div");
  categoryHeader.classList.add("category-header");

  const categoryTitle = document.createElement("h3");
  categoryTitle.classList.add("category-title");
  categoryTitle.textContent = categoryName;

  const categoryButton = document.createElement("div");
  categoryButton.classList.add("category-button");
  categoryButton.textContent = expandSign;

  // ASSEMBLING THE HEADER
  categoryHeader.appendChild(categoryTitle);
  categoryHeader.appendChild(categoryButton);
  categoryElement.appendChild(categoryHeader);

  //////////////////////////////////////////////////////////////////////////////

  const groceriesList = document.createElement("ul");
  groceriesList.classList.add("groceries-list");

  groceriesArray.forEach(grocery => {
    groceryElement = createGroceryElement(grocery);
    groceriesList.appendChild(groceryElement);
  });

  categoryElement.appendChild(groceriesList);

  return categoryElement;
}

function createGroceryElement(grocery) {
  const groceryElement = document.createElement("li");
  groceryElement.classList.add("grocery-element");

  groceryElement.setAttribute('data-grocery-id', grocery.id);
  groceryElement.setAttribute('data-grocery-name', grocery.name);
  groceryElement.setAttribute('data-grocery-category', grocery.category);
  groceryElement.setAttribute('data-grocery-dirty', grocery.isdirty);

  if (grocery.toBeBought) {
    groceryElement.classList.add("to-be-bought");
  }

  const groceryName = document.createElement("div");
  groceryName.textContent = grocery.name;
  groceryName.classList.add("grocery-text");

  const groceryCategory = document.createElement("div");
  groceryCategory.textContent = grocery.category || "No category";
  groceryCategory.classList.add("category-text");

  // ASSEMBLING THE GROCERY
  groceryElement.appendChild(groceryName);
  groceryElement.appendChild(groceryCategory);

  return groceryElement;
}

function renderCategorySelectorOptions(arrayOfCategories) {

  categorySelector.innerHTML = "";
  const disabledOption = document.createElement("option");
  disabledOption.value = "";
  disabledOption.textContent = 'Select category';
  disabledOption.disabled = true;

  categorySelector.add(disabledOption, 0);

  for(category of arrayOfCategories) {
    const categoryOption = document.createElement("option");
    // console.log("rendercategory ID: ", category.id);
    categoryOption.setAttribute('data-category-id', category.id);
    categoryOption.textContent = category.name;
    categoryOption.value = category.name;
    categorySelector.add(categoryOption);
  }

  const addCustomSelectorOption = document.createElement("option");
  addCustomSelectorOption.value = "custom";
  addCustomSelectorOption.textContent = "***ajouter***";
  categorySelector.add(addCustomSelectorOption, categorySelector.options.length);
}

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

// ADD CATEGORY TO SELECTOR
function addCategoryToSelector(newCategory, newCategoryId) {
  // console.log("=> addCategoryToSelector");

  newSelectorOption = document.createElement("option");
  newSelectorOption.setAttribute('data-category-id', newCategoryId);
  newSelectorOption.textContent = newCategory;
  newSelectorOption.value = newCategory;

  categorySelector.add(newSelectorOption, categorySelector.options.length - 1);
}

// ON DATABASE LOADED
// RENDERS GROCERIES LIST AND CATEGORY SELECTOR OPTIONS
document.addEventListener("databaseReady", () => {
  console.log("%cDatabaseReady Event fired", 'color: green;');

  loadGroceriesFromDB( (error, groceries) => {
    if(error) {
      console.error("Error fetching groceries.");
      return;
    }

    renderGroceriesList(groceries);
  });

  loadCategoriesFromDB( (error, categories) => {
    if(error) {
      console.error("Error fetching categories.");
      return;
    }

    renderCategorySelectorOptions(categories);
  });
});

allGroceriesList.addEventListener("click", (event) => {
  const categoryHeader = event.target.closest(".category-header");              // get clicked category list
  const groceryElement = event.target.closest(".grocery-element");              // get clicked grocery

  // TOGGLING GROCERY TO_BE_BOUGHT STATE
  if (groceryElement) {
    const groceryId = groceryElement.dataset.groceryId;

    toggleToBeBoughtInDB(groceryId, groceryElement, (groceryElement) => {
      groceryElement.classList.toggle("to-be-bought");
    });
  }

  // TOGGLING DISPLAY OF CATEGORY LIST
  if (categoryHeader) {
    // Listen for the transitionstart event
    const groceriesList = categoryHeader.nextElementSibling;

    const categoryButton = categoryHeader.lastChild;
    groceriesDropDown(groceriesList, categoryButton);
  }
});
