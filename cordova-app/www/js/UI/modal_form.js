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

  // Storing function expressions objects in local variables
  const itemValidation = validateItemNameInput();
  const categoryValidation = validateCategoryInput();

  // Destructuring validation objects
  const {
    valid: isItemNameValid,
    name: itemName } = itemValidation;
  const {
    valid: isCategoryValid,
    name: categoryName,
    type: categoryType,
    id: categoryId } = categoryValidation;

  // reinitialize validation icons
  hideValidationIcon(formItemName);
  hideValidationIcon(categorySelector);

  // handle invalid entries
  if (!isItemNameValid || !isCategoryValid) {
    shakeIt();
    showValidationIcon(formItemName, isItemNameValid);
    showValidationIcon(categorySelector, isCategoryValid);
    setValidationFeedback(validationText(itemValidation, categoryValidation));
    return;
  }

  processFormSubmission(itemName, categoryId, categoryName, categoryType);
});


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

    if (!customCatName) {

      return { valid: true, type: 'empty', value: "" };

    } else if (isCategoryInSelector) {                                          // maybe try to return valid and
                                                                                // fetch id from existing option
      return { valid: false, comment: "Category already in selector!"};

    } else {

      return { valid: true, type: 'custom', name: customCatName };

    }

  } else if (selectedOption.value === "") {

    return { valid: true, type: 'empty', value: "" };

  } else {

    return { valid: true,
      type: 'regular',
      name: selectedOption.value,
      id: selectedOption.dataset.categoryId };
  }
}

//Process Form Submission helper
const processFormSubmission = (itemName, categoryId, categoryName, categoryType) => {
  if (categoryType === 'custom') {
    handleCustomCategory(categoryName, (newCategoryId) => {
      handleGroceryAddition(itemName, newCategoryId, categoryName, (groceryObject) => {
        const newCategory = createCategoryElement(categoryName, [groceryObject]); // also add the new grocery element
        allGroceriesList.appendChild(newCategory);
        console.log("%cSubmission completed!", 'color: green;');
        window.location.hash = ''; //close the modal
      });
    });
  } else {
    console.log("processFormSubmission: ", itemName, categoryId, categoryName);
    handleGroceryAddition(itemName, categoryId, categoryName, (groceryObject) => {
      if (groceryObject.category) {
        const newGrocery = createGroceryElement(groceryObject);
        const categoryQuery = `[data-category-name="${groceryObject.category}"]`;
        const existingCategory = allGroceriesList.querySelector(categoryQuery);
        const existingCategoryList = existingCategory.querySelector("ul");
        existingCategoryList.appendChild(newGrocery);
      }
      console.log("%cSubmission completed!", 'color: green;');
      window.location.hash = ''; //close the modal
    });
  }
}

const handleCustomCategory = (customCategoryName, callback) => {
  const categoryUUID = crypto.randomUUID();
  console.log("handleCategoryAddition: ", customCategoryName, categoryUUID);
  addCategory(customCategoryName, categoryUUID, function(error, success) {
    if(error) {
      if (error.message.includes("UNIQUE constraint failed")) {                 // check if cat already in DB
        userLog(`${customCategoryName} already in database !`, 'warning');
      } else {
        userLog("Error adding category!", 'error');
      }
      return;
    } else if (success) {
      userLog(`Category '${customCategoryName}' added with ID '${categoryUUID}'`, 'success');
      addCategoryToSelector(customCategoryName, categoryUUID);
      callback(categoryUUID);
    }
  });
}

const handleGroceryAddition = (itemName, categoryId, categoryName, callback) => {
  const groceryUUID = crypto.randomUUID();
  console.log("handleGroceryAddition: ", itemName, categoryId, groceryUUID);
  addGrocery(itemName, categoryId, groceryUUID, function(error, success) {
    if(error) {
      if (error.message.includes("UNIQUE constraint failed")) {                 // check if item in cat already in db
        userLog(`${itemName} already in database with category ${categoryName}.`, 'warning');
      } else {
        userLog("Error adding grocery!", 'error');
      }
      return;
    } else if (success) {
      const groceryObject = {
        id: groceryUUID,
        name: itemName,
        category: categoryName || "no category",
        isdirty: 1
      };
      callback(groceryObject);
      userLog(`'${groceryObject.name}' added to '${groceryObject.category}'`, 'success');
    }
  });
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

function setValidationFeedback ( message ) {
  validationFeedback.textContent = message;
}

//Resets form fields and icons on modal display change
window.addEventListener("hashchange", () => {
  hideValidationIcon(categorySelector);
  hideValidationIcon(formItemName);
  addNewItemForm.reset();
  categorySelector.selectedIndex = 0;
  setValidationFeedback("");
});

//Shows or hides custom category input field
categorySelector.addEventListener("change", () => {
  const selectedOption = categorySelector.value;

  if (selectedOption === "custom") {
    customCategoryInput.style.display = "inline";
    hideValidationIcon(categorySelector);
  } else {
    customCategoryInput.style.display = "none";
  }
});
