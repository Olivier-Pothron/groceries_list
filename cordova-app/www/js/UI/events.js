console.log("'events.js' loaded.");

// DATABASE STORING AND RETRIEVING
localRemButt.addEventListener("click", () => {
  removeDatabase();
  console.log("Database removed from localStorage");
});

// SYNCING DB
syncupButt.addEventListener("click", () => {
  sync();   //this is for testing purpose
});

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

// REFRESH LIST BUTTON
updateButton.addEventListener("click", () => {
  console.log("Refreshing...");
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
