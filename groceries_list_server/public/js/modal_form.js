console.log("'modal_form.js' loaded");

// DOM ELEMENTS

const modalContent = document.getElementById("modal-content-1");
const addNewItemForm = document.getElementById("add-item-form");
const formItemName = document.getElementById("new-item-name");
const categorySelector = document.getElementById("category-selector");
const customCategoryInput = document.getElementById("custom-category-input");
const formSubmitButton = document.getElementById("val-btn");
const validationFeedback = document.getElementById("validation-feedback");

// MODAL FORM FUNCTIONS
addNewItemForm.addEventListener("submit", (event) => {

  event.preventDefault();

  const {
    valid: isItemNameValid,
    name: itemName } = validateItemNameInput();

  const {
    valid: isCategoryValid,
    name: categoryName,
    type: categoryType,
    id: categoryId } = validateCategoryInput();

  // reinitialize validation icons
  hideValidationIcon(formItemName);
  hideValidationIcon(categorySelector);

  // handle invalid entries
  if (!isItemNameValid || !isCategoryValid) {
    shakeIt();
    showValidationIcon(formItemName, isItemNameValid);
    showValidationIcon(categorySelector, isCategoryValid);
    validationFeedback.textContent = validationText(validateItemNameInput(), validateCategoryInput());
    return;
  }

  processFormSubmission(itemName, categoryId, categoryName, categoryType);

  window.location.hash = ''; //close the modal
});

// LOGIC HELPERS & HANDLERS

//Process Form Submission helper
const processFormSubmission = (itemName, categoryId, categoryName, categoryType) => {
  if (categoryType === 'custom') {
    handleCustomCategory(categoryName)
    .then(newCategoryId => {
      console.log("Process form submission Category Id: ", newCategoryId);
      return handleGroceryAddition(itemName.toLowerCase(), newCategoryId);
    })
    .then(groceryObject => {
      console.log("Grocery obj in #custom modal form: ", groceryObject);
      addGroceryToGroceriesList(groceryObject);
    })
    .catch(error => {
      console.error("Error adding grocery:", error);
    })
  } else {
    handleGroceryAddition(itemName.toLowerCase(), categoryId)
    .then(groceryObject => {
      console.log("Grocery obj in modal form: ", groceryObject);
      addGroceryToGroceriesList(groceryObject);
    })
    .catch(error => {
      console.error("<FORMPROCESS> Error adding grocery:", error);
    })
  }
}

//Resets form fields and icons on modal display change
window.addEventListener("hashchange", () => {
  hideValidationIcon(categorySelector);
  hideValidationIcon(formItemName);
  addNewItemForm.reset();
  validationFeedback.textContent = "";
});

//Shows or hides custom category input field
categorySelector.addEventListener("change", () => {       // ✓
  selectedOption = categorySelector.value;

  if (selectedOption === "custom") {
    customCategoryInput.style.display = "inline";
    hideValidationIcon(categorySelector);
  } else {
    customCategoryInput.style.display = "none";
  }
});
