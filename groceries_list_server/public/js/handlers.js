console.log("'handlers.js' loaded.");

const handleCustomCategory = (customCategoryName) => {
  return addCategory(customCategoryName)
  .then(categoryObject => {
    const newCategory = categoryObject.name;
    const newCategoryId = categoryObject.id;
    addCategoryToList(newCategory);
    addCategoryToSelector(newCategory, newCategoryId);
    userLog(`Category '${newCategory}' added`, 'success');
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
    groceryElement.classList.add('fade-out');
    setTimeout(() => {
      groceryElement.remove();
    }, 1000);
    userLog(`'${groceryName}' deleted from database`, 'success');
  })
  .catch(error => {
    throw error;
  })
}
