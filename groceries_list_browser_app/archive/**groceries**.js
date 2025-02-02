const groceriesList = document.getElementById("groceries_list");
const addItemForm = document.getElementById("add_item_form");
const newItemName = document.getElementById("new_item_name");
const categorySelector = document.getElementById("category_selector");


document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/categories")     // Fill the list of category options
  .then(response => response.json())
  .then(data => {
    data.forEach(element => {
      const category = document.createElement("option");
      category.value = element.id;
      category.textContent = element.name;
      categorySelector.appendChild(category);
    });
  })
  .catch(error => console.error("Error fetching categories:", error));

  fetch("http://localhost:3000/groceries")
  .then(response => response.json())
  .then(data => {
    console.log(data);
    data.forEach(element => {
      const grocerie = createGroceryItem(element);
      groceriesList.appendChild(grocerie);
    });
  })
  .catch(error => console.error("Error fetching groceries:", error));
});

addItemForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const itemName = newItemName.value.trim();
  const categoryId = categorySelector.value;
  console.log(categoryId);
  addProduct(itemName, categoryId);
  newItemName.value = ""; // Clear the input field after submission
  categorySelector.value = "";
});


// FUNCTIONS

function addProduct(item, category) {
  fetch('http://localhost:3000/groceries', {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ itemName: item, categoryId: category})
  })
  .then(response => response.json())
  .then((newItem) => {
    console.log(newItem);
    const grocerie = createGroceryItem(newItem);
    groceriesList.appendChild(grocerie);
  })
  .catch(error => console.error("Error adding new grocerie:", error));
}

function toggleProduct(element, grocerie) {
  const newToBeBoughtState = !element.to_be_bought;
  fetch(`http://localhost:3000/groceries/${element.id}`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ toBeBought: newToBeBoughtState })
  })
  .then(() => {                                   // Update client side
    element.to_be_bought = newToBeBoughtState;
    grocerie.classList.toggle("clicked", newToBeBoughtState);
    console.log(`${element.item_name} to_be_bought state updated to ${newToBeBoughtState}`);
  })
  .catch(error => console.error("Error updating grocerie:", error));
}

function deleteProduct(id, grocerie) {
  fetch(`http://localhost:3000/groceries/${id}`, {
    method: "DELETE",
  })
  .then(() => {
    groceriesList.removeChild(grocerie);        // Update client side
    console.log(`Grocery with id ${id} removed from list.`);
  })
  .catch(error => console.error("Error deleting grocerie:", error));
}

function createGroceryItem(element) {
  const grocerie = document.createElement("li");
      grocerie.textContent = `${element.item_name}`;

      if (element.to_be_bought) {           // To make the element the right color from the start
        grocerie.classList.add("clicked");
      }

      grocerie.addEventListener("click", () => {
        toggleProduct(element, grocerie);
      });

      // Create category
      const itemCategory = document.createElement("span");
      itemCategory.textContent = element.category;
      grocerie.appendChild(itemCategory);

      // Create delete button
      const delButton = document.createElement("button");
      delButton.textContent = "Delete";
      delButton.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteProduct(element.id, grocerie);
      });

      grocerie.appendChild(delButton);

      return grocerie;
}
