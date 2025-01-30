-- reinitialize .sql

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
	CONSTRAINT unique_name_category UNIQUE (name, category_id)
);
