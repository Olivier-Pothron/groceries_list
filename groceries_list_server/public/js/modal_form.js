console.log("'modal_form.js' loaded")

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
  newSelectorOption.setAttribute('data-category-id', newCategoryId);
  newSelectorOption.textContent = newCategory;
  newSelectorOption.value = newCategory;

  categorySelector.add(newSelectorOption, categorySelector.options.length - 1);
}

// ADD CATEGORY TO MASTER LIST
function addCategoryToList(categoryName) {
  const newCategory = createCategoryElement(categoryName);
  allGroceriesList.appendChild(newCategory);
}

// ADD GROCERY TO CATEGORY LIST
function addGroceryToCategoryList(groceryObject) {
  const newGrocery = createGroceryElement(groceryObject);
  const categoryQuery = `[data-name="${groceryObject.category}"]`;
  const existingCategory = allGroceriesList.querySelector(categoryQuery);
  const existingCategoryList = existingCategory.querySelector("ul");
  existingCategoryList.appendChild(newGrocery);
}

// LOGIC HELPERS & HANDLERS

//Checks for validation of item name
const validateItemNameInput = () => {
  // MAYBE PUT MORE LOGIC INSIDE IT
  const itemName = formItemName.value;
  if (itemName) {
    return { valid: true, name: itemName };
  } else {
    return { valid: false, comment: "Item Name required!" };
  }
}

//Checks for validation of category input
const validateCategoryInput = () => {

  const selectedOption = categorySelector.options[categorySelector.selectedIndex];

  if (selectedOption.value === "custom") {
    const customCatName = customCategoryInput.value;

    // searches for 'custom' category in selector options
    const selectorOptionsArray = Array.from(categorySelector.options);
    const isCategoryInSelector = selectorOptionsArray.some((element) =>
      element.value === customCatName
    );

    if (!customCatName) { // maybe trim to prevent empty spaces
      return { valid: true, type: 'empty', value: "" };
    } else if (isCategoryInSelector) {                                          // maybe try to return valid and
      return { valid: false, comment: "Category already in selector!"};
    } else {
      return { valid: true, type: 'custom', name: customCatName };
    }
  } else if (selectedOption.value === "") {
    return { valid: true, type: 'empty', value: "" };
  } else {
    return {
      valid: true,
      type: 'regular',
      name: selectedOption.value,
      id: selectedOption.dataset.id
    };
  }
}

//Process Form Submission helper
const processFormSubmission = (itemName, categoryId, categoryName, categoryType) => {
  // console.log(itemName, categoryId, categoryName, categoryType);
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
      console.error("Error adding grocery:", error);
    })
  }
}

const handleCustomCategory = (customCategoryName) => {
  return addCategory(customCategoryName)
  .then(categoryObject => {
    if(categoryObject) {
      const newCategory = categoryObject.name;
      const newCategoryId = categoryObject.id;
      console.log(`Custom category added with ID ${newCategoryId}!`);
      addCategoryToList(newCategory);
      addCategoryToSelector(newCategory, newCategoryId);
      userLog(`Category '${newCategory}' added`, 'success');
      return newCategoryId;
    }
  })
  .catch(error => {
    console.error("Error adding custom category:", error);
    throw error;
  })
}

const handleGroceryAddition = (itemName, categoryId) => {
  return addGrocery(itemName, categoryId)
  .then(groceryObject => {
    userLog(`'${groceryObject.name}' added to '${groceryObject.category}'`, 'success');
    return groceryObject;
  })
  .catch(error => {
    console.error("Error adding custom category:", error);
  })
}

// UI HELPERS FUNCTIONS
function shakeIt() {
  modalContent.classList.add("shake");
      modalContent.addEventListener("animationend", () => {
        modalContent.classList.remove("shake");
      }, { once: true });
}

const showValidationIcon = (field, isValid) => {
  const parentDiv = field.parentElement;
  const validationIcon = parentDiv.querySelector(".validation");
  validationIcon.style.display = "inline";
  validationIcon.classList.add(isValid ? "right" : "wrong");
  validationIcon.textContent = isValid ? "\u2713" : "\u2A2F";
}

const hideValidationIcon = (field) => {
  const parentDiv = field.parentElement;
  const validationIcon = parentDiv.querySelector(".validation");
  validationIcon.classList.remove("wrong");
  validationIcon.classList.remove("right");
  validationIcon.style.display = "none";
}

const validationText = (itemValidation, categoryValidation) => {
  const messages = [];
  if (!itemValidation.valid) messages.push(itemValidation.comment);
  if (!categoryValidation.valid) messages.push(categoryValidation.comment);
  return messages.join(" ");
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
