CREATE DATABASE IF NOT EXISTS senair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE senair;
-- =============================================================================
-- BASE DE DATOS: SENAIR
-- Proyecto: Sistema Web de Vuelos y Reservas SENAIR
-- Motor: MySQL 8.0+ / MariaDB 10.4+
-- Descripción: Estructura relacional completa e independiente con datos de prueba.
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS `senair`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

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
USE `senair`;

-- Desactivar temporalmente revisión de claves foráneas para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `flights`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 2. TABLAS (MODELO RELACIONAL)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLA: users
-- Guarda la información de las personas que crean una cuenta en la plataforma.
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único del usuario',
    `name` VARCHAR(120) NOT NULL COMMENT 'Nombre completo del pasajero o titular',
    `email` VARCHAR(191) NOT NULL UNIQUE COMMENT 'Correo electrónico único para inicio de sesión',
    `password` VARCHAR(255) NOT NULL COMMENT 'Hash seguro de la contraseña (bcrypt)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de registro en el sistema'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- TABLA: flights
-- Guarda el catálogo de vuelos programados, rutas, horarios, tarifas y escalas.
-- -----------------------------------------------------------------------------
CREATE TABLE `flights` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único del vuelo',
    `origin` VARCHAR(120) NOT NULL COMMENT 'Ciudad y código IATA de origen (ej: Bogotá (BOG))',
    `destination` VARCHAR(120) NOT NULL COMMENT 'Ciudad y código IATA de destino (ej: Medellín (MDE))',
    `departure_date` DATE NOT NULL COMMENT 'Fecha de salida del vuelo (AAAA-MM-DD)',
    `departure_time` TIME NOT NULL COMMENT 'Hora de salida programada (HH:MM:SS)',
    `arrival_time` TIME NOT NULL COMMENT 'Hora estimada de llegada (HH:MM:SS)',
    `price` INT UNSIGNED NOT NULL COMMENT 'Precio base por pasajero en pesos colombianos (COP)',
    `airline` VARCHAR(80) NOT NULL DEFAULT 'SENAIR' COMMENT 'Aerolínea operadora del trayecto',
    `stops` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Número de escalas del trayecto (0 = Directo)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de alta del vuelo en el sistema',
    CONSTRAINT `uq_flight_schedule` UNIQUE (`origin`, `destination`, `departure_date`, `departure_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- TABLA: reservations
-- Guarda los tiquetes y reservas confirmadas por los usuarios autenticados.
-- Conecta al usuario con el vuelo y guarda el asiento y valor pagado.
-- -----------------------------------------------------------------------------
CREATE TABLE `reservations` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único de la reserva / tiquete',
    `user_id` INT UNSIGNED NOT NULL COMMENT 'Clave foránea que referencia al usuario que reservó',
    `flight_id` INT UNSIGNED NULL COMMENT 'Clave foránea que referencia al vuelo reservado',
    `origin` VARCHAR(120) NOT NULL COMMENT 'Origen del trayecto reservado',
    `destination` VARCHAR(120) NOT NULL COMMENT 'Destino del trayecto reservado',
    `departure_date` DATE NOT NULL COMMENT 'Fecha del viaje reservado',
    `departure_time` TIME NOT NULL COMMENT 'Hora de salida reservada',
    `arrival_time` TIME NOT NULL COMMENT 'Hora de llegada reservada',
    `seat` VARCHAR(50) NOT NULL COMMENT 'Código de asiento seleccionado (ej: 3A, 12C)',
    `price` INT UNSIGNED NOT NULL COMMENT 'Total pagado por la reserva en pesos colombianos (COP)',
    `airline` VARCHAR(80) NOT NULL DEFAULT 'SENAIR' COMMENT 'Aerolínea del viaje',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora en que se confirmó la reserva',
    CONSTRAINT `fk_reservations_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_reservations_flight`
        FOREIGN KEY (`flight_id`) REFERENCES `flights` (`id`)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. DATOS DE PRUEBA (SEED DATA PARA PROBAR EN MYSQL)
-- =============================================================================

-- Inserción de usuarios de prueba
-- Nota: La contraseña encriptada corresponde a 'Password123!' hasheada con bcrypt
INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
(1, 'Carlos Gómez', 'carlos@senair.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO3w6X.FmRzHk5R9lHk0B5uN9qCq9.G2e'),
(2, 'Laura Restrepo', 'laura@senair.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO3w6X.FmRzHk5R9lHk0B5uN9qCq9.G2e'),
(3, 'Andrés Felipe', 'andres@senair.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO3w6X.FmRzHk5R9lHk0B5uN9qCq9.G2e');

-- Inserción de vuelos demo (rutas nacionales SENAIR)
INSERT INTO `flights` (`id`, `origin`, `destination`, `departure_date`, `departure_time`, `arrival_time`, `price`, `airline`, `stops`) VALUES
(1, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '06:30:00', '07:25:00', 159000, 'SENAIR', 0),
(2, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '14:00:00', '14:55:00', 179000, 'SENAIR', 0),
(3, 'Bogotá (BOG)', 'Cartagena (CTG)', '2026-09-12', '09:10:00', '10:35:00', 189000, 'SENAIR', 0),
(4, 'Medellín (MDE)', 'Bogotá (BOG)', '2026-09-12', '18:20:00', '19:15:00', 169000, 'SENAIR', 0),
(5, 'Cali (CLO)', 'Cartagena (CTG)', '2026-09-11', '11:30:00', '14:05:00', 249000, 'SENAIR', 1),
(6, 'Cali (CLO)', 'Cartagena (CTG)', '2026-09-12', '11:30:00', '14:05:00', 249000, 'SENAIR', 1),
(7, 'Bogotá (BOG)', 'Santa Marta (SMR)', '2026-09-15', '08:00:00', '09:30:00', 199000, 'SENAIR', 0),
(8, 'Medellín (MDE)', 'San Andrés (ADZ)', '2026-09-18', '10:15:00', '12:10:00', 289000, 'SENAIR', 0);

-- Inserción de reservas de ejemplo vinculadas a usuarios y vuelos
INSERT INTO `reservations` (`id`, `user_id`, `flight_id`, `origin`, `destination`, `departure_date`, `departure_time`, `arrival_time`, `seat`, `price`, `airline`) VALUES
(1, 1, 1, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '06:30:00', '07:25:00', '4A', 159000, 'SENAIR'),
(2, 1, 3, 'Bogotá (BOG)', 'Cartagena (CTG)', '2026-09-12', '09:10:00', '10:35:00', '7F', 189000, 'SENAIR'),
(3, 2, 4, 'Medellín (MDE)', 'Bogotá (BOG)', '2026-09-12', '18:20:00', '19:15:00', '12C', 169000, 'SENAIR');

-- =============================================================================
-- 4. CONSULTAS ÚTILES DE EJEMPLO
-- =============================================================================

-- A. Consultar todas las reservas de un usuario con sus datos:
-- SELECT r.id, u.name AS pasajero, u.email, r.origin, r.destination, r.departure_date, r.departure_time, r.seat, r.price
-- FROM reservations r
-- INNER JOIN users u ON r.user_id = u.id
-- WHERE u.id = 1;

-- B. Buscar vuelos disponibles entre dos ciudades en una fecha:
-- SELECT * FROM flights
-- WHERE origin = 'Bogotá (BOG)' AND destination = 'Medellín (MDE)' AND departure_date = '2026-09-12'
-- ORDER BY departure_time ASC;
