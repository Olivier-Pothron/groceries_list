-- Drop existing tables
DROP TABLE IF EXISTS groceries_list;
DROP TABLE IF EXISTS groceries_categories;

-- Create tables again
CREATE TABLE groceries_categories (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE groceries_list (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	to_be_bought INT DEFAULT 0,
	category_id INT,
	FOREIGN KEY (category_id) REFERENCES groceries_categories(id),
	UNIQUE (name, category_id)
);

-- Step 1: Insert "No category" row if it doesn't already exist
INSERT IGNORE INTO groceries_categories (id, name)
VALUES (-1, 'no category');

-- /\ ALTERNATIVE WAY /\ :
-- INSERT INTO groceries_categories (id, name)
-- SELECT -1, 'no category'
-- WHERE NOT EXISTS (SELECT 1 FROM groceries_categories WHERE id = -1);

-- Step 2: Create the trigger to handle NULL category_id
DELIMITER $$

CREATE TRIGGER before_insert_groceries_list
BEFORE INSERT ON groceries_list
FOR EACH ROW
BEGIN
  IF NEW.category_id IS NULL THEN
    SET NEW.category_id = -1;
  END IF;
END$$

DELIMITER ;
