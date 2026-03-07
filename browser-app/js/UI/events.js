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
