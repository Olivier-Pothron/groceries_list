console.log("'events.js' loaded.");

window.addEventListener('load', () => {

});

window.addEventListener('beforeunload', () => {
  saveDatabase(db);
});

// DATABASE STORING AND RETRIEVING
localRemButt.addEventListener("click", () => {
  removeDatabase();
  console.log("Database removed from localStorage");
});

// SYNCING DB
syncCatUpButt.addEventListener("click", () => {
  syncCategoriesUp( (error, result) => {
    console.log("Callback successful");
    console.log(result);
  })
});

syncGroUpButt.addEventListener("click", () => {
  syncGroceriesUp( (error, result) => {
    console.log("Callback successful");
    console.log(result);
  })
});

testButt.addEventListener("click", () => {
  const testGrocery = {
    name: "dentifrice",
    uuid: 'fabacada-0000-4000-8000-abacadabacca',
    category_id: '5e46e401-0000-4000-8000-bacadac00001'
  };

  console.log("testGrocery: ", testGrocery);

  testingAddGroceryToServer( testGrocery, (error, result) => {
    if(error) {
      console.error("NUNUNUNUNUNU! ", error);
      return;
    }
    console.log("Callback successful");
    console.log(result);
    console.log("TESTING AFTER: ", db.exec(`SELECT * FROM grocery`));
  })
});
