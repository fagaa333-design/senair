CREATE DATABASE IF NOT EXISTS senair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE senair;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

    CREATE TABLE IF NOT EXISTS flights (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        origin VARCHAR(120) NOT NULL,
        destination VARCHAR(120) NOT NULL,
        departure_date DATE NOT NULL,
        departure_time TIME NOT NULL,
        arrival_time TIME NOT NULL,
        price INT UNSIGNED NOT NULL,
        airline VARCHAR(80) NOT NULL DEFAULT 'SENAIR',
        stops TINYINT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (origin, destination, departure_date, departure_time)
    );
