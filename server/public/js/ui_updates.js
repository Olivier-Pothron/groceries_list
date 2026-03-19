console.log("'ui_updates.js' loaded.");

// ADD CATEGORY TO SELECTOR
function addCategoryToSelector(category) {
  const { name, id } = category;

  console.log(`=> addCategoryToSelector : ${name} id : ${id}`);

  newSelectorOption = document.createElement("option");
  newSelectorOption.setAttribute('data-id', id);
  newSelectorOption.textContent = name;
  newSelectorOption.value = name;

  categorySelector.add(newSelectorOption, categorySelector.options.length - 1);
}

// ADD CATEGORY TO MASTER LIST
function addCategoryToList(category) {
  const categoryName = category.name;

  const newCategory = createCategoryElement(categoryName);
  categoriesList.appendChild(newCategory);
  return newCategory;
}

// ADD GROCERY TO GROCERIES LIST
function addGroceryToGroceriesList(grocery) {
  const groceryElement = createGroceryElement(grocery);
  const categoryQuery = `[data-name="${grocery.category}"]`;
  let category = categoriesList.querySelector(categoryQuery);

  if(!category) {
    // passing a made-up 'category object' to feed the function
    category = addCategoryToList({ name: grocery.category });
  }

  const groceriesList = category.querySelector("ul");
  groceriesList.appendChild(groceryElement);

  // ensures a list drops down on addition of new grocery
  if (!groceriesList.classList.contains("visible")) {
    groceriesList.classList.add("visible");
    categoryButton = category.querySelector(".category-button");
    categoryButton.textContent = collapseSign;
  }
  groceriesList.style.maxHeight = groceriesList.scrollHeight + "px";
}

// CREATE ELEMENTS \\
function createCategoryElement(category) {
  const categoryName = category.name;

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
  deleteButton.textContent = "<X>";

  groceryElement.appendChild(deleteButton);

  return groceryElement;
}


// WHAT I NEED FOR A SMOOTH ADDItiON/DELETION OF GROCERY:
//  > ADDITION :
//       - adding class "visible" to groceriesList if not present
//       - if class "visible" present, expand list gradually
//       - THEN add invisible grocery element
//       - add class "visible" to grocery element (or animation ?)
