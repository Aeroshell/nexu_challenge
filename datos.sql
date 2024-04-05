CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    average_price DECIMAL(18, 2) NOT NULL
);

CREATE TABLE models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT,
    name VARCHAR(255) NOT NULL,
    average_price DECIMAL(18, 2) NOT NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

INSERT INTO brands (id, nombre, average_price) VALUES
(1, 'Acura', 702109),
(2, 'Audi', 630759),
(3, 'Bentley', 3342575),
(4, 'BMW', 858702),
(5, 'Buick', 290371);

INSERT INTO models (id, brand_id, name, average_price) VALUES
(1, 1, 'ILX', 303176),
(2, 1, 'MDX', 448193),
(1264, 2, 'NSX', 3818225),
(3, 5, 'RDX', 395753),
(354, 5, 'RL', 239050);