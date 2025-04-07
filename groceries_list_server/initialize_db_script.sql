-- Drop existing tables
DROP TABLE IF EXISTS grocery;
DROP TABLE IF EXISTS category;

-- Create tables again
CREATE TABLE category (
	id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
	name VARCHAR(255) UNIQUE NOT NULL,
  last_modified TIMESTAMP
);

CREATE TABLE grocery (
	id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
	name VARCHAR(255) NOT NULL,
	category_id CHAR(36),
	to_be_bought TINYINT(1) DEFAULT 0,
  last_modified TIMESTAMP,
	FOREIGN KEY (category_id) REFERENCES category(id),
	UNIQUE (name, category_id)
);

-- Step 1: Insert "No category" row if it doesn't already exist
INSERT IGNORE INTO category (id, name)
VALUES ("-1", 'no category');

-- /\ ALTERNATIVE WAY /\ :
-- INSERT INTO grocery (id, name)
-- SELECT -1, 'no category'
-- WHERE NOT EXISTS (SELECT 1 FROM grocery WHERE id = -1);

-- Step 2: Create the trigger to handle NULL category_id
DELIMITER $$

CREATE TRIGGER before_insert_grocery
BEFORE INSERT ON grocery
FOR EACH ROW
BEGIN
  IF NEW.category_id IS NULL THEN
    SET NEW.category_id = "-1";
  END IF;
END$$

DELIMITER ;
