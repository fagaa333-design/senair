
const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcryptjs");

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const FRONTEND_ROOT = path.resolve(__dirname, "../FRONTEND");
const DB_FILE = path.resolve(__dirname, "../database/senair.db");
const app = express();

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = new sqlite3.Database(DB_FILE);

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS flights (
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
)`);

const demoFlights = [
  ["Bogotá (BOG)", "Medellín (MDE)", "2026-09-12", "06:30", "07:25", 159000, "SENAIR", 0],
  ["Bogotá (BOG)", "Medellín (MDE)", "2026-09-12", "14:00", "14:55", 179000, "SENAIR", 0],
  ["Bogotá (BOG)", "Cartagena (CTG)", "2026-09-12", "09:10", "10:35", 189000, "SENAIR", 0],
  ["Medellín (MDE)", "Bogotá (BOG)", "2026-09-12", "18:20", "19:15", 169000, "SENAIR", 0],
  ["Cali (CLO)", "Cartagena (CTG)", "2026-09-11", "11:30", "14:05", 249000, "SENAIR", 1],
  ["Cali (CLO)", "Cartagena (CTG)", "2026-09-12", "11:30", "14:05", 249000, "SENAIR", 1],
];

function createRouteFlights(origin, destination, date, callback) {
  const schedules = [
    ["06:30", "07:25", 219000, 0],
    ["12:45", "13:40", 159000, 0],
    ["18:20", "19:15", 189000, 0],
  ];
  const statement = db.prepare("INSERT OR IGNORE INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  schedules.forEach(([departureTime, arrivalTime, price, stops]) => {
    statement.run([origin, destination, date, departureTime, arrivalTime, price, "SENAIR", stops]);
  });
  statement.finalize(callback);
}

const seedStatement = db.prepare("INSERT OR IGNORE INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
demoFlights.forEach((flight) => seedStatement.run(flight));
seedStatement.finalize();

app.use((request, response, next) => {
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https://images.unsplash.com; media-src 'self'; style-src 'self' https://cdn.jsdelivr.net; script-src 'self' https://cdn.jsdelivr.net https://accounts.google.com; connect-src 'self' http://localhost:3000 http://127.0.0.1:3000 https://accounts.google.com"
  );
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "same-origin");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  if (request.method === "OPTIONS") return response.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(FRONTEND_ROOT, { index: "html/index.html" }));

app.get("/api/flights", (request, response) => {
  const origin = String(request.query.origin || "").trim();
  const destination = String(request.query.destination || "").trim();
  const date = String(request.query.date || "").trim();
  const conditions = [];
  const values = [];

  if (origin) {
    conditions.push("origin = ?");
    values.push(origin);
  }
  if (destination) {
    conditions.push("destination = ?");
    values.push(destination);
  }
  if (date) {
    conditions.push("departure_date = ?");
    values.push(date);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  db.all(`SELECT id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops FROM flights ${where} ORDER BY departure_date, departure_time`, values, (error, flights) => {
    if (error) return response.status(500).json({ success: false, message: "No se pudieron consultar los vuelos." });
    if (flights.length || !origin || !destination || !date || origin === destination || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return response.json({ success: true, flights });
    }

    createRouteFlights(origin, destination, date, (creationError) => {
      if (creationError) return response.status(500).json({ success: false, message: "No se pudo crear la ruta solicitada." });
      db.all("SELECT id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops FROM flights WHERE origin = ? AND destination = ? AND departure_date = ? ORDER BY departure_time", [origin, destination, date], (queryError, createdFlights) => {
        if (queryError) return response.status(500).json({ success: false, message: "No se pudo consultar la ruta creada." });
        return response.json({ success: true, flights: createdFlights, created: true });
      });
    });
  });
});

app.post("/api/flights", (request, response) => {
  const flight = {
    origin: String(request.body.origin || "").trim(),
    destination: String(request.body.destination || "").trim(),
    departureDate: String(request.body.departureDate || "").trim(),
    departureTime: String(request.body.departureTime || "").trim(),
    arrivalTime: String(request.body.arrivalTime || "").trim(),
    price: Number(request.body.price),
    airline: String(request.body.airline || "SENAIR").trim(),
    stops: Number(request.body.stops || 0),
  };

  if (!flight.origin || !flight.destination || flight.origin === flight.destination || !/^\d{4}-\d{2}-\d{2}$/.test(flight.departureDate) || !/^\d{2}:\d{2}$/.test(flight.departureTime) || !/^\d{2}:\d{2}$/.test(flight.arrivalTime) || !Number.isInteger(flight.price) || flight.price < 0 || !Number.isInteger(flight.stops) || flight.stops < 0) {
    return response.status(400).json({ success: false, message: "Revisa los datos del vuelo." });
  }

  db.run(
    "INSERT INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [flight.origin, flight.destination, flight.departureDate, flight.departureTime, flight.arrivalTime, flight.price, flight.airline, flight.stops],
    function handleFlightInsert(error) {
      if (error && error.code === "SQLITE_CONSTRAINT") return response.status(409).json({ success: false, message: "Ese vuelo ya existe para esa fecha y hora." });
      if (error) return response.status(500).json({ success: false, message: "No se pudo guardar el vuelo." });
      return response.status(201).json({ success: true, id: this.lastID, message: "Vuelo guardado." });
    }
  );
});

app.post("/register", async (request, response) => {
  const name = String(request.body.name || "").trim();
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = String(request.body.password || "");

  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 4) {
    return response.status(400).json({ success: false, message: "Revisa tus datos. La contraseña debe tener al menos 4 caracteres." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, passwordHash],
      function handleInsert(error) {
        if (error) {
          if (error.code === "SQLITE_CONSTRAINT") {
            return response.status(409).json({ success: false, message: "El correo ya está registrado." });
          }
          return response.status(500).json({ success: false, message: "No se pudo crear el usuario." });
        }
        return response.status(201).json({
          success: true,
          name,
          email,
          message: "Registro completado.",
          redirect: "/html/index.html",
        });
      }
    );
  } catch {
    return response.status(500).json({ success: false, message: "Error interno del servidor." });
  }
});

app.post("/login", (request, response) => {
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = String(request.body.password || "");

  if (!email || !password) {
    return response.status(400).json({ success: false, message: "Email y contraseña requeridos." });
  }

  db.get("SELECT id, name, email, password FROM users WHERE email = ?", [email], async (error, user) => {
    if (error) return response.status(500).json({ success: false, message: "Error de base de datos." });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response.status(401).json({ success: false, message: "Credenciales inválidas." });
    }
    return response.json({ success: true, name: user.name, email: user.email, redirect: "/html/index.html" });
  });
});

app.use((request, response) => response.status(404).send("Recurso no encontrado"));

app.listen(PORT, () => {
  console.log(`SENAIR disponible en http://localhost:${PORT}`);
});
