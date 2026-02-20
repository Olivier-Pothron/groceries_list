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
    seedCategories(tx);
    seedGroceries(tx);
    seedSyncMeta(tx);
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

  tx.executeSql('DROP TABLE IF EXISTS category');
  console.log("'category' table dropped");
  tx.executeSql('DROP TABLE IF EXISTS grocery');
  console.log("'grocery' table dropped");
  console.log('%c### All tables dropped ###', 'color: blue;');
}

// CREATING TABLES
function createTables(tx) {

  tx.executeSql(`CREATE TABLE IF NOT EXISTS category (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_dirty INTEGER DEFAULT 0,
    UNIQUE(name) )
    `);

  tx.executeSql(`CREATE TRIGGER IF NOT EXISTS category_auto_uuid
    AFTER INSERT
    ON category
    WHEN NEW.id IS NULL
    BEGIN
      UPDATE category SET id = (
        lower(hex(randomblob(4))) || '-' ||
        lower(hex(randomblob(2))) || '-4' ||
        substr(lower(hex(randomblob(2))), 2) || '-' ||
        substr('89ab', abs(random()) % 4 + 1, 1) ||
        substr(lower(hex(randomblob(2))), 2) || '-' ||
        lower(hex(randomblob(6)))
      ) WHERE rowid = NEW.rowid;
    END;
    `);

  console.log("'category' table created");

  tx.executeSql(`CREATE TABLE IF NOT EXISTS grocery (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT,
    to_be_bought INTEGER DEFAULT 0,
    is_dirty INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES category(id) )
    `);

  tx.executeSql(`CREATE TRIGGER IF NOT EXISTS grocery_auto_uuid
    AFTER INSERT
    ON grocery
    WHEN NEW.id IS NULL
    BEGIN
      UPDATE grocery SET id = (
        lower(hex(randomblob(4))) || '-' ||
        lower(hex(randomblob(2))) || '-4' ||
        substr(lower(hex(randomblob(2))), 2) || '-' ||
        substr('89ab', abs(random()) % 4 + 1, 1) ||
        substr(lower(hex(randomblob(2))), 2) || '-' ||
        lower(hex(randomblob(6)))
      ) WHERE rowid = NEW.rowid;
    END;
    `)

  console.log("'grocery' table created");

  // creating a unique index to prevent duplicates
  tx.executeSql(`CREATE UNIQUE INDEX idx_grocery_name_category
    ON grocery (name, category_id)`);

  // Simple key-value store for sync timestamps
  tx.executeSql(`CREATE TABLE IF NOT EXISTS sync_meta (
    key TEXT PRIMARY KEY,
    value TEXT );
    `);

  console.log("'sync_meta' table created");

  console.log('%c### All tables created ###', 'color: blue;');

}

// SEEDING TABLES
function seedCategories(tx) {

  const categories = [
    { name: 'fruits & légumes' },
    { name: 'droguerie parfumerie hygiène' },
    { name: 'surgelés' },
    { name: 'épicerie salée' },
    { name: 'épicerie sucrée' },
    { name: 'crèmerie' },
    { name: 'liquides' },
    { name: 'traiteur' },
    { name: 'bazar' },
    { name: 'textile' },
    { name: 'pet' }
  ];

  for (let category of categories) {
    tx.executeSql("INSERT INTO category (name) VALUES (?);", [category.name],
      function onInsertSuccess(tx) {
        console.log(`${category.name} seeded into category table.`)
      }, function onInsertError(tx, error) {
        console.error(`Insert ERROR! Code: ${error.message}`);
      });
  }

  console.log("Categories seeded.");
}

function seedGroceries(tx) {

  const groceries = [
    { name: 'pommes', category: 'fruits & légumes', to_be_bought: 0 },
    { name: 'shampooing', category: 'droguerie parfumerie hygiène', to_be_bought: 1 },
    { name: 'frites', category: 'surgelés', to_be_bought: 1 },
    { name: 'haricots verts', category: 'surgelés', to_be_bought: 1 },
    { name: 'champignons', category: 'surgelés', to_be_bought: 1 },
    { name: 'magnums', category: 'surgelés', to_be_bought: 1 },
    { name: 'pommes de terre salardaises', category: 'surgelés', to_be_bought: 1 },
    { name: 'moutarde', category: 'épicerie salée', to_be_bought: 1 },
    { name: 'mayonnaise', category: 'épicerie salée', to_be_bought: 1 },
    { name: 'sauce algérienne', category: 'épicerie salée', to_be_bought: 1 },
    { name: 'sauce tartare', category: 'épicerie salée', to_be_bought: 1 },
    { name: 'sauce au poivre', category: 'épicerie salée', to_be_bought: 1 },
    { name: 'lait', category: 'crèmerie', to_be_bought: 1 },
    { name: "jus d'orange", category: 'liquides', to_be_bought: 1 },
    { name: 'gâteaux', category: 'épicerie sucrée', to_be_bought: 1 },
    { name: "pavés de saumon", category: 'traiteur', to_be_bought: 1 },
    { name: "piles", category: 'bazar', to_be_bought: 1 },
    { name: "drap", category: 'textile', to_be_bought: 1 },
    { name: "litière", category: 'pet', to_be_bought: 1 },
    { name: "pâté de sureau", category: null, to_be_bought: 0 }
  ];

  // CREATING A VIEW TO HANDLE THE ADDITION OF GROCERIES WITH TEXT IN CATEGORY ID
  // WITH AN 'INSTEAD OF' TRIGGER WITH WRITES ON THE GROCERY TABLE
  tx.executeSql(`CREATE VIEW grocery_view AS SELECT * FROM grocery;`);

  tx.executeSql(`CREATE TRIGGER grocery_no_cat_id
    INSTEAD OF INSERT ON grocery_view
    BEGIN
      INSERT INTO grocery (name, to_be_bought, category_id)
      VALUES (
        NEW.name,
        NEW.to_be_bought,
        CASE
          WHEN NEW.category_id IS NULL THEN NULL
          ELSE (SELECT id FROM category WHERE NEW.category_id = name)
        END
        );
    END;
    `);

  for (let grocery of groceries) {
    tx.executeSql("INSERT INTO grocery_view (name, category_id, to_be_bought) VALUES (?, ?, ?);",
      [grocery.name, grocery.category, grocery.to_be_bought],
    function onInsertSuccess(tx) {
      console.log(`${grocery.name} inserted into grocery table.`)
    }, function onInsertError(tx, error) {
      console.error(`Insert ERROR! Code: ${error.message}`);
    });
  }

  // DROPPING THE VIEW
  tx.executeSql('DROP VIEW grocery_view');

  console.log("Groceries seeded.")
}

function seedSyncMeta(tx) {
  tx.executeSql(`INSERT OR IGNORE INTO sync_meta (key, value)
    VALUES ('last_sync', '1970-01-01T00:00:00Z')
    `);
  console.log("Sync initialized.")
}
