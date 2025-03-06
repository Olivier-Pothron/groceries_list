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
}

// ADD GROCERY TO CATEGORY LIST
function addGroceryToCategoryList(groceryObject) {
  const newGrocery = createGroceryElement(groceryObject);
  const categoryQuery = `[data-name="${groceryObject.category}"]`;
  const existingCategory = categoriesList.querySelector(categoryQuery);
  const existingCategoryList = existingCategory.querySelector("ul");
  existingCategoryList.appendChild(newGrocery);
}

// LOGIC HELPERS & HANDLERS

//Process Form Submission helper
const processFormSubmission = (itemName, categoryId, categoryName, categoryType) => {
  if (categoryType === 'custom') {
    handleCustomCategory(categoryName)
    .then(newCategoryId => handleGroceryAddition(itemName, newCategoryId))
    .then(groceryObject => {
      addGroceryToCategoryList(groceryObject);
    })
    .catch(error => {
      console.error("Error adding grocery:", error);
    })
  } else {
    handleGroceryAddition(itemName, categoryId)
    .then(groceryObject => {
      addGroceryToCategoryList(groceryObject);
    })
    .catch(error => {
      console.error("<FORMPROCESS> Error adding grocery:", error);
    })
  }
}

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
    console.error("Error adding custom category:", error);
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
