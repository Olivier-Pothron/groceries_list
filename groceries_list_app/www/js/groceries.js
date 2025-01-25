// look for IIFE (Immediately Invoked Function Expression)
// look for document fragment

// LOOK FOR RENAMING FUNCTIONS TO MAKE IT CLEARER !!!

const allGroceriesList = document.getElementById("all_groceries_list");
const addNewItemForm = document.getElementById("add_item_form");
const formItemName = document.getElementById("new_item_name");
const categorySelector = document.getElementById("category_selector");
const testParagraph = document.getElementById("listTest");
const updateButton = document.getElementById("update_button");
const customOptionInput = document.getElementById("custom-option-input");
const customValidationButton = document.getElementById("custom-validation-button");
const logContainer = document.getElementById("log-container");

const collapseSign = '\u22BC';
const expandSign = '\u22BD';

const userLog = (message, type) => {  // logs message to the UI
  let logColor = {
    success: "green",
    error: "red",
    warning: "orange"
  }[type];
  console.log("userLog Test")
  let log = document.createElement("p");
  log.textContent = `${message}`;
  log.style.color = logColor;

  // Insert the new log at the beginning of the log container
  logContainer.insertBefore(log, logContainer.firstChild);

  let logsCollection = logContainer.getElementsByTagName("p");
  if (logsCollection.length > 3) {
    logContainer.removeChild(logsCollection[logsCollection.length - 1]);
  }
}

let customCategoryOption = null; // Global variable to keep track of the last custom option

// ################## DATABASE INTERACTION FUNCTIONS ###########################

function fetchingGroceries() {                                                  // fills the groceries list

  getGroceries(function(error, groceries) {                                     // getting all columns for groceries
    if (error) {
      console.error("ERROR FETCHING GROCERIES");
    } else if (groceries) {
      console.log("SUCCESS FETCHING GROCERIES FROM DB!");

      // Building UI List
      buildGroceriesList(groceries);
    }
  });
}

function categorySelectorFill() {                                               // fills the category selector

  getCategories(function(error, categories) {
    if (error) {
      userLog("ERROR FETCHING CATEGORIES", 'error');
    } else if (categories) {
      userLog("SUCCESS FETCHING CATEGORIES FROM DB!", 'success');               // better put it in a div upper-right
      for(category of categories) {
        const categoryOption = document.createElement("option");
        categoryOption.setAttribute('data-category-id', category.ID);
        categoryOption.textContent = category.name;
        categoryOption.value = category.name;
        categorySelector.add(categoryOption);
      }
    }
    addCustomSelectorOption = document.createElement("option");
    addCustomSelectorOption.value = "custom";
    addCustomSelectorOption.textContent = "***ajouter***";
    categorySelector.add(addCustomSelectorOption, categorySelector.options.length);
  });
}

function addCategoryToSelector(newCategory, newCategoryId) {

  newSelectorOption = document.createElement("option");
  newSelectorOption.setAttribute('data-category-id', newCategoryId);
  newSelectorOption.textContent = newCategory;
  newSelectorOption.value = newCategory;

  categorySelector.add(newSelectorOption, categorySelector.options.length - 1);
}

function addNewCategory(categoryName, callback) {

  addCategory(categoryName, function(error, insertId) {
    if (error) {
      console.error('ERROR ADDING CATEGORY!' + error.message);

      if (callback) callback(error, null);
    } else if (insertId) {
      const newCategory = {
        id: insertId,
        name: categoryName
      }
      console.log(`SUCCESS ADDING ${newCategory.name} WITH ID:  ${newCategory.id}`);

      if (callback) callback(null, insertId);
    }
  });
}

function addNewItem(itemName, categoryId, categoryName) {                       // add item to UI & DB

  // This adds the item to the database
  addGrocery(itemName, categoryId, function(error, insertId) {
    if (error) {
      if (error.message.includes("UNIQUE constraint failed")) {                 // check if item in cat already in dd
        userLog(`${itemName} already in database with category ${categoryName}.`, 'error');
      } else {
        userLog(`ERROR ADDING ITEM! ${error.message}`, 'error');
      }
      return;
    } else if (insertId) {
      userLog(`${itemName} added to ${categoryName} category.`)
      // This adds the item to the UI groceries list
      const newItem = {
        id: insertId,
        name: itemName,
        category: categoryName
      }

      // This searches for an existing category
      categoryQuery = `[data-category-name="${newItem.category}"]`
      console.log(categoryQuery);
      const existingCategory = allGroceriesList.querySelector(categoryQuery);
      console.log(existingCategory);
      if (!existingCategory) console.log(`Adding ${newItem.name} to new category.`)

      if (existingCategory) {
        const newGrocery = addGroceryToList(newItem);
        const existingCategoryList = existingCategory.querySelector("ul");
        existingCategoryList.appendChild(newGrocery);
      } else if (categoryName) {  // ADDING NEW CATEGORY + ITEM
        const newCategoryElement = addCategoryToList(categoryName, [newItem]);
        allGroceriesList.appendChild(newCategoryElement);
        addCategoryToSelector(categoryName, categoryId);
      }
    }
  });
}

function changeToBeBoughtState(itemId, groceryElement) {

  groceryName = groceryElement.dataset.groceryName;

  toggleToBeBought (itemId, function(error, newState) {
    if (error) {
      userLog("ERROR CHANGING STATE!", 'error');
    } else if (newState) {
      changeToBeBoughtStateInList(groceryElement);
      userLog(`${groceryName} updated to ${newState}`, 'success');
    }
  });
}

// ############################ UI FUNCTIONS ###################################

function buildGroceriesList(arrayOfGroceries) {

  allGroceriesList.innerHTML = "";

  const categoriesMap = arrayOfGroceries.reduce((acc, grocery) => {             // reorganize groceries by category
    if (!acc[grocery.category]) {
      acc[grocery.category] = []
    }
    acc[grocery.category].push(grocery);

    return acc;
  }, {});

  for(category in categoriesMap) {
    categoryElement = addCategoryToList(category, categoriesMap[category]);
    allGroceriesList.appendChild(categoryElement);
  }
}

function addCategoryToList(categoryName, groceriesArray) {

  const categoryElement = document.createElement("li");
  categoryElement.classList.add("category_element");

  categoryElement.setAttribute('data-category-name', categoryName);

  const categoryHeader = document.createElement("div");
  categoryHeader.classList.add("category_header");

  const categoryTitle = document.createElement("h3");
  categoryTitle.classList.add("category_title");
  categoryTitle.textContent = categoryName;

  const categoryButton = document.createElement("div");
  categoryButton.classList.add("category_button");
  categoryButton.textContent = expandSign;


  categoryHeader.appendChild(categoryTitle);
  categoryHeader.appendChild(categoryButton);
  categoryElement.appendChild(categoryHeader);


  const groceriesList = document.createElement("ul");
  groceriesList.classList.add("groceries_list");
  groceriesList.style.display = "none";                                         // Initially hide the list


  groceriesArray.forEach(grocery => {
    groceryElement = addGroceryToList(grocery);
    groceriesList.appendChild(groceryElement);
  });

  // TO_BE_BOUGHT STATE TOGGLER
  groceriesList.addEventListener("click", (event) => {
    const groceryElement = event.target.closest("li");                          // get clicked grocery
    const groceryId = groceryElement.dataset.groceryId;

    changeToBeBoughtState(groceryId, groceryElement);
  });

  // EXPANDING/COLLAPSING CATEGORY BUTTON
  categoryButton.addEventListener("click", (event) => {
    if (groceriesList.style.display === "none") {
      groceriesList.style.display = "block";
      categoryButton.textContent = collapseSign;
    } else {
      groceriesList.style.display = "none";
      categoryButton.textContent = expandSign;
    }
  })

  categoryElement.appendChild(groceriesList);

  return categoryElement;
}

function addGroceryToList(grocery) {

  const groceryElement = document.createElement("li");
  groceryElement.classList.add("grocery_element");

  groceryElement.setAttribute('data-grocery-id', grocery.id);
  groceryElement.setAttribute('data-grocery-name', grocery.name);
  groceryElement.setAttribute('data-grocery-category', grocery.category);

  if (grocery.toBeBought) {
    groceryElement.classList.add("to_be_bought");
  }

  const groceryName = document.createElement("div");
  groceryName.textContent = grocery.name;

  const groceryCategory = document.createElement("div");                        // the handling of "no cat" product is
  groceryCategory.textContent = grocery.category;                               // on the database side

  groceryElement.appendChild(groceryName);
  groceryElement.appendChild(groceryCategory);

  return groceryElement;
}

function changeToBeBoughtStateInList(groceryElement) {

  groceryElement.classList.toggle("to_be_bought");
}

// CUSTOM OPTION
function checkCustomOption(selectElement) {

  if (selectElement.value === "custom") {
    customOptionInput.style.display = "inline";
    customValidationButton.style.display = "inline";
    customOptionInput.value = "";
    const formButton = addNewItemForm.querySelector('button[type="submit"]');
    formButton.disabled = true;

    if (customCategoryOption) {
      categorySelector.removeChild(customCategoryOption);
      addNewItemForm.reset();
      customCategoryOption = null;
    }
  } else {
    customOptionInput.style.display = "none";
    customValidationButton.style.display = "none";
    const formButton = addNewItemForm.querySelector('button[type="submit"]');
    formButton.disabled = false;
  }
}

function validateCustomOption() {

  const customValue = customOptionInput.value.trim();
  const formButton = addNewItemForm.querySelector('button[type="submit"]');
  formButton.disabled = false;

  if (customValue) {
    customCategoryOption = document.createElement("option");
    customCategoryOption.value = customOptionInput.value;
    customCategoryOption.textContent = "$$$ " + customOptionInput.value;
    categorySelector.add(customCategoryOption, 1);
    categorySelector.value = customCategoryOption.value;
  } else {
    customCategoryOption = null;
    categorySelector.selectedIndex = 0;
  }
  customOptionInput.style.display = "none";
  customValidationButton.style.display = "none";
}

function resetFormValues() {
  formItemName.value = "";
  categorySelector.value = "no category";
  customCategoryOption = null;
}

// ########################## EVENT LISTENERS ##################################

// SCRIPT LOADED CHECK
document.addEventListener("deviceready", () => {                                // checks for loading of script
  console.log("%cGroceries.js Loaded", 'color: green;');
});

// DATABASE INITIALIZED CHECK
document.addEventListener("databaseReady", () => {                              // checks for initialization of database
  console.log("%cDatabaseReady Event fired", 'color: green;');
  fetchingGroceries();
  categorySelectorFill();
});

// REFRESH LIST BUTTON
updateButton.addEventListener("click", () => {

  fetchingGroceries();
});

// ADD ITEM FORM EVENT
addNewItemForm.addEventListener("submit", (event) => { // add grocery

  event.preventDefault();

  const itemName = formItemName.value;  // get item name

  if (itemName) {
    // get the selected category option
    const selectedOption = categorySelector.options[categorySelector.selectedIndex];
    const categoryName = selectedOption.value;
    const categoryId = selectedOption.dataset.categoryId;

    console.log(`Sent through the form : ${itemName} / ${categoryName} / ${categoryId}`)

    if (customCategoryOption && categoryName === customCategoryOption.value) {
      console.log("customCategoryOption sent through the form");
      addNewCategory(categoryName, (error, newCategoryId) => {
        if (error) {
          userLog("Error adding custom category.", 'error')
        } else if (newCategoryId) {
          categorySelector.removeChild(selectedOption);
          addNewItem(itemName, newCategoryId, categoryName);
          resetFormValues()
          customCategoryOption = null;
        }
      });
    } else {
      addNewItem(itemName, categoryId, categoryName);
      addNewItemForm.reset();
      customCategoryOption = null;
    }
  }
});

// THIS CHECKS IF THE CUSTOM OPTION IS SELECTED IN SELECTOR
categorySelector.addEventListener("change", (event) => {
  const selectedOption = event.target.options[event.target.selectedIndex];
  const categoryId = selectedOption.dataset.dataCategoryId;
  console.log(`Category Id: ${categoryId} & Value: ${selectedOption.value}`);

  checkCustomOption(event.target);
});

// VALIDATE CUSTOM OPTION EVENT
customValidationButton.addEventListener("click", () => {

  const customOptionInputValue = customOptionInput.value.trim().toLowerCase();
  const selectionQuery = `option[value="${customOptionInputValue}"]`;
  console.log("Custom Option Input Value : " + customOptionInputValue);

  // checks if category already exists in selector
  const categoryAlreadyInSelector = categorySelector.querySelector(selectionQuery);
  console.log("Category Already In Selector : " + customOptionInputValue);

  if (customOptionInputValue === "") {
    // console.log("Empty Custom Category Value!")
    validateCustomOption();
  } else if (categoryAlreadyInSelector) {
    userLog("Custom Category already in list!", "warning");
  } else {
    console.log("validating custom option...");
    validateCustomOption();
  }
});
