CREATE DATABASE products;

\connect products;

CREATE TABLE product (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  slogan VARCHAR(255),
  description VARCHAR(771),
  category VARCHAR(30),
  default_price INT
);

CREATE TABLE features (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES product (id),
  feature VARCHAR(50),
  value VARCHAR(50)
);

CREATE TABLE styles (
  id SERIAL PRIMARY KEY,
  productId INT REFERENCES product (id),
  name VARCHAR(255),
  sale_price VARCHAR(10),
  original_price VARCHAR(10),
  default_style VARCHAR(10)
);

CREATE TABLE skus (
  id SERIAL PRIMARY KEY,
  styleId INT REFERENCES styles (id),
  size VARCHAR(10),
  quantity VARCHAR(10)
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  styleId INT REFERENCES styles (id),
  url VARCHAR(4096),
  thumbnail_url VARCHAR(131072)
);

CREATE TABLE related (
  id SERIAL PRIMARY KEY,
  current_product_id INT,
  related_product_id INT
)
