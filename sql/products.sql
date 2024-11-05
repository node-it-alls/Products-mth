use Products;
DROP TABLE IF EXISTS `product_list`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `features`;
DROP TABLE IF EXISTS `styles`;
DROP TABLE IF EXISTS `skus`;
DROP TABLE IF EXISTS `photos`;
DROP TABLE IF EXISTS `related`;

CREATE TABLE `products` (
  `id` INTEGER  NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255)  NULL,
  `slogan` VARCHAR(255)  NULL,
  `description` VARCHAR(10000)  NULL,
  `category` VARCHAR(255) NULL,
  `default_price` DECIMAL  NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `features` (
  `id` INTEGER  NOT NULL AUTO_INCREMENT,
  `product_id` INTEGER NOT NULL,
  `feature` VARCHAR(255)  NULL,
  `value` VARCHAR(255)  NULL,
  PRIMARY KEY (`id`),
  INDEX (`product_id`)
);
CREATE TABLE `styles` (
   `id` INTEGER  NOT NULL AUTO_INCREMENT,
  `product_id` INTEGER NOT NULL,
  `name` VARCHAR(255)  NULL,
  `original_price` DECIMAL  NULL,
  `sale_price` DECIMAL NULL,
  `default?` BOOLEAN  NULL,
  PRIMARY KEY (`id`),
  INDEX(`product_id`)
);
CREATE TABLE `skus` (
   `id` INTEGER  NOT NULL AUTO_INCREMENT,
  `style_id` INTEGER NOT NULL,
  `size` VARCHAR(10)  NULL,
  `quantity` INTEGER  NULL,
  PRIMARY KEY (`id`),
  INDEX(`style_id`)
);
CREATE TABLE `photos` (
   `id` INTEGER  NOT NULL AUTO_INCREMENT,
  `style_id` INTEGER NOT NULL,
  `url`  VARCHAR(255)  NULL,
  `thumbnail_url`  VARCHAR(255)  NULL,
  PRIMARY KEY (`id`),
  INDEX(`style_id`)
);
CREATE TABLE `related` (
   `id` INTEGER  NOT NULL AUTO_INCREMENT,
  `product_id`  VARCHAR(255)  NULL,
  `related_id`  VARCHAR(255)  NULL,
  PRIMARY KEY (`id`),
  INDEX(`product_id`)
);



/* mysql -u root < products.sql*/