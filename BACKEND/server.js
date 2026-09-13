
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { pathToFileURL } = require("url");
const { createClient } = require("@libsql/client");
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
const DB_FILE = path.resolve(__dirname, "../database/senair.db");
const app = express();

if (!process.env.JWT_SECRET && IS_PRODUCTION) {
  console.warn("⚠ JWT_SECRET no está configurado. Se generó una clave temporal. Configura JWT_SECRET en las variables de entorno.");
}

/* ── Database ─────────────────────────────────────────────────── */

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || pathToFileURL(DB_FILE).href,
  authToken: process.env.TURSO_AUTH_TOKEN,
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
  await db.batch([
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS flights (
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
    )`,
    `CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      flight_id INTEGER,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      departure_date TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      seat TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      airline TEXT NOT NULL DEFAULT 'SENAIR',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    ...demoFlights.map((flight) => ({
      sql: "INSERT OR IGNORE INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: flight,
    })),
  ], "write");
}

async function createRouteFlights(origin, destination, date) {
  const schedules = [
    ["06:30", "07:25", 219000, 0],
    ["12:45", "13:40", 159000, 0],
    ["18:20", "19:15", 189000, 0],
  ];
  await db.batch(schedules.map(([departureTime, arrivalTime, price, stops]) => ({
    sql: "INSERT OR IGNORE INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [origin, destination, date, departureTime, arrivalTime, price, "SENAIR", stops],
  })), "write");
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
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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

app.get("/", (request, response) => response.redirect("/html/index.html"));
app.use(express.static(FRONTEND_ROOT, { index: false }));

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
    const result = await db.execute({ sql: "INSERT INTO users (name, email, password) VALUES (?, ?, ?)", args: [name, email, passwordHash] });
    const userId = Number(result.lastInsertRowid);
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
    if (error.code === "SQLITE_CONSTRAINT") {
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
    const result = await db.execute({ sql: "SELECT id, name, email, password FROM users WHERE email = ?", args: [email] });
    const user = result.rows[0];
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
    const result = await db.execute({ sql: `SELECT id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops FROM flights ${where} ORDER BY departure_date, departure_time`, args: values });
    const flights = result.rows.map((row) => ({ ...row }));
    if (flights.length || !origin || !destination || !date || origin === destination || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return response.json({ success: true, flights });
    }

    await createRouteFlights(origin, destination, date);
    const createdResult = await db.execute({ sql: "SELECT id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops FROM flights WHERE origin = ? AND destination = ? AND departure_date = ? ORDER BY departure_time", args: [origin, destination, date] });
    return response.json({ success: true, flights: createdResult.rows.map((row) => ({ ...row })), created: true });
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
    const result = await db.execute({
      sql: "INSERT INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [flight.origin, flight.destination, flight.departureDate, flight.departureTime, flight.arrivalTime, flight.price, flight.airline, flight.stops],
    });
    return response.status(201).json({ success: true, id: Number(result.lastInsertRowid), message: "Vuelo guardado." });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") return response.status(409).json({ success: false, message: "Ese vuelo ya existe para esa fecha y hora." });
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
    const result = await db.execute({
      sql: "INSERT INTO reservations (user_id, flight_id, origin, destination, departure_date, departure_time, arrival_time, seat, price, airline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [request.user.id, reservation.flightId, reservation.origin, reservation.destination, reservation.departureDate, reservation.departureTime, reservation.arrivalTime, reservation.seat, reservation.price, reservation.airline],
    });
    return response.status(201).json({ success: true, id: Number(result.lastInsertRowid), message: "Reserva confirmada." });
  } catch {
    return response.status(500).json({ success: false, message: "No se pudo guardar la reserva." });
  }
});

app.get("/api/reservations", requireAuth, async (request, response) => {
  try {
    const result = await db.execute({
      sql: "SELECT id, origin, destination, departure_date, departure_time, arrival_time, seat, price, airline, created_at FROM reservations WHERE user_id = ? ORDER BY created_at DESC",
      args: [request.user.id],
    });
    return response.json({ success: true, reservations: result.rows.map((row) => ({ ...row })) });
  } catch {
    return response.status(500).json({ success: false, message: "No se pudieron consultar las reservas." });
  }
});

/* ── 404 ──────────────────────────────────────────────────────── */

app.use((request, response) => response.status(404).send("Recurso no encontrado"));

/* ── Start ────────────────────────────────────────────────────── */

initializeDatabase()
  .then(() => app.listen(PORT, () => {
    console.log(`SENAIR disponible en http://localhost:${PORT}`);
  }))
  .catch((error) => {
    console.error("No se pudo inicializar la base de datos.", error);
    process.exit(1);
  });
