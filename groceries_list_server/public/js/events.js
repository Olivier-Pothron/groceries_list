console.log("'events.js' loaded.");

// DATABASE INITIALIZED CHECK
document.addEventListener("databaseReady", () => {                              // checks for initialization of database
  console.log("%cDatabaseReady Event fired", 'color: green;');
});

allGroceriesList.addEventListener("click", (event) => {
  // DELETE GROCERY
  const deleteButton = event.target.closest(".delete-button");
  const groceryElement = event.target.closest(".grocery-element");              // get clicked grocery
  const categoryHeader = event.target.closest(".category-header");              // get clicked category list

  if(deleteButton) {
    groceryId = deleteButton.dataset.id;
    console.log(`This is the delete button for ID : ${groceryId}`);
    deleteGrocery(groceryId);
    groceryElement.remove();
    return;
  }

  // TOGGLING GROCERY TO_BE_BOUGHT STATE
  if (groceryElement) {
    toggleToBeBoughtInDB(groceryElement);                                       // in api_calls
  }

  // TOGGLING DISPLAY OF CATEGORY LIST
  if (categoryHeader) {
    const groceriesList = categoryHeader.nextElementSibling;
    const categoryButton = categoryHeader.querySelector('.category-button');
    groceriesDropDown(groceriesList, categoryButton);
  }
});

// TEST BUTTON
testButt.addEventListener("click", () => {
  const groceryArray = ["nono", "bobo", "coco", "lolo", "momo", "popo", "roro", "toto", "koko", "soso"];
  const randomItem = groceryArray[Math.floor(Math.random() * 10) + 1];
  const randomCat = Math.floor(Math.random() * 10) + 1;
  console.log(`Grocery: ${randomItem} / Cat_id: ${randomCat}`);
  addGrocery (randomItem, randomCat);
});
