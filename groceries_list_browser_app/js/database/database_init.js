console.log("'database-init.js' loaded");

let db = null; // Global variable for the database instance

// Initialize the database
async function initDatabase() {
  try {
    const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` });

    // Check localStorage for an existing database
    const base64StringDatabase = localStorage.getItem('groceriesList');
    if(!base64StringDatabase) {
      console.log("No DB in localStorage.");
      db = new SQL.Database(); // Creates an in-memory database
      createTables();
      seedCategories();
      seedGroceries();
      seedSyncMeta();
    } else {
      const localDb = loadDatabase(base64StringDatabase);
      console.log("Loading existing DB from localStorage.")
      db = new SQL.Database(localDb);
    }

    console.log("Database initialized.");

    // Fire the databaseReady event
    const event = new Event("databaseReady");
    document.dispatchEvent(event);
  } catch(error) {
    console.log("Error initializing database!", error);
  }
}

// Creating Tables
function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_dirty INTEGER DEFAULT 0,
    UNIQUE(name));
    `);
  console.log("'category' table created");

  db.run(`CREATE TABLE IF NOT EXISTS grocery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    to_be_bought INTEGER DEFAULT 0,
    is_dirty INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES category(id),
    UNIQUE(name, category_id) );
    `);
  db.run(`CREATE TRIGGER IF NOT EXISTS grocery_auto_uuid
    AFTER INSERT
    ON grocery
    BEGIN
      UPDATE grocery
      SET is_dirty = 2
      WHERE rowid = NEW.rowid;
    END;
    `);
  console.log("'grocery' table created");

  // Simple key-value store for sync timestamps
  db.run(`CREATE TABLE IF NOT EXISTS sync_meta (
    key TEXT PRIMARY KEY,
    value TEXT );
    `);
  console.log("'sync_meta' table created");
}

function seedCategories() {

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

  const stmt = db.prepare("INSERT INTO category (name) VALUES (?);");

  for (let category of categories) {
    stmt.run([category.name]);
  }

  stmt.free();
  console.log("Categories seeded.");
}

function seedGroceries() {

  const groceries = [
    { name: 'pommes', category: 1, to_be_bought: 0 },
    { name: 'shampooing', category: 2, to_be_bought: 1 },
    { name: 'frites', category: 3, to_be_bought: 1 },
    { name: 'haricots verts', category: 3, to_be_bought: 1 },
    { name: 'champignons', category: 3, to_be_bought: 1 },
    { name: 'magnums', category: 3, to_be_bought: 1 },
    { name: 'pommes de terre salardaises', category: 3, to_be_bought: 1 },
    { name: 'moutarde', category: 4, to_be_bought: 1 },
    { name: 'mayonnaise', category: 4, to_be_bought: 1 },
    { name: 'sauce algérienne', category: 4, to_be_bought: 1 },
    { name: 'sauce tartare', category: 4, to_be_bought: 1 },
    { name: 'sauce au poivre', category: 4, to_be_bought: 1 },
    { name: 'lait', category: 6, to_be_bought: 1 },
    { name: "jus d'orange", category: 7, to_be_bought: 1 },
    { name: 'gâteaux', category: 5, to_be_bought: 1 },
    { name: "pavés de saumon", category: 8, to_be_bought: 1 },
    { name: "piles", category: 9, to_be_bought: 1 },
    { name: "drap", category: 10, to_be_bought: 1 },
    { name: "litière", category: 11, to_be_bought: 1 },
    { name: "pâté de sureau", category: null, to_be_bought: 0 }
  ];

  const stmt = db.prepare("INSERT INTO grocery (name, category_id, to_be_bought) VALUES (?, ?, ?);");

  for (let grocery of groceries) {
    stmt.run([grocery.name, grocery.category, grocery.to_be_bought]);
  }

  stmt.free();
  console.log("Groceries seeded.")
}

function seedSyncMeta() {
  db.run(`INSERT OR IGNORE INTO sync_meta (key, value)
    VALUES ('last_sync', '1970-01-01T00:00:00Z')
    `);
  console.log("Sync initialized.")
}

initDatabase();
