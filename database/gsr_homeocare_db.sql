-- GSR Homeocare System — MySQL database setup
-- Run in MySQL Workbench or: mysql -u root -p < gsr_homeocare_db.sql

CREATE DATABASE IF NOT EXISTS gsr_homeocare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gsr_homeocare_db;

CREATE TABLE IF NOT EXISTS products (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    price       DOUBLE NOT NULL,
    description VARCHAR(1000),
    image       VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS consultations (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    phone   VARCHAR(50) NOT NULL,
    problem VARCHAR(2000) NOT NULL,
    mode    VARCHAR(50) NOT NULL,
    date    DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    status        VARCHAR(50) NOT NULL DEFAULT 'Ordered'
);

INSERT INTO products (name, price, description, image) VALUES
('Arnica Montana 30C', 249.00,
 'Homeopathic remedy for bruises, muscle soreness, and minor injuries.',
 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'),
('Physiotherapy Massage Oil', 399.00,
 'Natural herbal oil for pain relief and muscle relaxation.',
 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400'),
('Immunity Booster Drops', 199.00,
 'Daily homeopathic drops to support natural immunity.',
 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO orders (customer_name, status) VALUES
('Sample Customer', 'Ordered')
ON DUPLICATE KEY UPDATE customer_name = customer_name;
