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
