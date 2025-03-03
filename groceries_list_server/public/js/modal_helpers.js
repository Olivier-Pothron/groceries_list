console.log("'modal_helpers.js' loaded");

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
