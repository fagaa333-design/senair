-- ========================================================
-- SENAIR AIRLINES - CLON DE LA TABLA PRINCIPAL: 'flights'
-- Total de registros: 56
-- Generado: 2026-10-22T06:58:11.711Z
-- Desacoplado de la aplicación en producción para evaluación
-- ========================================================

CREATE TABLE flights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      departure_date TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      airline TEXT NOT NULL DEFAULT 'SENAIR',
      stops INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (origin, destination, departure_date, departure_time)
    );

INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (1, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '06:30', '07:25', 159000, 'SENAIR', 0, '2026-09-15 01:40:07');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (2, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '14:00', '14:55', 179000, 'SENAIR', 0, '2026-09-15 01:40:07');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (3, 'Bogotá (BOG)', 'Cartagena (CTG)', '2026-09-12', '09:10', '10:35', 189000, 'SENAIR', 0, '2026-09-15 01:40:07');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (4, 'Medellín (MDE)', 'Bogotá (BOG)', '2026-09-12', '18:20', '19:15', 169000, 'SENAIR', 0, '2026-09-15 01:40:07');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (5, 'Cali (CLO)', 'Cartagena (CTG)', '2026-09-11', '11:30', '14:05', 249000, 'SENAIR', 1, '2026-09-15 01:40:07');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (6, 'Cali (CLO)', 'Cartagena (CTG)', '2026-09-12', '11:30', '14:05', 249000, 'SENAIR', 1, '2026-09-15 01:40:07');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (25, 'Bogotá (BOG)', 'Leticia (LET)', '2026-09-12', '08:15', '10:20', 269000, 'SENAIR', 0, '2026-10-19 00:01:22');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (26, 'Bogotá (BOG)', 'Riohacha (RCH)', '2026-09-12', '10:00', '11:35', 199000, 'SENAIR', 0, '2026-10-19 00:01:22');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (28, 'Bogotá (BOG)', 'Santa Marta (SMR)', '2026-09-12', '11:20', '12:45', 199000, 'SENAIR', 0, '2026-10-19 00:01:22');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (29, 'Bogotá (BOG)', 'San Andrés (ADZ)', '2026-09-12', '13:10', '15:20', 229000, 'SENAIR', 0, '2026-10-19 00:01:22');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (32, 'Bogotá (BOG)', 'Ciudad de Panamá (PTY)', '2026-09-12', '10:30', '12:10', 1099000, 'SENAIR', 0, '2026-10-19 00:01:22');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (37, 'Bogotá (BOG)', 'Cali (CLO)', '2026-09-12', '15:30', '16:35', 169000, 'SENAIR', 0, '2026-10-19 01:16:20');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (38, 'Bogotá (BOG)', 'Madrid (MAD)', '2026-09-12', '20:45', '13:30', 4099000, 'SENAIR', 0, '2026-10-19 01:16:20');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (39, 'Bogotá (BOG)', 'París (CDG)', '2026-09-12', '22:15', '16:00', 5199000, 'SENAIR', 1, '2026-10-19 01:16:20');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (40, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '05:40', '06:35', 159000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (41, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '08:15', '09:10', 179000, 'LATAM', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (42, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '11:50', '12:45', 139000, 'SENAIR', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (43, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '14:25', '15:20', 189000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (44, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '18:40', '19:35', 169000, 'LATAM', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (45, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-09-12', '21:10', '22:05', 145000, 'SENAIR', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (46, 'Medellín (MDE)', 'Bogotá (BOG)', '2026-09-12', '06:20', '07:15', 169000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (47, 'Medellín (MDE)', 'Bogotá (BOG)', '2026-09-12', '13:30', '14:25', 155000, 'LATAM', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (48, 'Medellín (MDE)', 'Bogotá (BOG)', '2026-09-12', '19:15', '20:10', 149000, 'SENAIR', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (49, 'Bogotá (BOG)', 'Cali (CLO)', '2026-09-12', '06:10', '07:12', 169000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (50, 'Bogotá (BOG)', 'Cali (CLO)', '2026-09-12', '12:45', '13:48', 179000, 'LATAM', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (51, 'Bogotá (BOG)', 'Cali (CLO)', '2026-09-12', '18:20', '19:22', 155000, 'SENAIR', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (52, 'Bogotá (BOG)', 'Cartagena (CTG)', '2026-09-12', '06:45', '08:15', 189000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (53, 'Bogotá (BOG)', 'Cartagena (CTG)', '2026-09-12', '11:20', '12:50', 229000, 'LATAM', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (54, 'Bogotá (BOG)', 'Cartagena (CTG)', '2026-09-12', '16:35', '18:05', 195000, 'SENAIR', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (55, 'Cali (CLO)', 'Cartagena (CTG)', '2026-09-12', '09:30', '11:05', 249000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (56, 'Cali (CLO)', 'Cartagena (CTG)', '2026-09-12', '14:40', '16:15', 225000, 'LATAM', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (57, 'Bogotá (BOG)', 'Santa Marta (SMR)', '2026-09-12', '07:15', '08:45', 195000, 'LATAM', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (58, 'Bogotá (BOG)', 'Santa Marta (SMR)', '2026-09-12', '13:40', '15:10', 215000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (59, 'Bogotá (BOG)', 'Santa Marta (SMR)', '2026-09-12', '18:00', '19:30', 185000, 'SENAIR', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (60, 'Bogotá (BOG)', 'San Andrés (ADZ)', '2026-09-12', '08:10', '10:20', 229000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (61, 'Bogotá (BOG)', 'Leticia (LET)', '2026-09-12', '09:15', '11:20', 269000, 'LATAM', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (62, 'Bogotá (BOG)', 'Riohacha (RCH)', '2026-09-12', '10:30', '12:05', 199000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (63, 'Bogotá (BOG)', 'Cúcuta (CUC)', '2026-09-12', '07:45', '08:50', 169000, 'SENAIR', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (64, 'Bogotá (BOG)', 'Cancún (CUN)', '2026-09-12', '06:00', '09:40', 1299000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (65, 'Medellín (MDE)', 'Cancún (CUN)', '2026-09-12', '08:30', '12:15', 1349000, 'LATAM', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (66, 'Bogotá (BOG)', 'Ciudad de Panamá (PTY)', '2026-09-12', '07:30', '09:10', 1099000, 'Copa Airlines', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (67, 'Bogotá (BOG)', 'Ciudad de Panamá (PTY)', '2026-09-12', '15:20', '17:00', 1180000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (68, 'Bogotá (BOG)', 'Miami (MIA)', '2026-09-12', '06:20', '11:05', 1890000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (69, 'Bogotá (BOG)', 'Miami (MIA)', '2026-09-12', '14:15', '19:00', 2150000, 'American Airlines', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (70, 'Bogotá (BOG)', 'Orlando (MCO)', '2026-09-12', '07:15', '12:55', 2399000, 'Avianca', 1, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (71, 'Bogotá (BOG)', 'Nueva York (JFK)', '2026-09-12', '23:45', '06:30', 2890000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (72, 'Bogotá (BOG)', 'Río de Janeiro (GIG)', '2026-09-12', '21:00', '05:30', 2499000, 'LATAM', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (73, 'Bogotá (BOG)', 'Madrid (MAD)', '2026-09-12', '14:30', '06:45', 4099000, 'Iberia', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (74, 'Bogotá (BOG)', 'Madrid (MAD)', '2026-09-12', '18:50', '11:05', 4350000, 'Avianca', 0, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (75, 'Bogotá (BOG)', 'París (CDG)', '2026-09-12', '21:40', '15:20', 5199000, 'Air France', 1, '2026-10-20 20:48:15');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (436, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-11-15', '05:40', '06:35', 159000, 'Avianca', 0, '2026-10-22 05:07:32');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (437, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-11-15', '08:15', '09:10', 179000, 'LATAM', 0, '2026-10-22 05:07:32');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (438, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-11-15', '11:50', '12:45', 139000, 'SENAIR', 0, '2026-10-22 05:07:32');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (439, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-11-15', '14:25', '15:20', 189000, 'Avianca', 0, '2026-10-22 05:07:32');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (440, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-11-15', '17:40', '18:35', 215000, 'LATAM', 0, '2026-10-22 05:07:32');
INSERT INTO flights (id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops, created_at) VALUES (441, 'Bogotá (BOG)', 'Medellín (MDE)', '2026-11-15', '20:30', '21:25', 149000, 'SENAIR', 0, '2026-10-22 05:07:32');
