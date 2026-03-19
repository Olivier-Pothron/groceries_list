console.log("'events.js' loaded.");

// DATABASE INITIALIZED CHECK
document.addEventListener("databaseReady", () => {                              // checks for initialization of database
  console.log("%cDatabaseReady Event fired", 'color: green;');
});

allGroceriesList.addEventListener("click", (event) => {
  // DELETE GROCERY
  const deleteButton = event.target.closest(".delete-button");

  if(deleteButton) {
    event.stopPropagation();
    const groceryElement = deleteButton.parentElement;
    deleteGroceryElement(groceryElement);

    return;
  }

  // TOGGLING GROCERY TO_BE_BOUGHT STATE
  const groceryElement = event.target.closest(".grocery-element");              // get clicked grocery element
  if (groceryElement) {
    handleToBeBought(groceryElement);                                           // in handlers.js
  }

  // TOGGLING DISPLAY OF CATEGORY LIST
  const categoryHeader = event.target.closest(".category-header");              // get clicked category list
  if (categoryHeader) {
    const groceriesList = categoryHeader.nextElementSibling;
    const categoryButton = categoryHeader.querySelector('.category-button');
    groceriesDropDown(groceriesList, categoryButton);
  }
});
