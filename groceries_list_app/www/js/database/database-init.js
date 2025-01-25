var db = null;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

  db = window.sqlitePlugin.openDatabase({ name: 'groceries.db', location: 'default' });
  initializeDatabase();
}

// DATABASE INITIALIZATION
function initializeDatabase() {

  db.transaction(function(tx) {
    dropTables(tx);
    createTables(tx);
    seedTables(tx);
  }, function onTransactionError(error) {
    console.error('Initialization ERROR: ' + error.message);
  }, function onTransactionSuccess() {
    console.log('%cInitialization SUCCESS!', 'color: blue; font_weight: bold;');

    // Fire the databaseReady event
    const event = new Event("databaseReady");
    document.dispatchEvent(event);
  });
}

// DROPPING TABLES
function dropTables(tx) {

  tx.executeSql('DROP TABLE IF EXISTS groceries_categories');
  // console.log("'groceries_categories' table dropped");
  tx.executeSql('DROP TABLE IF EXISTS groceries_list');
  // console.log("'groceries_list' table dropped");
  console.log('%c### All tables dropped ###', 'color: blue;');
}

// CREATING TABLES
function createTables(tx) {

  tx.executeSql(`CREATE TABLE IF NOT EXISTS groceries_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    UNIQUE(name) )
    `);

  tx.executeSql(`CREATE TABLE IF NOT EXISTS groceries_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    to_be_bought INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES groceries_categories(id) )
    `);

  // creating a unique index to prevent duplicates
  tx.executeSql(`CREATE UNIQUE INDEX idx_grocery_name_category
    ON groceries_list (name, category_id)`);

  console.log('%c### All tables created ###', 'color: blue;');
  }


// SEEDING TABLES
function seedTables(tx) {

  let categories = [
    { name: 'fruits & légumes' },
    { name: 'droguerie parfumerie hygiène' },
    { name: 'surgelés' },
    { name: 'épicerie salée'},
    { name: 'épicerie sucrée'},
    { name: 'crèmerie'},
    { name: 'liquides'},
    { name: 'traiteur'}
  ];
  let items = [
    { name: 'pommes', category: 1 },
    { name: 'shampooing', category: 2 },
    { name: 'frites', category: 3 },
    { name: 'moutarde', category: 4},
    { name: 'lait', category: 6},
    { name: 'haricots verts', category: 3},
    { name: "jus d'orange", category: 7},
    { name: 'gâteaux', category: 5},
    { name: "pavés de saumon", category: 8}
  ];
  // Insert categories
  for (const category of categories) {
    let query = "INSERT INTO groceries_categories (name) VALUES (?)"
    tx.executeSql(query, [category.name],
      function onInsertSuccess(tx) {
      }, function onInsertError(tx, error) {
        console.error(`Insert ERROR! Code: ${error.message}`);
      });
  }
  // Insert items
  for (const item of items) {
    let query = "INSERT INTO groceries_list (name, category_id) VALUES (?, ?)"
    tx.executeSql(query, [item.name, item.category],
      function onInsertSuccess(tx) {
    }, function onInsertError(tx, error) {
      console.error(`Insert ERROR! Code: ${error.message}`);
    });
  }
}
