console.log("'events.js' loaded.");

// DATABASE INITIALIZED CHECK
document.addEventListener("databaseReady", () => {                              // checks for initialization of database
  console.log("%cDatabaseReady Event fired", 'color: green;');
});

window.addEventListener('load', () => {
  
});

window.addEventListener('beforeunload', () => {
  saveDatabase(db);
});
