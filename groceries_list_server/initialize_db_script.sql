-- Drop existing tables
DROP TABLE IF EXISTS groceries;
DROP TABLE IF EXISTS categories;

-- Create tables again
CREATE TABLE categories (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE groceries (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	to_be_bought INT DEFAULT 0,
	category_id INT,
	FOREIGN KEY (category_id) REFERENCES categories(id),
	UNIQUE (name, category_id)
);

-- Step 1: Insert "No category" row if it doesn't already exist
INSERT IGNORE INTO categories (id, name)
VALUES (-1, 'no category');

-- /\ ALTERNATIVE WAY /\ :
-- INSERT INTO groceries (id, name)
-- SELECT -1, 'no category'
-- WHERE NOT EXISTS (SELECT 1 FROM groceries WHERE id = -1);

-- Step 2: Create the trigger to handle NULL category_id
DELIMITER $$

CREATE TRIGGER before_insert_groceries
BEFORE INSERT ON groceries
FOR EACH ROW
BEGIN
  IF NEW.category_id IS NULL THEN
    SET NEW.category_id = -1;
  END IF;
END$$

DELIMITER ;
