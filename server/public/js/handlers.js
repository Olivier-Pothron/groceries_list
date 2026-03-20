console.log("'handlers.js' loaded.");

const handleCustomCategory = (customCategoryName) => {
  return addCategory(customCategoryName)
  .then(categoryObject => {
    const { name, id } = categoryObject;
    addCategoryToList(categoryObject);
    addCategoryToSelector(categoryObject);
    userLog(`Category '${name}' added`, 'success');
    console.log("<HANDLER> new categoryId: ", id);
    return id;
  })
  .catch(error => {
    console.error("<HANDLER> Error adding custom category:", error);
    throw error;
  });
}

const handleGroceryAddition = (itemName, categoryId) => {
  return addGrocery(itemName, categoryId)
  .then(groceryObject => {
    addGroceryToGroceriesList(groceryObject);
    userLog(`'${groceryObject.name}' added to '${groceryObject.category}'`, 'success');
    console.log("<HANDLER> new grocery object: ", groceryObject);
    return groceryObject;
  })
  .catch(error => {
    console.error("<HANDLER> Error adding grocery:", error);
    throw error;
  });
}

function deleteGroceryElement(groceryElement) {
  const groceryId = groceryElement.dataset.id;
  const groceryName = groceryElement.dataset.name;
  deleteGrocery(groceryId)
  .then(response => {
    const groceriesList = groceryElement.parentNode;
    const categoryElement = groceriesList.parentNode;
    console.log("Parent Node of deleted element: ", groceriesList);
    groceryElement.classList.add('fade-out');
    setTimeout(() => {
      groceryElement.remove();
      console.log("Number of elements in groceries list: ", groceriesList.childElementCount);
      if ( groceriesList.childElementCount == 0)
        setTimeout(() => {
      categoryElement.remove();
    }, 500);
  }, 500);
    console.log("<HANDLER> deleted grocery: ", groceryId);
    userLog(`'${groceryName}' deleted from database`, 'success');
  })
  .catch(error => console.error("<HANDLER> Error deleting grocery:", error));
}

function handleToBeBought(groceryElement) {
  const groceryName = groceryElement.dataset.name;
  const groceryId = groceryElement.dataset.id;

  toggleToBeBoughtInDB(groceryId)
  .then(response => {
    const newToBeBoughtState = response.toBeBought;
    groceryElement.dataset.toBeBought = newToBeBoughtState;
    groceryElement.classList.toggle("to-be-bought");
    console.log(`${groceryName} to_be_bought state updated to ${newToBeBoughtState}`);
    userLog(`${groceryName} to_be_bought state updated to ${newToBeBoughtState}`, 'success');
  })
  .catch(error => console.error("<HANDLER> Error updating grocery:", error));
}
