
require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

/* ── Configuration ────────────────────────────────────────────── */

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const JWT_EXPIRY = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`];
const FRONTEND_ROOT = path.resolve(__dirname, "../FRONTEND");
const app = express();

if (!process.env.JWT_SECRET && IS_PRODUCTION) {
  console.warn("⚠ JWT_SECRET no está configurado. Se generó una clave temporal. Configura JWT_SECRET en las variables de entorno.");
}

/* ── Database ─────────────────────────────────────────────────── */

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "senair",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000,
  charset: "utf8mb4",
  dateStrings: true,
});

const demoFlights = [
  ["Bogotá (BOG)", "Medellín (MDE)", "2026-09-12", "06:30", "07:25", 159000, "SENAIR", 0],
  ["Bogotá (BOG)", "Medellín (MDE)", "2026-09-12", "14:00", "14:55", 179000, "SENAIR", 0],
  ["Bogotá (BOG)", "Cartagena (CTG)", "2026-09-12", "09:10", "10:35", 189000, "SENAIR", 0],
  ["Medellín (MDE)", "Bogotá (BOG)", "2026-09-12", "18:20", "19:15", 169000, "SENAIR", 0],
  ["Cali (CLO)", "Cartagena (CTG)", "2026-09-11", "11:30", "14:05", 249000, "SENAIR", 1],
  ["Cali (CLO)", "Cartagena (CTG)", "2026-09-12", "11:30", "14:05", 249000, "SENAIR", 1],
];

async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    connection.release();

    await pool.execute(`CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    await pool.execute(`CREATE TABLE IF NOT EXISTS flights (
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
      UNIQUE KEY uq_flight_route (origin, destination, departure_date, departure_time)
    ) ENGINE=InnoDB`);

    await pool.execute(`CREATE TABLE IF NOT EXISTS reservations (
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
    ) ENGINE=InnoDB`);

    for (const flight of demoFlights) {
      await pool.execute(
        "INSERT IGNORE INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        flight
      );
    }
    console.log("✔ Base de datos MySQL conectada e inicializada con éxito.");
  } catch (error) {
    console.warn("⚠ Aviso: No se pudo conectar a la base de datos MySQL.");
    console.warn("  Detalle:", error.message || error.code);
    console.warn("  El servidor web continuará funcionando para servir el frontend.");
    console.warn("  Para habilitar las funciones de base de datos, asegúrate de que MySQL esté activo.");
  }
}

async function createRouteFlights(origin, destination, date) {
  const schedules = [
    ["06:30", "07:25", 219000, 0],
    ["12:45", "13:40", 159000, 0],
    ["18:20", "19:15", 189000, 0],
  ];
  for (const [departureTime, arrivalTime, price, stops] of schedules) {
    await pool.execute(
      "INSERT IGNORE INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [origin, destination, date, departureTime, arrivalTime, price, "SENAIR", stops]
    );
  }
}

/* ── Auth helpers ─────────────────────────────────────────────── */

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function setAuthCookie(response, token) {
  response.cookie("senair_token", token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function requireAuth(request, response, next) {
  const token = request.cookies?.senair_token;
  if (!token) {
    return response.status(401).json({ success: false, message: "Inicia sesión para continuar." });
  }
  try {
    request.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    response.clearCookie("senair_token", { path: "/" });
    return response.status(401).json({ success: false, message: "Tu sesión expiró. Inicia sesión de nuevo." });
  }
}

/* ── Password policy ──────────────────────────────────────────── */

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_MESSAGE = "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.";

/* ── Security headers ─────────────────────────────────────────── */

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https://images.unsplash.com",
  "media-src 'self'",
  "style-src 'self' https://cdn.jsdelivr.net",
  "script-src 'self' https://cdn.jsdelivr.net https://accounts.google.com",
  IS_PRODUCTION
    ? "connect-src 'self' https://accounts.google.com"
    : "connect-src 'self' http://localhost:3000 http://127.0.0.1:3000 https://accounts.google.com",
  IS_PRODUCTION ? "upgrade-insecure-requests" : "",
].filter(Boolean).join("; ");

app.use((request, response, next) => {
  response.setHeader("Content-Security-Policy", cspDirectives);
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "same-origin");
  response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  const origin = request.headers.origin;
  if (IS_PRODUCTION) {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Access-Control-Allow-Credentials", "true");
    }
  } else if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
  }
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  if (request.method === "OPTIONS") return response.sendStatus(204);
  next();
});

/* ── Middleware ────────────────────────────────────────────────── */

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Demasiados intentos. Intenta de nuevo en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── Static files ─────────────────────────────────────────────── */

app.get(["/", "/index.html", "/SENAIR/FRONTEND/html/index.html"], (request, response) => response.redirect("/html/index.html"));
app.use(express.static(FRONTEND_ROOT, { index: false }));
app.use(express.static(path.join(FRONTEND_ROOT, "html"), { index: false }));
app.use("/SENAIR/FRONTEND", express.static(FRONTEND_ROOT, { index: false }));

/* ── Auth endpoints ───────────────────────────────────────────── */

app.get("/api/me", requireAuth, (request, response) => {
  response.json({ success: true, name: request.user.name, email: request.user.email });
});

app.post("/register", authLimiter, async (request, response) => {
  const name = String(request.body.name || "").trim();
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = String(request.body.password || "");

  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
    return response.status(400).json({ success: false, message: "Revisa tu nombre y correo." });
  }
  if (!PASSWORD_REGEX.test(password)) {
    return response.status(400).json({ success: false, message: PASSWORD_MESSAGE });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, passwordHash]);
    const userId = result.insertId;
    const token = signToken({ id: userId, email, name });
    setAuthCookie(response, token);
    return response.status(201).json({
      success: true,
      name,
      email,
      message: "Registro completado.",
      redirect: "/html/index.html",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ success: false, message: "El correo ya está registrado." });
    }
    return response.status(500).json({ success: false, message: "Error interno del servidor." });
  }
});

app.post("/login", authLimiter, async (request, response) => {
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = String(request.body.password || "");

  if (!email || !password) {
    return response.status(400).json({ success: false, message: "Email y contraseña requeridos." });
  }

  try {
    const [rows] = await pool.execute("SELECT id, name, email, password FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response.status(401).json({ success: false, message: "Credenciales inválidas." });
    }
    const token = signToken({ id: user.id, email: user.email, name: user.name });
    setAuthCookie(response, token);
    return response.json({ success: true, name: user.name, email: user.email, redirect: "/html/index.html" });
  } catch {
    return response.status(500).json({ success: false, message: "Error interno del servidor." });
  }
});

app.post("/logout", (request, response) => {
  response.clearCookie("senair_token", { path: "/" });
  response.json({ success: true, message: "Sesión cerrada." });
});

app.get("/logout", (request, response) => {
  response.clearCookie("senair_token", { path: "/" });
  response.redirect("/html/index.html");
});

/* ── Flight endpoints ─────────────────────────────────────────── */

app.get("/api/flights", async (request, response) => {
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
  try {
    const [flights] = await pool.execute(`SELECT id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops FROM flights ${where} ORDER BY departure_date, departure_time`, values);
    if (flights.length || !origin || !destination || !date || origin === destination || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return response.json({ success: true, flights });
    }

    await createRouteFlights(origin, destination, date);
    const [createdFlights] = await pool.execute("SELECT id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops FROM flights WHERE origin = ? AND destination = ? AND departure_date = ? ORDER BY departure_time", [origin, destination, date]);
    return response.json({ success: true, flights: createdFlights, created: true });
  } catch {
    return response.status(500).json({ success: false, message: "No se pudieron consultar los vuelos." });
  }
});

app.post("/api/flights", requireAuth, async (request, response) => {
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

  try {
    const [result] = await pool.execute(
      "INSERT INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [flight.origin, flight.destination, flight.departureDate, flight.departureTime, flight.arrivalTime, flight.price, flight.airline, flight.stops]
    );
    return response.status(201).json({ success: true, id: result.insertId, message: "Vuelo guardado." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return response.status(409).json({ success: false, message: "Ese vuelo ya existe para esa fecha y hora." });
    return response.status(500).json({ success: false, message: "No se pudo guardar el vuelo." });
  }
});

/* ── Reservation endpoints ────────────────────────────────────── */

app.post("/api/reservations", requireAuth, async (request, response) => {
  const reservation = {
    origin: String(request.body.origin || "").trim(),
    destination: String(request.body.destination || "").trim(),
    departureDate: String(request.body.departureDate || "").trim(),
    departureTime: String(request.body.departureTime || "").trim(),
    arrivalTime: String(request.body.arrivalTime || "").trim(),
    seat: String(request.body.seat || "").trim(),
    price: Number(request.body.price),
    airline: String(request.body.airline || "SENAIR").trim(),
    flightId: request.body.flightId ? Number(request.body.flightId) : null,
  };

  if (!reservation.origin || !reservation.destination || !reservation.departureDate || !reservation.departureTime || !reservation.arrivalTime || !reservation.seat || !Number.isInteger(reservation.price) || reservation.price < 0) {
    return response.status(400).json({ success: false, message: "Datos de reserva incompletos." });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO reservations (user_id, flight_id, origin, destination, departure_date, departure_time, arrival_time, seat, price, airline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [request.user.id, reservation.flightId, reservation.origin, reservation.destination, reservation.departureDate, reservation.departureTime, reservation.arrivalTime, reservation.seat, reservation.price, reservation.airline]
    );
    return response.status(201).json({ success: true, id: result.insertId, message: "Reserva confirmada." });
  } catch {
    return response.status(500).json({ success: false, message: "No se pudo guardar la reserva." });
  }
});

app.get("/api/reservations", requireAuth, async (request, response) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, origin, destination, departure_date, departure_time, arrival_time, seat, price, airline, created_at FROM reservations WHERE user_id = ? ORDER BY created_at DESC",
      [request.user.id]
    );
    return response.json({ success: true, reservations: rows });
  } catch {
    return response.status(500).json({ success: false, message: "No se pudieron consultar las reservas." });
  }
});

app.delete("/api/reservations/:id", requireAuth, async (request, response) => {
  const reservationId = Number.parseInt(request.params.id, 10);
  if (!reservationId) {
    return response.status(400).json({ success: false, message: "ID de reserva inválido." });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM reservations WHERE id = ? AND user_id = ?",
      [reservationId, request.user.id]
    );
    if (result.affectedRows === 0) {
      return response.status(404).json({ success: false, message: "Reserva no encontrada o no pertenece al usuario." });
    }
    return response.json({ success: true, message: "Reserva eliminada con éxito." });
  } catch {
    return response.status(500).json({ success: false, message: "No se pudo eliminar la reserva." });
  }
});

/* ── 404 ──────────────────────────────────────────────────────── */

app.use((request, response) => response.status(404).send("Recurso no encontrado"));

/* ── Start ────────────────────────────────────────────────────── */

initializeDatabase().finally(() => {
  app.listen(PORT, () => {
    console.log(`SENAIR disponible en http://localhost:${PORT}`);
  });
});
