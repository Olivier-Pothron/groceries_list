const categorySelector = document.getElementById("category-selector");
const customCategoryInput = document.getElementById("custom-input");
const itemInput = document.getElementById("item-input");
const modalOutput = document.getElementById("output-one");
const validateButton = document.getElementById("val-btn");
const validationFeedback = document.getElementById("validation-feedback");
const modalContent = document.getElementById("modal-content-1");
const newItemForm = document.getElementById("add-item-form");

//Resets form fields and icons on modal display change
window.addEventListener("hashchange", () => {
  hideValidationIcon(categorySelector);
  hideValidationIcon(itemInput);
  validationFeedback.textContent = "";
  newItemForm.reset();  
});

//Shows or hides custom category input field
categorySelector.addEventListener("change", () => {
  selectedOption = categorySelector.value;
  if (selectedOption === "Custom") {
    customCategoryInput.style.display = "inline";
    hideValidationIcon(categorySelector);
  } else {
    customCategoryInput.style.display = "none";
  }
});

validateButton.addEventListener("click", (event) => {
  //Using 'parentElement' to access validation icons
  itemParentDiv = itemInput.parentElement;
  categoryParentDiv = categorySelector.parentElement;

  itemText = itemInput.value.trim();
  option = categorySelector.value;
  categoryText = option != "Custom" ? option : customCategoryInput.value.trim();
  validationFeedback.textContent = "";

  const isItemValid = !!itemText;
  const isCategoryValid = !!categoryText;

  if(isItemValid && isCategoryValid) {
    modalOutput.textContent = `${itemText} ${categoryText}`;
    window.location.hash = "";
  } else {
    validationFeedback.textContent = validationText(isItemValid, isCategoryValid);
    shakeIt();
    showValidationIcon(itemInput, isItemValid);
    showValidationIcon(categorySelector, isCategoryValid);
  }
});

// HELPERS FUNCTIONS
function shakeIt() {
  modalContent.classList.add("shake");
      modalContent.addEventListener("animationend", () => {
        modalContent.classList.remove("shake");
      }, { once: true });
}

const showValidationIcon = (field, isValid) => {
  const parentDiv = field.parentElement;
  const wrongIcon = parentDiv.querySelector(".wrong");
  const rightIcon = parentDiv.querySelector(".right");
  wrongIcon.style.display = isValid ? "none" : "inline";
  rightIcon.style.display = isValid ? "inline" : "none";
}

const hideValidationIcon = (field) => {
  const parentDiv = field.parentElement;
  const wrongIcon = parentDiv.querySelector(".wrong");
  const rightIcon = parentDiv.querySelector(".right");
  wrongIcon.style.display = "none";
  rightIcon.style.display = "none";
}

const validationText = (isItemValid, isCategoryValid) => {
  let validationFeedbackText = "";
  validationFeedbackText += !isItemValid ? "No Item! " : "";
  validationFeedbackText += !isCategoryValid ? "No Category!" : "";
  validationFeedbackText = validationFeedbackText.trim();
  return validationFeedbackText;
}
