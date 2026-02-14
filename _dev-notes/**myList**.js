const groceriesList = document.getElementById("groceries_list");

document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/myList")
  .then(response => response.json())
  .then(data => {
    if (data.length === 0) {
      console.log("List is empty!");
    } else {
      data.forEach(element => {
        const grocerie = document.createElement("li");
        grocerie.textContent = `${element.item_name}`;

        if (element.to_be_bought) {           // To make the element the right color from the start
          grocerie.classList.add("clicked");
        }

        grocerie.addEventListener("click", (event) => {
          toggleProduct(element, event.target);
        });

        groceriesList.appendChild(grocerie);
      });
    }
  })
  .catch(error => console.error("Error fetching groceries:", error));
});

function toggleProduct(element, grocerie) {
  const newToBeBoughtState = !element.to_be_bought;
  fetch(`http://localhost:3000/groceries/${element.id}`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ toBeBought: newToBeBoughtState })
  })
  .then(() => {
    grocerie.style.transition = "opacity 0.5s ease";
    grocerie.style.opacity = 0;
    setTimeout(() => {
      grocerie.remove();
      if (groceriesList.childElementCount === 0) {
        console.log("List is empty !");
      }
    }, 500);
  })
  .catch(error => console.error("Error updating grocerie:", error));
}
