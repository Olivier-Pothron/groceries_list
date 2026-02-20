console.log("'render_myList.js' loaded");

//////////////////
// DOM ELEMENTS //
//////////////////
const myGroceriesList = document.getElementById("my-groceries-list");

const localButt = document.getElementById("local-button");
const localRemButt = document.getElementById("local-rem-button");

/////////////////////////
// RENDERING FUNCTIONS //
/////////////////////////
function renderMyGroceriesList(groceriesArray) {
  myGroceriesList.innerHTML = "";
  const toBeBoughtGroceries = groceriesArray.filter((grocery) => grocery.toBeBought === 1);
  if (toBeBoughtGroceries.length === 0) {
    console.log("NO GROCERY!");
    return;
  }

  for(let grocery of toBeBoughtGroceries) {
    if(grocery.toBeBought === 1) {
      const groceryElement = createGroceryElement(grocery);
      myGroceriesList.appendChild(groceryElement);
    }
  }
}

function createGroceryElement(grocery) {
  const groceryElement = document.createElement("li");
  groceryElement.classList.add("grocery-element");

  groceryElement.setAttribute('data-grocery-id', grocery.id);
  groceryElement.setAttribute('data-grocery-name', grocery.name);
  groceryElement.setAttribute('data-grocery-category', grocery.category);

  const groceryName = document.createElement("div");
  groceryName.textContent = grocery.name;
  groceryName.classList.add("grocery-text");

  const groceryCategory = document.createElement("div");
  groceryCategory.textContent = grocery.category || "No category";
  groceryCategory.classList.add("category-text");

  groceryElement.appendChild(groceryName);
  groceryElement.appendChild(groceryCategory);

  return groceryElement;
}

// REMOVE AN ELEMENT FROM LIST                    // (!) prevent double clicks !
myGroceriesList.addEventListener("click", (event) => {
  const groceryElement = event.target.closest(".grocery-element");

  if(groceryElement) {

    // get the actual height for the transition
    const currentHeight = getComputedStyle(groceryElement).height;
    groceryElement.style.height = currentHeight;
    setTimeout(() => {
      groceryElement.style.height = 0;
      groceryElement.classList.add("fading-out");
      removeFromMyList(groceryElement);
    }, 10);  // Small delay to ensure initial height is applied
  }
});

function removeFromMyList (groceryElement) {
  const groceryId = groceryElement.dataset.groceryId;

  const listener = (event) => {
    if(event.propertyName === 'padding-top') {
      toggleToBeBoughtInDB(groceryId, groceryElement, (groceryElement) => {
        myGroceriesList.removeChild(groceryElement);
        emptyListCheck();
      });
    }
  }
  groceryElement.addEventListener("transitionend", listener);
}

function emptyListCheck() {
  if(myGroceriesList.children.length === 0) {
    console.log("MYLISTISEMPTY");
  }
}

// EVENTS //

// ON DATABASEREADY
document.addEventListener("databaseReady", () => {
  const groceriesArray = loadGroceriesFromDB();
  renderMyGroceriesList(groceriesArray);
});

// DATABASE STORING AND RETRIEVING
localRemButt.addEventListener("click", () => {
  removeDatabase();
  console.log("Database removed from localStorage");
});
