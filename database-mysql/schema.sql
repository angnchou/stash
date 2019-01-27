DROP DATABASE IF EXISTS stash;

CREATE DATABASE stash;

USE stash;

CREATE TABLE bookmarks (
  id int NOT NULL AUTO_INCREMENT,
  title varchar(50) NOT NULL,
  tags varchar(50),
  category varchar(50),
  url varchar(255) NOT NULL,
  notes varchar(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE categories (
  id int NOT NULL AUTO_INCREMENT, 
  category varchar(50),
  category_id int NOT NULL,
  PRIMARY KEY (id)
);


/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/
