// Item Object
const item = {
  name: 'Apple',
  quantity: 5,

  describe: function() {
    console.log(`Item: ${this.name}, Quantity: ${this.quantity}`);
  }
};

// Organizer Object
const Organizer = {
  addItem: function(item) {
    console.log('Adding item...');
    item.describe();  // Call the 'describe' method on the 'item' object
  }
};

// Add the item to the organizer
Organizer.addItem(item);

////////////////////////////////////////////////////////////////////////////////

// Final function that will be called inside executeTask
function finalCallback(result) {
  console.log("Final callback executed with result:", result);
}

// Transaction object with executeTask method
class Transaction {
  executeTask(task, callback) { //similar to "executeSql"
    console.log("Executing task...");
    const result = task(); // Simulate a task execution
    callback(result); // Call the callback with the result of the task
  }
}

// Library object with transaction method
class Library { //analogous to the "db" object
  transaction(taskFunction) { //similar to "db.transaction"
    console.log("Starting transaction...");
    const tx = new Transaction(); // Create a Transaction object
    taskFunction(tx); // Call the taskFunction with the Transaction object
  }
}

// Task function to be passed to the transaction method
function taskFunction(tx) {
  console.log("Task function executed...");
  tx.executeTask(() => "Task completed", finalCallback);
}

// Create a Library object
const library = new Library();

// Start a transaction
library.transaction(taskFunction);

/////////////////////////////////////////////////////////

// Task Function: Adds an item to a list
function addItemToList() {
  return 'Apple added to the list';
}

// Task Function: Removes an item from the list
function removeItemFromList() {
  return 'Apple removed from the list';
}

// Final Callback: Logs the result of adding an item
function logResult(result) {
  console.log(result);
}

// Transaction Object (tx)
const tx = {
  addTask: function(task, callback) {
      const result = task();
      callback(result);
  }
  removeTask: function(task, callback) {
    const result = task();
    callback(result);
  }
};

// Library Object
const library = {
  transaction: function(cBTaskFunction) {
    cBTaskFunction(tx);
  }
  anotherTransaction: function(cBTaskFunction) {
    cBTaskFunction(tx);
  }
};

// Task Function passed to the transaction
function taskFunction(transactionObject) {
  transactionObject.addTask(addItemToList, logResult);
}

// Another Task Function passed to anotherTransaction
function anotherTaskFunction(transactionObject) {
  transactionObject.removeTask(removeItemFromList, logResult);
}

// Start the transaction
library.transaction(taskFunction);

// Start another transaction
library.anotherTransaction(anotherTaskFunction);
