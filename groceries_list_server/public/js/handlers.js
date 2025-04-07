console.log("'handlers.js' loaded.");

const handleCustomCategory = (customCategoryName) => {
  return addCategory(customCategoryName)
  .then(categoryObject => {
    const newCategory = categoryObject.name;
    const newCategoryId = categoryObject.id;
    addCategoryToList(newCategory);
    addCategoryToSelector(newCategory, newCategoryId);
    userLog(`Category '${newCategory}' added`, 'success');
    console.log("Handler new categoryId: ", newCategoryId);
    return newCategoryId;
  })
  .catch(error => {
    console.error("<HANDLER> Error adding custom category:", error);
  })
}

const handleGroceryAddition = (itemName, categoryId) => {
  return addGrocery(itemName, categoryId)
  .then(groceryObject => {
    userLog(`'${groceryObject.name}' added to '${groceryObject.category}'`, 'success');
    return groceryObject;
  })
  .catch(error => {
    // console.error("<HANDLER> Error adding grocery:", error);
    throw error;
  })
}

function deleteGroceryElement(groceryElement) {
  const groceryId = groceryElement.dataset.id;
  const groceryName = groceryElement.dataset.name;
  return deleteGrocery(groceryId)
  .then(response => {
    // console.log("Status: ", response.status);
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
    userLog(`'${groceryName}' deleted from database`, 'success');
  })
  .catch(error => {
    throw error;
  })
}
