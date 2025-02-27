console.log("'events.js' loaded.");

// DATABASE INITIALIZED CHECK
document.addEventListener("databaseReady", () => {                              // checks for initialization of database
  console.log("%cDatabaseReady Event fired", 'color: green;');
});

testButt.addEventListener("click", () => {
  const groceryArray = ["nono", "bobo", "coco", "lolo", "momo", "popo", "roro", "toto", "koko", "soso"];
  const randomItem = groceryArray[Math.floor(Math.random() * 10) + 1];
  const randomCat = Math.floor(Math.random() * 10) + 1;
  console.log(`Grocery: ${randomItem} / Cat_id: ${randomCat}`);
  addGrocery (randomItem, randomCat);
});
