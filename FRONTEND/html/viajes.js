const favoritesStorageKey = "senairFavoriteDestinations";
const tripsGrid = document.getElementById("tripsGrid");
const emptyState = document.getElementById("tripsEmpty");
const countLabel = document.getElementById("tripsCount");
const searchInput = document.getElementById("tripsSearch");
const reservationsGrid = document.getElementById("reservationsGrid");
const reservationsEmpty = document.getElementById("reservationsEmpty");
const reservationsCount = document.getElementById("reservationsCount");

// Eliminar cualquier residuo antiguo del localStorage global no autenticado
window.localStorage.removeItem("senairReservations");

function getFavorites() {
  try {
    const favorites = JSON.parse(window.localStorage.getItem(favoritesStorageKey) || "[]");
    return Array.isArray(favorites) ? favorites : [];
  } catch {
    return [];
  }
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

const ROUTE_DISTANCES_MILES = {
  // Rutas Nacionales
  "bogota-medellin": 150,
  "medellin-bogota": 150,
  "bogota-cali": 185,
  "cali-bogota": 185,
  "bogota-cartagena": 410,
  "cartagena-bogota": 410,
  "cali-cartagena": 520,
  "cartagena-cali": 520,
  "bogota-santa marta": 460,
  "santa marta-bogota": 460,
  "bogota-barranquilla": 440,
  "barranquilla-bogota": 440,
  "bogota-san andres": 750,
  "san andres-bogota": 750,
  "bogota-leticia": 680,
  "leticia-bogota": 680,
  "bogota-riohacha": 520,
  "riohacha-bogota": 520,
  "bogota-cucuta": 250,
  "cucuta-bogota": 250,
  "bogota-monteria": 310,
  "monteria-bogota": 310,
  "bogota-pereira": 115,
  "pereira-bogota": 115,
  "bogota-bucaramanga": 185,
  "bucaramanga-bogota": 185,
  "bogota-armenia": 120,
  "bogota-manizales": 105,
  "bogota-pasto": 320,
  "bogota-neiva": 140,
  "bogota-valledupar": 410,
  "bogota-ibague": 80,
  // Rutas Internacionales
  "bogota-ciudad de panama": 470,
  "ciudad de panama-bogota": 470,
  "bogota-cancun": 1410,
  "cancun-bogota": 1410,
  "medellin-cancun": 1390,
  "cancun-medellin": 1390,
  "bogota-miami": 1510,
  "miami-bogota": 1510,
  "bogota-orlando": 1690,
  "orlando-bogota": 1690,
  "bogota-nueva york": 2490,
  "nueva york-bogota": 2490,
  "bogota-los angeles": 3480,
  "bogota-toronto": 2720,
  "bogota-rio de janeiro": 2820,
  "rio de janeiro-bogota": 2820,
  "bogota-sao paulo": 2680,
  "bogota-buenos aires": 2900,
  "bogota-lima": 1170,
  "bogota-santiago": 2640,
  "bogota-quito": 440,
  "bogota-caracas": 640,
  "bogota-madrid": 5000,
  "madrid-bogota": 5000,
  "bogota-barcelona": 5120,
  "barcelona-bogota": 5120,
  "bogota-paris": 5360,
  "paris-bogota": 5360,
  "bogota-londres": 5280,
  "bogota-roma": 5840,
  "bogota-amsterdam": 5390,
  "bogota-tokio": 8940,
};

function normalizeCity(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\([a-z0-9]{3}\)/gi, "")
    .trim();
}

function calculateFlightMiles(origin, destination) {
  const normOrig = normalizeCity(origin);
  const normDest = normalizeCity(destination);
  const key = `${normOrig}-${normDest}`;
  if (ROUTE_DISTANCES_MILES[key]) return ROUTE_DISTANCES_MILES[key];

  const combined = `${normOrig} ${normDest}`;
  if (/madrid|paris|barcelona|londres|roma|amsterdam|tokio/.test(combined)) return 5100;
  if (/nueva york|miami|orlando|cancun|rio|sao paulo|buenos aires|los angeles|toronto/.test(combined)) return 2200;
  return 380;
}

function updateMilesDisplay(reservations = [], isAuthenticated = false) {
  const milesCountEl = document.getElementById("milesCount");
  const milesTierEl = document.getElementById("milesTier");
  const milesFlightsEl = document.getElementById("milesFlightsCount");
  const milesNextTargetEl = document.getElementById("milesNextTarget");
  const milesProgressBarEl = document.getElementById("milesProgressBar");
  const milesBenefitEl = document.getElementById("milesBenefit");

  if (!milesCountEl) return;

  // Si no está autenticado o no tiene vuelos confirmados, empieza estrictamente en 0 millas
  if (!isAuthenticated || !reservations || reservations.length === 0) {
    milesCountEl.textContent = "0";
    if (milesTierEl) milesTierEl.textContent = isAuthenticated ? "Clásico · Nuevo viajero" : "Sin registrar";
    if (milesFlightsEl) milesFlightsEl.textContent = "0 vuelos";
    if (milesNextTargetEl) milesNextTargetEl.textContent = "Realiza tu primer vuelo para empezar a acumular millas (Meta: 3.000 millas)";
    if (milesProgressBarEl) milesProgressBarEl.style.width = "0%";
    if (milesBenefitEl) milesBenefitEl.textContent = "Acumula millas en cada vuelo";
    return;
  }

  // Suma de distancias de vuelo reales en millas
  const totalMiles = reservations.reduce((sum, r) => sum + calculateFlightMiles(r.origin, r.destination), 0);

  const numberFormatter = new Intl.NumberFormat("es-CO");
  milesCountEl.textContent = numberFormatter.format(totalMiles);
  if (milesFlightsEl) {
    milesFlightsEl.textContent = `${reservations.length} vuelo${reservations.length === 1 ? "" : "s"}`;
  }

  if (totalMiles < 3000) {
    if (milesTierEl) milesTierEl.textContent = "Plata · Explorador";
    if (milesBenefitEl) milesBenefitEl.textContent = "Descuento en equipaje";
    const percent = Math.min(100, Math.max(5, Math.round((totalMiles / 3000) * 100)));
    if (milesProgressBarEl) milesProgressBarEl.style.width = `${percent}%`;
    if (milesNextTargetEl) {
      milesNextTargetEl.textContent = `Faltan ${numberFormatter.format(3000 - totalMiles)} millas para Nivel Oro`;
    }
  } else if (totalMiles < 8000) {
    if (milesTierEl) milesTierEl.textContent = "Oro · Frecuente";
    if (milesBenefitEl) milesBenefitEl.textContent = "Embarque prioritario";
    const percent = Math.min(100, Math.max(10, Math.round((totalMiles / 8000) * 100)));
    if (milesProgressBarEl) milesProgressBarEl.style.width = `${percent}%`;
    if (milesNextTargetEl) {
      milesNextTargetEl.textContent = `Faltan ${numberFormatter.format(8000 - totalMiles)} millas para Nivel Platino`;
    }
  } else {
    if (milesTierEl) milesTierEl.textContent = "Platino · Élite";
    if (milesBenefitEl) milesBenefitEl.textContent = "Acceso a sala VIP y upgrades";
    if (milesProgressBarEl) milesProgressBarEl.style.width = "100%";
    if (milesNextTargetEl) milesNextTargetEl.textContent = "¡Nivel máximo alcanzado!";
  }
}

async function renderReservations() {
  const authStorageKey = "senairAuthenticated";
  const isAuthenticated = window.sessionStorage.getItem(authStorageKey) === "true";
  const userEmail = window.sessionStorage.getItem("senairUserEmail") || "";

  // Si no ha iniciado sesión, NO mostrar vuelos pagados
  if (!isAuthenticated) {
    updateMilesDisplay([], false);
    reservationsCount.textContent = "0 reservas";
    reservationsGrid.replaceChildren();
    reservationsEmpty.innerHTML = 'Inicia sesión para consultar tus vuelos confirmados. <a href="login.html" class="reservations-login-link">Iniciar sesión</a>';
    reservationsEmpty.hidden = false;
    return;
  }

  let reservations = [];

  try {
    const response = await fetch("/api/reservations", { credentials: "include" });
    if (response.ok) {
      const data = await response.json();
      reservations = (data.reservations || []).map((r) => ({
        id: String(r.id),
        origin: r.origin,
        destination: r.destination,
        departureDate: r.departure_date,
        departureTime: r.departure_time,
        arrivalTime: r.arrival_time,
        seat: r.seat,
        price: r.price,
        airline: r.airline,
      }));
      if (userEmail) {
        window.sessionStorage.setItem(`senairReservations_${userEmail}`, JSON.stringify(reservations));
      }
    } else if (response.status === 401) {
      window.sessionStorage.removeItem(authStorageKey);
      reservationsCount.textContent = "0 reservas";
      reservationsGrid.replaceChildren();
      reservationsEmpty.innerHTML = 'Tu sesión ha expirado. <a href="login.html" class="reservations-login-link">Inicia sesión</a> para ver tus vuelos confirmados.';
      reservationsEmpty.hidden = false;
      return;
    } else {
      if (userEmail) {
        reservations = JSON.parse(window.sessionStorage.getItem(`senairReservations_${userEmail}`) || "[]");
      }
    }
  } catch {
    if (userEmail) {
      reservations = JSON.parse(window.sessionStorage.getItem(`senairReservations_${userEmail}`) || "[]");
    }
  }

  updateMilesDisplay(reservations, true);
  reservationsCount.textContent = `${reservations.length} reserva${reservations.length === 1 ? "" : "s"}`;
  reservationsGrid.replaceChildren();
  reservationsEmpty.textContent = "Aún no tienes vuelos confirmados.";
  reservationsEmpty.hidden = reservations.length > 0;

  reservations.forEach((reservation) => {
    const card = document.createElement("article");
    const seats = Array.isArray(reservation.seat) ? reservation.seat.join(", ") : reservation.seat;
    card.className = "reservation-card";
    card.dataset.id = reservation.id;
    card.innerHTML = `
      <div class="reservation-main">
        <div>
          <span class="reservation-status">Confirmado</span>
          <h3>${escapeHtml(reservation.origin)} <b>→</b> ${escapeHtml(reservation.destination)}</h3>
          <p>${escapeHtml(reservation.departureDate)} · ${escapeHtml(reservation.departureTime)} - ${escapeHtml(reservation.arrivalTime)}</p>
        </div>
        <dl>
          <div><dt>${Array.isArray(reservation.seat) ? "Asientos" : "Asiento"}</dt><dd>${escapeHtml(seats)}</dd></div>
          <div><dt>Reserva</dt><dd>${escapeHtml(String(reservation.id).slice(-6).toUpperCase())}</dd></div>
        </dl>
      </div>
    `;

    reservationsGrid.append(card);
  });
}

function renderTrips() {
  const query = searchInput.value.trim().toLowerCase();
  const favorites = getFavorites();
  const visibleFavorites = favorites.filter((favorite) => favorite.name.toLowerCase().includes(query) || favorite.searchName.includes(query));
  countLabel.textContent = `${favorites.length} destino${favorites.length === 1 ? "" : "s"} guardado${favorites.length === 1 ? "" : "s"}`;
  tripsGrid.replaceChildren();
  emptyState.hidden = visibleFavorites.length > 0;
  emptyState.querySelector("h2").textContent = favorites.length && !visibleFavorites.length ? "No encontramos ese destino." : "Tu próximo viaje empieza con un favorito.";
  emptyState.querySelector("p").textContent = favorites.length && !visibleFavorites.length ? "Prueba con otro nombre o limpia la búsqueda." : "Guarda destinos usando el corazón y aparecerán aquí.";

  visibleFavorites.forEach((favorite) => {
    const card = document.createElement("article");
    card.className = "trip-card";
    card.dataset.id = favorite.id;
    card.innerHTML = `<div class="destination-image ${escapeHtml(favorite.imageClass)}"></div><div class="trip-content"><div class="trip-meta"><span>${escapeHtml(favorite.meta?.[0] || "Destino SENAIR")}</span><span>${escapeHtml(favorite.meta?.[1] || "Disponible")}</span></div><h3>${escapeHtml(favorite.name)}</h3><p>${escapeHtml(favorite.description)}</p><div class="trip-footer"><strong>${escapeHtml(favorite.price)}</strong><a href="index.html#vuelos">Buscar vuelo <span aria-hidden="true">→</span></a></div></div>`;
    tripsGrid.append(card);
  });
}

searchInput.addEventListener("input", renderTrips);
renderReservations();
renderTrips();
