use Products;
LOAD DATA INFILE './skus.csv'
INTO TABLE skus
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES;