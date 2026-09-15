-- ============================================================
-- SENAIR — Script de creación de base de datos MySQL
-- Ejecutar en MySQL (phpMyAdmin, CLI, HeidiSQL, etc.)
-- ============================================================

CREATE DATABASE IF NOT EXISTS senair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE senair;

-- ── Tabla de usuarios ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Tabla de vuelos ──────────────────────────────────────────
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
    UNIQUE KEY uq_flight_route (origin, destination, departure_date, departure_time),
    INDEX idx_flights_search (origin, destination, departure_date)
) ENGINE=InnoDB;

-- ── Tabla de reservaciones ───────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    flight_id INT UNSIGNED NULL,
    origin VARCHAR(120) NOT NULL,
    destination VARCHAR(120) NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    seat VARCHAR(50) NOT NULL,
    price INT UNSIGNED NOT NULL,
    airline VARCHAR(80) NOT NULL DEFAULT 'SENAIR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE SET NULL,
    INDEX idx_reservations_user (user_id)
) ENGINE=InnoDB;

-- ── Vuelos de demostración ───────────────────────────────────
INSERT IGNORE INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES
('Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '06:30:00', '07:25:00', 159000, 'SENAIR', 0),
('Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '14:00:00', '14:55:00', 179000, 'SENAIR', 0),
('Bogotá (BOG)', 'Cartagena (CTG)', '2026-09-12', '09:10:00', '10:35:00', 189000, 'SENAIR', 0),
('Medellín (MDE)', 'Bogotá (BOG)', '2026-09-12', '18:20:00', '19:15:00', 169000, 'SENAIR', 0),
('Cali (CLO)', 'Cartagena (CTG)', '2026-09-11', '11:30:00', '14:05:00', 249000, 'SENAIR', 1),
('Cali (CLO)', 'Cartagena (CTG)', '2026-09-12', '11:30:00', '14:05:00', 249000, 'SENAIR', 1);
