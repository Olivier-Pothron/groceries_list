console.log("'ui_updates.js' loaded.");

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
