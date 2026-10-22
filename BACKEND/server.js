
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
const QRCode = require("qrcode");

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
const ADMIN_EMAIL = "freinergudino@gmail.com";
const ADMIN_PASSWORD_HASH = "$2a$10$eYPbqbntzyhXSw.DaCj7rOzfnCf6upji2528VBQ0RNVCTke3CzAoS";
const app = express();
app.disable("x-powered-by");

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
  // Bogotá -> Medellín
  ["Bogotá (BOG)", "Medellín (MDE)", "2026-09-12", "05:40", "06:35", 159000, "Avianca", 0],
  ["Bogotá (BOG)", "Medellín (MDE)", "2026-09-12", "08:15", "09:10", 179000, "LATAM", 0],
  ["Bogotá (BOG)", "Medellín (MDE)", "2026-09-12", "11:50", "12:45", 139000, "SENAIR", 0],
  ["Bogotá (BOG)", "Medellín (MDE)", "2026-09-12", "14:25", "15:20", 189000, "Avianca", 0],
  ["Bogotá (BOG)", "Medellín (MDE)", "2026-09-12", "18:40", "19:35", 169000, "LATAM", 0],
  ["Bogotá (BOG)", "Medellín (MDE)", "2026-09-12", "21:10", "22:05", 145000, "SENAIR", 0],

  // Medellín -> Bogotá
  ["Medellín (MDE)", "Bogotá (BOG)", "2026-09-12", "06:20", "07:15", 169000, "Avianca", 0],
  ["Medellín (MDE)", "Bogotá (BOG)", "2026-09-12", "13:30", "14:25", 155000, "LATAM", 0],
  ["Medellín (MDE)", "Bogotá (BOG)", "2026-09-12", "19:15", "20:10", 149000, "SENAIR", 0],

  // Bogotá -> Cali
  ["Bogotá (BOG)", "Cali (CLO)", "2026-09-12", "06:10", "07:12", 169000, "Avianca", 0],
  ["Bogotá (BOG)", "Cali (CLO)", "2026-09-12", "12:45", "13:48", 179000, "LATAM", 0],
  ["Bogotá (BOG)", "Cali (CLO)", "2026-09-12", "18:20", "19:22", 155000, "SENAIR", 0],

  // Bogotá -> Cartagena
  ["Bogotá (BOG)", "Cartagena (CTG)", "2026-09-12", "06:45", "08:15", 189000, "Avianca", 0],
  ["Bogotá (BOG)", "Cartagena (CTG)", "2026-09-12", "11:20", "12:50", 229000, "LATAM", 0],
  ["Bogotá (BOG)", "Cartagena (CTG)", "2026-09-12", "16:35", "18:05", 195000, "SENAIR", 0],
  ["Cali (CLO)", "Cartagena (CTG)", "2026-09-12", "09:30", "11:05", 249000, "Avianca", 0],
  ["Cali (CLO)", "Cartagena (CTG)", "2026-09-12", "14:40", "16:15", 225000, "LATAM", 0],

  // Bogotá -> Santa Marta
  ["Bogotá (BOG)", "Santa Marta (SMR)", "2026-09-12", "07:15", "08:45", 195000, "LATAM", 0],
  ["Bogotá (BOG)", "Santa Marta (SMR)", "2026-09-12", "13:40", "15:10", 215000, "Avianca", 0],
  ["Bogotá (BOG)", "Santa Marta (SMR)", "2026-09-12", "18:00", "19:30", 185000, "SENAIR", 0],

  // Otros destinos nacionales
  ["Bogotá (BOG)", "San Andrés (ADZ)", "2026-09-12", "08:10", "10:20", 229000, "Avianca", 0],
  ["Bogotá (BOG)", "Leticia (LET)", "2026-09-12", "09:15", "11:20", 269000, "LATAM", 0],
  ["Bogotá (BOG)", "Riohacha (RCH)", "2026-09-12", "10:30", "12:05", 199000, "Avianca", 0],
  ["Bogotá (BOG)", "Cúcuta (CUC)", "2026-09-12", "07:45", "08:50", 169000, "SENAIR", 0],

  // Internacionales
  ["Bogotá (BOG)", "Cancún (CUN)", "2026-09-12", "06:00", "09:40", 1299000, "Avianca", 0],
  ["Medellín (MDE)", "Cancún (CUN)", "2026-09-12", "08:30", "12:15", 1349000, "LATAM", 0],
  ["Bogotá (BOG)", "Ciudad de Panamá (PTY)", "2026-09-12", "07:30", "09:10", 1099000, "Copa Airlines", 0],
  ["Bogotá (BOG)", "Ciudad de Panamá (PTY)", "2026-09-12", "15:20", "17:00", 1180000, "Avianca", 0],
  ["Bogotá (BOG)", "Miami (MIA)", "2026-09-12", "06:20", "11:05", 1890000, "Avianca", 0],
  ["Bogotá (BOG)", "Miami (MIA)", "2026-09-12", "14:15", "19:00", 2150000, "American Airlines", 0],
  ["Bogotá (BOG)", "Orlando (MCO)", "2026-09-12", "07:15", "12:55", 2399000, "Avianca", 1],
  ["Bogotá (BOG)", "Nueva York (JFK)", "2026-09-12", "23:45", "06:30", 2890000, "Avianca", 0],
  ["Bogotá (BOG)", "Río de Janeiro (GIG)", "2026-09-12", "21:00", "05:30", 2499000, "LATAM", 0],
  ["Bogotá (BOG)", "Madrid (MAD)", "2026-09-12", "14:30", "06:45", 4099000, "Iberia", 0],
  ["Bogotá (BOG)", "Madrid (MAD)", "2026-09-12", "18:50", "11:05", 4350000, "Avianca", 0],
  ["Bogotá (BOG)", "París (CDG)", "2026-09-12", "21:40", "15:20", 5199000, "Air France", 1]
];

async function initializeDatabase() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
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
    `CREATE TABLE IF NOT EXISTS survey_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      age_range TEXT,
      city TEXT,
      privacy_accepted INTEGER NOT NULL DEFAULT 1,
      privacy_version TEXT NOT NULL DEFAULT 'v1.0',
      status TEXT NOT NULL DEFAULT 'registered',
      traveler_profile TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL,
      question_id TEXT NOT NULL,
      question_text TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (participant_id) REFERENCES survey_participants(id),
      UNIQUE (participant_id, question_id)
    )`,
    ...demoFlights.map((flight) => ({
      sql: "INSERT OR IGNORE INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: flight,
    })),
  ], "write");

  const usersColumns = await db.execute({ sql: "PRAGMA table_info(users)", args: [] });
  const hasRoleColumn = usersColumns.rows.some((column) => column.name === "role");
  if (!hasRoleColumn) {
    await db.execute({ sql: "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'", args: [] });
  }

  await db.execute({
    sql: "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin') ON CONFLICT(email) DO UPDATE SET name = excluded.name, password = excluded.password, role = 'admin'",
    args: ["Administrador", ADMIN_EMAIL, ADMIN_PASSWORD_HASH],
  });
}

function getRouteMetadata(origin, destination) {
  const combined = `${origin} ${destination}`.toLowerCase();
  
  // Transatlántico
  if (/madrid|barcelona|paris|parís|londres|roma|amsterdam|tokio/.test(combined)) {
    return {
      type: "transatlantic",
      schedules: [
        { dep: "14:20", arr: "06:35", price: 4150000, airline: "Avianca", stops: 0 },
        { dep: "18:45", arr: "11:15", price: 3890000, airline: "Iberia", stops: 0 },
        { dep: "21:30", arr: "15:20", price: 4420000, airline: "Air France", stops: 1 }
      ]
    };
  }

  // Norteamérica / Cono Sur
  if (/nueva york|miami|orlando|los angeles|toronto|rio|río|sao paulo|são paulo|buenos aires/.test(combined)) {
    return {
      type: "americas",
      schedules: [
        { dep: "06:15", arr: "11:50", price: 2190000, airline: "Avianca", stops: 0 },
        { dep: "12:40", arr: "18:15", price: 1890000, airline: "LATAM", stops: 0 },
        { dep: "17:10", arr: "23:45", price: 2450000, airline: "American Airlines", stops: 1 },
        { dep: "23:15", arr: "05:40", price: 1690000, airline: "SENAIR", stops: 0 }
      ]
    };
  }

  // Caribe / Centroamérica / Región Andina
  if (/cancun|cancún|panama|panamá|lima|quito|punta cana|caracas|santiago/.test(combined)) {
    return {
      type: "regional",
      schedules: [
        { dep: "06:50", arr: "09:20", price: 1190000, airline: "Copa Airlines", stops: 0 },
        { dep: "11:15", arr: "13:50", price: 1290000, airline: "Avianca", stops: 0 },
        { dep: "15:40", arr: "18:15", price: 990000, airline: "SENAIR", stops: 0 },
        { dep: "19:25", arr: "22:00", price: 1150000, airline: "LATAM", stops: 0 }
      ]
    };
  }

  // Nacional Costa / Islas / Selva
  if (/cartagena|santa marta|san andres|san andrés|leticia|riohacha|monteria|montería/.test(combined)) {
    return {
      type: "national_long",
      schedules: [
        { dep: "05:50", arr: "07:20", price: 189000, airline: "Avianca", stops: 0 },
        { dep: "08:35", arr: "10:05", price: 215000, airline: "LATAM", stops: 0 },
        { dep: "12:15", arr: "13:45", price: 175000, airline: "SENAIR", stops: 0 },
        { dep: "15:40", arr: "17:10", price: 239000, airline: "Avianca", stops: 0 },
        { dep: "19:10", arr: "20:40", price: 199000, airline: "LATAM", stops: 0 }
      ]
    };
  }

  // Nacional Troncal Corto (Medellín, Cali, Bucaramanga, Pereira, Cúcuta, etc.)
  return {
    type: "national_short",
    schedules: [
      { dep: "05:40", arr: "06:35", price: 159000, airline: "Avianca", stops: 0 },
      { dep: "08:15", arr: "09:10", price: 179000, airline: "LATAM", stops: 0 },
      { dep: "11:50", arr: "12:45", price: 139000, airline: "SENAIR", stops: 0 },
      { dep: "14:25", arr: "15:20", price: 189000, airline: "Avianca", stops: 0 },
      { dep: "17:40", arr: "18:35", price: 215000, airline: "LATAM", stops: 0 },
      { dep: "20:30", arr: "21:25", price: 149000, airline: "SENAIR", stops: 0 }
    ]
  };
}

async function createRouteFlights(origin, destination, date) {
  const meta = getRouteMetadata(origin, destination);
  await db.batch(meta.schedules.map((item) => ({
    sql: "INSERT OR IGNORE INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [origin, destination, date, item.dep, item.arr, item.price, item.airline, item.stops],
  })), "write");
}

/* ── Auth helpers ─────────────────────────────────────────────── */

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role || "user" }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
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

function requireAdmin(request, response, next) {
  const token = request.cookies?.senair_token;
  if (!token) {
    return response.status(401).json({ success: false, message: "No autorizado. Inicia sesión como administrador." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== ADMIN_EMAIL || decoded.role !== "admin") {
      return response.status(403).json({ success: false, message: "Acceso denegado. Se requieren permisos de administrador." });
    }
    request.user = decoded;
    next();
  } catch {
    response.clearCookie("senair_token", { path: "/" });
    return response.status(401).json({ success: false, message: "Sesión expirada. Inicia sesión de nuevo." });
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
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
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
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  response.setHeader("X-DNS-Prefetch-Control", "off");
  response.setHeader("X-XSS-Protection", "1; mode=block");

  const origin = request.headers.origin;
  const isAllowedOrigin = (orig) => {
    if (!orig) return true;
    if (ALLOWED_ORIGINS.includes(orig)) return true;
    if (!IS_PRODUCTION && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(orig)) return true;
    return false;
  };

  if (origin && isAllowedOrigin(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
  }
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
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


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Demasiadas peticiones. Por favor, intenta de nuevo en unos minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

/* ── Static files ─────────────────────────────────────────────── */

/* ── Server-Side Admin Gate ──────────────────────────────────── */
app.get(["/admin", "/admin.html", "/html/admin.html", "/SENAIR/FRONTEND/html/admin.html"], (request, response) => {
  const token = request.cookies?.senair_token;
  if (!token) {
    return response.redirect("/html/login.html?redirect=admin.html&msg=admin_required");
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== ADMIN_EMAIL || decoded.role !== "admin") {
      return response.redirect("/html/login.html?redirect=admin.html&msg=forbidden");
    }
    return response.sendFile(path.join(FRONTEND_ROOT, "html", "admin.html"));
  } catch {
    response.clearCookie("senair_token", { path: "/" });
    return response.redirect("/html/login.html?redirect=admin.html&msg=session_expired");
  }
});

app.get(["/", "/index.html", "/SENAIR/FRONTEND/html/index.html"], (request, response) => response.redirect("/html/index.html"));
app.use(express.static(FRONTEND_ROOT, { index: false }));
app.use("/SENAIR/FRONTEND", express.static(FRONTEND_ROOT, { index: false }));

/* ── Auth endpoints ───────────────────────────────────────────── */

app.get("/api/me", requireAuth, (request, response) => {
  response.json({ success: true, name: request.user.name, email: request.user.email });
});

app.post("/register", async (request, response) => {
  const name = String(request.body.name || "").trim();
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = String(request.body.password || "");

  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 190) {
    return response.status(400).json({ success: false, message: "Revisa tu nombre y correo." });
  }
  if (!PASSWORD_REGEX.test(password) || password.length > 128) {
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

app.post("/login", async (request, response) => {
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = String(request.body.password || "");

  if (!email || !password || email.length > 190 || password.length > 128) {
    return response.status(400).json({ success: false, message: "Email y contraseña requeridos." });
  }

  try {
    const result = await db.execute({ sql: "SELECT id, name, email, password, role FROM users WHERE email = ?", args: [email] });
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response.status(401).json({ success: false, message: "Credenciales inválidas." });
    }
    const isAdmin = user.email === ADMIN_EMAIL && user.role === "admin";
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    setAuthCookie(response, token);
    return response.json({
      success: true,
      name: user.name,
      email: user.email,
      isAdmin,
      redirect: isAdmin ? "/html/admin.html" : "/html/index.html",
    });
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
  let origin = String(request.query.origin || "").trim().slice(0, 80).replace(/[;'"\\]/g, "");
  let destination = String(request.query.destination || "").trim().slice(0, 80).replace(/[;'"\\]/g, "");
  let date = String(request.query.date || "").trim().slice(0, 20);
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    date = "";
  }
  const conditions = [];
  const values = [];

  if (origin) {
    conditions.push("(origin = ? OR origin LIKE ?)");
    values.push(origin, `%${origin}%`);
  }
  if (destination) {
    conditions.push("(destination = ? OR destination LIKE ?)");
    values.push(destination, `%${destination}%`);
  }
  if (date) {
    conditions.push("departure_date = ?");
    values.push(date);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  try {
    const result = await db.execute({ sql: `SELECT id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops FROM flights ${where} ORDER BY departure_date, departure_time`, args: values });
    let flights = result.rows.map((row) => ({ ...row }));
    if (flights.length) {
      return response.json({ success: true, flights });
    }

    if (destination) {
      const defaultOrigin = origin || (destination.includes("Bogotá") ? "Medellín (MDE)" : "Bogotá (BOG)");
      const defaultDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "2026-09-12";
      if (defaultOrigin !== destination) {
        await createRouteFlights(defaultOrigin, destination, defaultDate);
        const createdResult = await db.execute({
          sql: "SELECT id, origin, destination, departure_date, departure_time, arrival_time, price, airline, stops FROM flights WHERE (destination = ? OR destination LIKE ?) ORDER BY departure_date, departure_time",
          args: [destination, `%${destination}%`],
        });
        flights = createdResult.rows.map((row) => ({ ...row }));
        if (flights.length) {
          return response.json({ success: true, flights, created: true });
        }
      }
    }

    return response.json({ success: true, flights: [] });
  } catch {
    return response.status(500).json({ success: false, message: "No se pudieron consultar los vuelos." });
  }
});

app.post("/api/flights", requireAdmin, async (request, response) => {
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
    origin: String(request.body.origin || "").trim().slice(0, 80).replace(/[<>'"\\;]/g, ""),
    destination: String(request.body.destination || "").trim().slice(0, 80).replace(/[<>'"\\;]/g, ""),
    departureDate: String(request.body.departureDate || "").trim().slice(0, 20),
    departureTime: String(request.body.departureTime || "").trim().slice(0, 10),
    arrivalTime: String(request.body.arrivalTime || "").trim().slice(0, 10),
    seat: String(request.body.seat || "").trim().slice(0, 60),
    price: Number(request.body.price),
    airline: String(request.body.airline || "SENAIR").trim().slice(0, 50).replace(/[<>'"\\;]/g, ""),
    flightId: request.body.flightId ? Number(request.body.flightId) : null,
  };

  if (
    !reservation.origin ||
    !reservation.destination ||
    !/^\d{4}-\d{2}-\d{2}$/.test(reservation.departureDate) ||
    !/^\d{2}:\d{2}$/.test(reservation.departureTime) ||
    !/^\d{2}:\d{2}$/.test(reservation.arrivalTime) ||
    !/^[1-8][A-F](\s*,\s*[1-8][A-F])*$/.test(reservation.seat) ||
    !Number.isInteger(reservation.price) ||
    reservation.price < 0 ||
    reservation.price > 100000000
  ) {
    return response.status(400).json({ success: false, message: "Datos de reserva inválidos o incompletos." });
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

app.delete("/api/reservations/:id", requireAuth, async (request, response) => {
  const reservationId = Number.parseInt(request.params.id, 10);
  if (!reservationId) {
    return response.status(400).json({ success: false, message: "ID de reserva inválido." });
  }

  try {
    const result = await db.execute({
      sql: "DELETE FROM reservations WHERE id = ? AND user_id = ?",
      args: [reservationId, request.user.id],
    });
    if (result.rowsAffected === 0) {
      return response.status(404).json({ success: false, message: "Reserva no encontrada o no pertenece al usuario." });
    }
    return response.json({ success: true, message: "Reserva eliminada con éxito." });
  } catch {
    return response.status(500).json({ success: false, message: "No se pudo eliminar la reserva." });
  }
});

/* ── Admin Endpoints ─────────────────────────────────────────── */

let isMaintenanceModeActive = false;

app.get(["/admin", "/admin.html", "/html/admin.html"], (request, response) => response.redirect("/html/mantenimiento.html"));

app.get("/api/admin/check", requireAdmin, (request, response) => {
  response.json({
    success: true,
    user: {
      name: request.user.name,
      email: request.user.email,
      role: request.user.role,
    },
  });
});

app.get("/api/admin/stats", requireAdmin, async (request, response) => {
  try {
    const [usersCountRes, flightsCountRes, reservationsRes, recentRes] = await Promise.all([
      db.execute({ sql: "SELECT COUNT(*) AS total FROM users", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) AS total FROM flights", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) AS total, COALESCE(SUM(price), 0) AS total_revenue FROM reservations", args: [] }),
      db.execute({
        sql: "SELECT r.id, r.origin, r.destination, r.seat, r.price, r.created_at, u.name AS user_name, u.email AS user_email FROM reservations r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC LIMIT 5",
        args: []
      }),
    ]);

    const totalUsers = Number(usersCountRes.rows[0]?.total || 0);
    const totalFlights = Number(flightsCountRes.rows[0]?.total || 0);
    const totalReservations = Number(reservationsRes.rows[0]?.total || 0);
    const totalRevenue = Number(reservationsRes.rows[0]?.total_revenue || 0);

    response.json({
      success: true,
      stats: {
        totalUsers,
        totalFlights,
        totalReservations,
        totalRevenue,
      },
      recentReservations: recentRes.rows.map((row) => ({ ...row })),
      maintenanceMode: isMaintenanceModeActive,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de admin:", error);
    response.status(500).json({ success: false, message: "Error al calcular estadísticas." });
  }
});

app.get("/api/admin/flights", requireAdmin, async (request, response) => {
  try {
    const result = await db.execute({
      sql: `SELECT f.*, COUNT(r.id) AS bookings_count
            FROM flights f
            LEFT JOIN reservations r ON f.id = r.flight_id
            GROUP BY f.id
            ORDER BY f.departure_date DESC, f.departure_time ASC`,
      args: [],
    });
    response.json({ success: true, flights: result.rows.map((row) => ({ ...row })) });
  } catch (error) {
    console.error("Error al consultar vuelos de admin:", error);
    response.status(500).json({ success: false, message: "Error al obtener vuelos." });
  }
});

app.post("/api/admin/flights", requireAdmin, async (request, response) => {
  const origin = String(request.body.origin || "").trim();
  const destination = String(request.body.destination || "").trim();
  const departureDate = String(request.body.departureDate || "").trim();
  const departureTime = String(request.body.departureTime || "").trim();
  const arrivalTime = String(request.body.arrivalTime || "").trim();
  const price = Number(request.body.price);
  const airline = String(request.body.airline || "SENAIR").trim();
  const stops = Number(request.body.stops || 0);

  if (!origin || !destination || origin === destination || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate) || !/^\d{2}:\d{2}$/.test(departureTime) || !/^\d{2}:\d{2}$/.test(arrivalTime) || !Number.isInteger(price) || price < 0 || !Number.isInteger(stops) || stops < 0) {
    return response.status(400).json({ success: false, message: "Datos de vuelo inválidos o incompletos." });
  }

  try {
    const result = await db.execute({
      sql: "INSERT INTO flights (origin, destination, departure_date, departure_time, arrival_time, price, airline, stops) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [origin, destination, departureDate, departureTime, arrivalTime, price, airline, stops],
    });
    response.status(201).json({ success: true, id: Number(result.lastInsertRowid), message: "Vuelo creado con éxito." });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      return response.status(409).json({ success: false, message: "Ya existe un vuelo programado en esa fecha, hora y ruta." });
    }
    response.status(500).json({ success: false, message: "Error al guardar el vuelo." });
  }
});

app.put("/api/admin/flights/:id", requireAdmin, async (request, response) => {
  const flightId = Number.parseInt(request.params.id, 10);
  if (!flightId) return response.status(400).json({ success: false, message: "ID de vuelo inválido." });

  const origin = String(request.body.origin || "").trim();
  const destination = String(request.body.destination || "").trim();
  const departureDate = String(request.body.departureDate || "").trim();
  const departureTime = String(request.body.departureTime || "").trim();
  const arrivalTime = String(request.body.arrivalTime || "").trim();
  const price = Number(request.body.price);
  const airline = String(request.body.airline || "SENAIR").trim();
  const stops = Number(request.body.stops || 0);

  if (!origin || !destination || origin === destination || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate) || !/^\d{2}:\d{2}$/.test(departureTime) || !/^\d{2}:\d{2}$/.test(arrivalTime) || !Number.isInteger(price) || price < 0) {
    return response.status(400).json({ success: false, message: "Datos de actualización inválidos." });
  }

  try {
    const result = await db.execute({
      sql: "UPDATE flights SET origin = ?, destination = ?, departure_date = ?, departure_time = ?, arrival_time = ?, price = ?, airline = ?, stops = ? WHERE id = ?",
      args: [origin, destination, departureDate, departureTime, arrivalTime, price, airline, stops, flightId],
    });
    if (result.rowsAffected === 0) {
      return response.status(404).json({ success: false, message: "Vuelo no encontrado." });
    }
    response.json({ success: true, message: "Vuelo actualizado correctamente." });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      return response.status(409).json({ success: false, message: "Conflicto con otro vuelo existente en ese horario." });
    }
    response.status(500).json({ success: false, message: "Error al actualizar vuelo." });
  }
});

app.delete("/api/admin/flights/:id", requireAdmin, async (request, response) => {
  const flightId = Number.parseInt(request.params.id, 10);
  if (!flightId) return response.status(400).json({ success: false, message: "ID de vuelo inválido." });

  try {
    const result = await db.execute({
      sql: "DELETE FROM flights WHERE id = ?",
      args: [flightId],
    });
    if (result.rowsAffected === 0) {
      return response.status(404).json({ success: false, message: "Vuelo no encontrado." });
    }
    response.json({ success: true, message: "Vuelo eliminado del sistema." });
  } catch (error) {
    response.status(500).json({ success: false, message: "Error al eliminar el vuelo." });
  }
});

app.get("/api/admin/reservations", requireAdmin, async (request, response) => {
  try {
    const result = await db.execute({
      sql: `SELECT r.*, u.name AS user_name, u.email AS user_email
            FROM reservations r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC`,
      args: [],
    });
    response.json({ success: true, reservations: result.rows.map((row) => ({ ...row })) });
  } catch (error) {
    response.status(500).json({ success: false, message: "Error al obtener reservas." });
  }
});

app.delete("/api/admin/reservations/:id", requireAdmin, async (request, response) => {
  const reservationId = Number.parseInt(request.params.id, 10);
  if (!reservationId) return response.status(400).json({ success: false, message: "ID de reserva inválido." });

  try {
    const result = await db.execute({
      sql: "DELETE FROM reservations WHERE id = ?",
      args: [reservationId],
    });
    if (result.rowsAffected === 0) {
      return response.status(404).json({ success: false, message: "Reserva no encontrada." });
    }
    response.json({ success: true, message: "Reserva cancelada y eliminada con éxito." });
  } catch (error) {
    response.status(500).json({ success: false, message: "Error al cancelar la reserva." });
  }
});

app.get("/api/admin/users", requireAdmin, async (request, response) => {
  try {
    const result = await db.execute({
      sql: `SELECT u.id, u.name, u.email, u.role, u.created_at, COUNT(r.id) AS reservations_count
            FROM users u
            LEFT JOIN reservations r ON u.id = r.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC`,
      args: [],
    });
    response.json({ success: true, users: result.rows.map((row) => ({ ...row })) });
  } catch (error) {
    response.status(500).json({ success: false, message: "Error al obtener lista de usuarios." });
  }
});

app.delete("/api/admin/users/:id", requireAdmin, async (request, response) => {
  const userId = Number.parseInt(request.params.id, 10);
  if (!userId) return response.status(400).json({ success: false, message: "ID de usuario inválido." });

  try {
    const userRes = await db.execute({ sql: "SELECT email FROM users WHERE id = ?", args: [userId] });
    const targetUser = userRes.rows[0];
    if (!targetUser) return response.status(404).json({ success: false, message: "Usuario no encontrado." });

    if (targetUser.email === ADMIN_EMAIL) {
      return response.status(403).json({ success: false, message: "No es posible eliminar la cuenta del Administrador principal." });
    }

    // Eliminar primero las reservas asociadas para no violar la restricción de clave foránea
    await db.execute({ sql: "DELETE FROM reservations WHERE user_id = ?", args: [userId] });
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [userId] });
    response.json({ success: true, message: "Usuario y sus reservas eliminados con éxito." });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    response.status(500).json({ success: false, message: "Error al eliminar usuario." });
  }
});

app.get("/api/admin/maintenance", requireAdmin, (request, response) => {
  response.json({ success: true, active: isMaintenanceModeActive });
});

app.post("/api/admin/maintenance", requireAdmin, (request, response) => {
  isMaintenanceModeActive = Boolean(request.body.active);
  response.json({
    success: true,
    active: isMaintenanceModeActive,
    message: isMaintenanceModeActive ? "Modo mantenimiento ACTIVADO." : "Modo mantenimiento DESACTIVADO.",
  });
});


/* ── Encuesta Interactiva Feria de Software ─────────────────────── */

app.post("/api/survey/register", async (request, response) => {
  const { name, email, age_range, city, privacy_accepted } = request.body || {};
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanAge = typeof age_range === "string" ? age_range.trim() : "";
  const cleanCity = typeof city === "string" ? city.trim() : "";

  if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
    return response.status(400).json({ success: false, message: "Por favor ingresa un nombre válido (mínimo 2 caracteres)." });
  }

  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return response.status(400).json({ success: false, message: "Por favor ingresa un correo electrónico válido." });
  }

  if (!privacy_accepted) {
    return response.status(400).json({ success: false, message: "Debes aceptar el tratamiento de datos personales conforme a la Ley 1581 de 2012 para participar." });
  }

  try {
    const sessionToken = crypto.randomBytes(24).toString("hex");
    const result = await db.execute({
      sql: `INSERT INTO survey_participants (session_token, name, email, age_range, city, privacy_accepted, privacy_version)
            VALUES (?, ?, ?, ?, ?, 1, 'v1.0')`,
      args: [sessionToken, cleanName, cleanEmail || null, cleanAge || null, cleanCity || null],
    });

    response.json({
      success: true,
      token: sessionToken,
      participantId: Number(result.lastInsertRowid),
      name: cleanName,
    });
  } catch (error) {
    console.error("Error registrando participante de encuesta:", error);
    response.status(500).json({ success: false, message: "No se pudo registrar la participación. Intenta de nuevo." });
  }
});

app.get("/api/survey/state", async (request, response) => {
  const token = request.headers["x-survey-token"] || request.query.token;
  if (!token) return response.status(400).json({ success: false, message: "Token no proporcionado." });

  try {
    const pRes = await db.execute({
      sql: "SELECT id, name, status, traveler_profile FROM survey_participants WHERE session_token = ?",
      args: [token],
    });
    const participant = pRes.rows[0];
    if (!participant) return response.status(404).json({ success: false, message: "Sesión de encuesta no encontrada." });

    const ansRes = await db.execute({
      sql: "SELECT question_id, question_text, answer FROM survey_responses WHERE participant_id = ?",
      args: [participant.id],
    });

    const answers = {};
    for (const row of ansRes.rows) {
      answers[row.question_id] = row.answer;
    }

    response.json({
      success: true,
      participant: {
        name: participant.name,
        status: participant.status,
        travelerProfile: participant.traveler_profile,
      },
      answers,
    });
  } catch (error) {
    console.error("Error obteniendo estado de encuesta:", error);
    response.status(500).json({ success: false, message: "Error al recuperar respuestas." });
  }
});

app.post("/api/survey/answer", async (request, response) => {
  const token = request.headers["x-survey-token"] || request.body.token;
  const { question_id, question_text, answer } = request.body || {};

  if (!token || !question_id || !answer) {
    return response.status(400).json({ success: false, message: "Datos de respuesta incompletos." });
  }

  try {
    const pRes = await db.execute({
      sql: "SELECT id, status FROM survey_participants WHERE session_token = ?",
      args: [token],
    });
    const participant = pRes.rows[0];
    if (!participant) return response.status(404).json({ success: false, message: "Sesión de encuesta no válida." });

    await db.execute({
      sql: `INSERT INTO survey_responses (participant_id, question_id, question_text, answer)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(participant_id, question_id) DO UPDATE SET answer = excluded.answer, question_text = excluded.question_text`,
      args: [participant.id, String(question_id), String(question_text || question_id), String(answer)],
    });

    if (participant.status === "registered") {
      await db.execute({
        sql: "UPDATE survey_participants SET status = 'in_progress' WHERE id = ?",
        args: [participant.id],
      });
    }

    response.json({ success: true, message: "Respuesta guardada con éxito." });
  } catch (error) {
    console.error("Error guardando respuesta de encuesta:", error);
    response.status(500).json({ success: false, message: "Error al guardar la respuesta." });
  }
});

app.post("/api/survey/complete", async (request, response) => {
  const token = request.headers["x-survey-token"] || request.body.token;
  if (!token) return response.status(400).json({ success: false, message: "Token requerido." });

  try {
    const pRes = await db.execute({
      sql: "SELECT id, name FROM survey_participants WHERE session_token = ?",
      args: [token],
    });
    const participant = pRes.rows[0];
    if (!participant) return response.status(404).json({ success: false, message: "Participante no encontrado." });

    const ansRes = await db.execute({
      sql: "SELECT question_id, answer FROM survey_responses WHERE participant_id = ?",
      args: [participant.id],
    });

    const answersMap = {};
    for (const r of ansRes.rows) answersMap[r.question_id] = r.answer;

    let profile = {
      badge: "Viajero Inteligente SENAIR",
      icon: "✈️",
      description: "Buscas el equilibrio perfecto entre tecnología ágil, comodidad y tarifas justas para cada aventura.",
    };

    const dest = (answersMap["q2_destination"] || "").toLowerCase();
    const cabin = (answersMap["q6_cabin"] || "").toLowerCase();
    const factor = (answersMap["q3_factor"] || "").toLowerCase();

    if (dest.includes("cartagena") || dest.includes("andrés")) {
      profile = {
        badge: "Explorador del Caribe",
        icon: "🌴",
        description: "Tu pasión es el sol, la brisa marina y desconectarte junto al mar con la mejor gastronomía y playas.",
      };
    } else if (dest.includes("madrid") || dest.includes("barcelona") || dest.includes("europa")) {
      profile = {
        badge: "Viajero Transatlántico",
        icon: "🌍",
        description: "No le temes a las largas distancias: te apasiona cruzar fronteras, descubrir historia y sumergirte en nuevas culturas.",
      };
    } else if (dest.includes("medellín") || factor.includes("online") || factor.includes("reservar")) {
      profile = {
        badge: "Viajero Digital & Conectado",
        icon: "💡",
        description: "Valoras la velocidad, la autogestión y las herramientas interactivas como AeroBot para tener el control total de tu viaje.",
      };
    } else if (cabin.includes("primera") || cabin.includes("ejecutiva")) {
      profile = {
        badge: "Viajero Confort Premium",
        icon: "⭐",
        description: "Para ti volar es una experiencia de principio a fin; priorizas el espacio, la tranquilidad y el servicio exclusivo.",
      };
    }

    await db.execute({
      sql: "UPDATE survey_participants SET status = 'completed', traveler_profile = ? WHERE id = ?",
      args: [profile.badge, participant.id],
    });

    response.json({
      success: true,
      participantName: participant.name,
      profile,
    });
  } catch (error) {
    console.error("Error completando encuesta:", error);
    response.status(500).json({ success: false, message: "Error al finalizar la encuesta." });
  }
});

app.get("/api/survey/qr", async (request, response) => {
  try {
    let targetUrl = request.query.url;
    if (!targetUrl) {
      const host = request.get("host");
      const proto = request.protocol;
      targetUrl = `${proto}://${host}/html/encuesta.html`;
    }

    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 380,
      margin: 2,
      color: {
        dark: "#062b55",
        light: "#ffffff",
      },
    });

    response.json({ success: true, qrDataUrl, targetUrl });
  } catch (error) {
    console.error("Error generando QR:", error);
    response.status(500).json({ success: false, message: "No se pudo generar el código QR." });
  }
});

app.get("/api/admin/survey/stats", requireAdmin, async (request, response) => {
  try {
    const totalP = await db.execute({ sql: "SELECT COUNT(*) as count FROM survey_participants", args: [] });
    const compP = await db.execute({ sql: "SELECT COUNT(*) as count FROM survey_participants WHERE status = 'completed'", args: [] });
    const inProgP = await db.execute({ sql: "SELECT COUNT(*) as count FROM survey_participants WHERE status = 'in_progress'", args: [] });

    const total = Number(totalP.rows[0]?.count || 0);
    const completed = Number(compP.rows[0]?.count || 0);
    const inProgress = Number(inProgP.rows[0]?.count || 0);
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const ratingRes = await db.execute({
      sql: "SELECT AVG(CAST(answer AS REAL)) as avg_rating FROM survey_responses WHERE question_id = 'q4_web_rating'",
      args: [],
    });
    const avgRating = ratingRes.rows[0]?.avg_rating ? Number(ratingRes.rows[0].avg_rating).toFixed(1) : "5.0";

    const questionsRes = await db.execute({
      sql: `SELECT question_id, question_text, answer, COUNT(*) as count
            FROM survey_responses
            GROUP BY question_id, answer
            ORDER BY question_id, count DESC`,
      args: [],
    });

    const distributions = {};
    for (const r of questionsRes.rows) {
      if (!distributions[r.question_id]) {
        distributions[r.question_id] = {
          title: r.question_text,
          answers: [],
        };
      }
      distributions[r.question_id].answers.push({
        answer: r.answer,
        count: Number(r.count),
      });
    }

    const recentRes = await db.execute({
      sql: `SELECT id, name, email, city, age_range, status, traveler_profile, created_at
            FROM survey_participants
            ORDER BY created_at DESC
            LIMIT 50`,
      args: [],
    });

    response.json({
      success: true,
      stats: {
        total,
        completed,
        inProgress,
        completionRate,
        avgRating,
        distributions,
        recentParticipants: recentRes.rows,
      },
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas de encuesta:", error);
    response.status(500).json({ success: false, message: "Error al calcular estadísticas." });
  }
});

app.get("/api/admin/survey/export.csv", requireAdmin, async (request, response) => {
  try {
    const participants = await db.execute({
      sql: "SELECT id, name, email, age_range, city, status, traveler_profile, created_at FROM survey_participants ORDER BY id ASC",
      args: [],
    });

    const responses = await db.execute({
      sql: "SELECT participant_id, question_id, answer FROM survey_responses",
      args: [],
    });

    const answersMap = {};
    for (const r of responses.rows) {
      if (!answersMap[r.participant_id]) answersMap[r.participant_id] = {};
      answersMap[r.participant_id][r.question_id] = r.answer;
    }

    const headers = [
      "ID",
      "Fecha",
      "Nombre",
      "Correo",
      "Rango de Edad",
      "Ciudad",
      "Estado",
      "Perfil Asignado",
      "Q1_Frecuencia",
      "Q2_Destino",
      "Q3_Factores",
      "Q4_CalificacionWeb",
      "Q5_Innovacion",
      "Q6_Cabina",
      "Q7_Probabilidad",
      "Q8_Sugerencias",
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let csv = "\uFEFF" + headers.join(",") + "\n";
    for (const p of participants.rows) {
      const a = answersMap[p.id] || {};
      const row = [
        p.id,
        p.created_at,
        p.name,
        p.email || "",
        p.age_range || "",
        p.city || "",
        p.status,
        p.traveler_profile || "",
        a["q1_frequency"] || "",
        a["q2_destination"] || "",
        a["q3_factor"] || "",
        a["q4_web_rating"] || "",
        a["q5_innovation"] || "",
        a["q6_cabin"] || "",
        a["q7_probability"] || "",
        a["q8_feedback"] || "",
      ].map(escapeCsv).join(",");
      csv += row + "\n";
    }

    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", 'attachment; filename="senair_encuesta_feria_resultados.csv"');
    response.send(csv);
  } catch (error) {
    console.error("Error exportando CSV:", error);
    response.status(500).send("Error al exportar los datos.");
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
