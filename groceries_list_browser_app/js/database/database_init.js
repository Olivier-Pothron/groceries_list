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
    -- id INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_dirty INTEGER DEFAULT 0,
    UNIQUE(name));
    `);
  db.run(`CREATE TRIGGER IF NOT EXISTS category_auto_uuid
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

  db.run(`CREATE TABLE IF NOT EXISTS grocery (
    -- id INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT PRIMARY KEY,
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
  db.exec(`CREATE VIEW grocery_view
    AS SELECT * FROM grocery;`);
  db.exec(`CREATE TRIGGER grocery_no_cat_id
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
    `)

  const stmt = db.prepare("INSERT INTO grocery_view (name, category_id, to_be_bought) VALUES (?, ?, ?);");

  for (let grocery of groceries) {
    stmt.run([grocery.name, grocery.category, grocery.to_be_bought]);
  }

  stmt.free();

  // DROPPING THE VIEW
  db.exec('DROP VIEW grocery_view');

  console.log("Groceries seeded.")
}

function seedSyncMeta() {
  db.run(`INSERT OR IGNORE INTO sync_meta (key, value)
    VALUES ('last_sync', '1970-01-01T00:00:00Z')
    `);
  console.log("Sync initialized.")
}

initDatabase();
