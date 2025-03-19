console.log("'ui_updates.js' loaded.");

// ADD CATEGORY TO SELECTOR
function addCategoryToSelector(newCategory, newCategoryId) {
  console.log(`=> addCategoryToSelector : ${newCategory} id : ${newCategoryId}`);

  newSelectorOption = document.createElement("option");
  newSelectorOption.setAttribute('data-id', newCategoryId);
  newSelectorOption.textContent = newCategory;
  newSelectorOption.value = newCategory;

  categorySelector.add(newSelectorOption, categorySelector.options.length - 1);
}

// ADD CATEGORY TO MASTER LIST
function addCategoryToList(categoryName) {
  const newCategory = createCategoryElement(categoryName);
  categoriesList.appendChild(newCategory);
  return newCategory;
}

// ADD GROCERY TO CATEGORY LIST
function addGroceryToCategoryList(groceryObject) {
  const newGrocery = createGroceryElement(groceryObject);
  const categoryQuery = `[data-name="${groceryObject.category}"]`;
  const existingCategory = categoriesList.querySelector(categoryQuery);
  if(!existingCategory) { // when adding the first grocery without a category
    const noCategory = addCategoryToList("no category");
    const existingCategoryList = noCategory.querySelector("ul");
    existingCategoryList.appendChild(newGrocery);
    return;
  }
  const existingCategoryList = existingCategory.querySelector("ul");
  existingCategoryList.appendChild(newGrocery);
}

// CREATE ELEMENTS \\
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
  groceryElement.textContent = grocery.name;

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  // deleteButton.setAttribute('data-id', grocery.id);
  deleteButton.textContent = "<X>";

  groceryElement.appendChild(deleteButton);

  return groceryElement;
}

// OLD STUFF ::
/* function createGroceryElement(grocery) {
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
*/
