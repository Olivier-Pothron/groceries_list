console.log("'events.js' loaded.");

window.addEventListener('load', () => {

});

window.addEventListener('beforeunload', () => {
  saveDatabase(db);
});

// TABLES REINITIALIZATION
resetButton.addEventListener("click", () => {
  initializeTables();
  console.log("Database tables reinitialized.");
});

// TABLES SEEDING
seedButton.addEventListener("click", () => {
  seedAllTables();
  console.log("Database tables seeded.");
});

// SYNCING DB
syncupButt.addEventListener("click", () => {
  sync();   //this is for testing purpose
});

// REFRESH LIST BUTTON
updateButton.addEventListener("click", () => {
  console.log("Refreshing...");

  loadGroceriesFromDB( (error, groceries) => {
    if(error) {
      console.error("Error fetching groceries.");
      return;
    }

    renderGroceriesList(groceries);
  });

  loadCategoriesFromDB( (error, categories) => {
    if(error) {
      console.error("Error fetching categories.");
      return;
    }

    renderCategorySelectorOptions(categories);
  });
});

// TESTING BUTTON
testButton.addEventListener("click", () => {
  db.transaction(function(tx) {
    tx.executeSql("SELECT name FROM sqlite_master WHERE type ='table'", [],
      function(tx, result) {
        if (result.rows.length != 0) {
          console.log("Tables present!");
          for( let i = 0 ; i < result.rows.length ; i++) {
            console.log(`${i} - ${result.rows.item(i).name}`);
          }
        } else {
          console.log("No tables detected!");
        }
      });
  });
});
