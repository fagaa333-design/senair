const favoritesStorageKey = "senairFavoriteDestinations";
const tripsGrid = document.getElementById("tripsGrid");
const emptyState = document.getElementById("tripsEmpty");
const countLabel = document.getElementById("tripsCount");
const searchInput = document.getElementById("tripsSearch");
const reservationsGrid = document.getElementById("reservationsGrid");
const reservationsEmpty = document.getElementById("reservationsEmpty");
const reservationsCount = document.getElementById("reservationsCount");

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

function getReservations() {
  try {
    const reservations = JSON.parse(window.localStorage.getItem("senairReservations") || "[]");
    return Array.isArray(reservations) ? reservations : [];
  } catch {
    return [];
  }
}

async function renderReservations() {
  let reservations = getReservations();

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
    }
  } catch {
    // Network error or not authenticated — use localStorage data
  }

  reservationsCount.textContent = `${reservations.length} reserva${reservations.length === 1 ? "" : "s"}`;
  reservationsGrid.replaceChildren();
  reservationsEmpty.hidden = reservations.length > 0;
  reservations.forEach((reservation) => {
    const card = document.createElement("article");
    const seats = Array.isArray(reservation.seat) ? reservation.seat.join(", ") : reservation.seat;
    card.className = "reservation-card";
    card.innerHTML = `<div><span class="reservation-status">Confirmado</span><h3>${escapeHtml(reservation.origin)} <b>→</b> ${escapeHtml(reservation.destination)}</h3><p>${escapeHtml(reservation.departureDate)} · ${escapeHtml(reservation.departureTime)} - ${escapeHtml(reservation.arrivalTime)}</p></div><dl><div><dt>${Array.isArray(reservation.seat) ? "Asientos" : "Asiento"}</dt><dd>${escapeHtml(seats)}</dd></div><div><dt>Reserva</dt><dd>${escapeHtml(String(reservation.id).slice(-6).toUpperCase())}</dd></div></dl>`;
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
    card.innerHTML = `<div class="destination-image ${escapeHtml(favorite.imageClass)}"></div><div class="trip-content"><div class="trip-meta"><span>${escapeHtml(favorite.meta?.[0] || "Destino SENAIR")}</span><span>${escapeHtml(favorite.meta?.[1] || "Disponible")}</span></div><h3>${escapeHtml(favorite.name)}</h3><p>${escapeHtml(favorite.description)}</p><div class="trip-footer"><strong>${escapeHtml(favorite.price)}</strong><a href="index.html#vuelos">Buscar vuelo <span aria-hidden="true">→</span></a></div><button class="remove-trip" type="button">Quitar de Mis viajes</button></div>`;
    card.querySelector(".remove-trip").addEventListener("click", () => {
      window.localStorage.setItem(favoritesStorageKey, JSON.stringify(getFavorites().filter((item) => item.id !== favorite.id)));
      renderTrips();
    });
    tripsGrid.append(card);
  });
}

searchInput.addEventListener("input", renderTrips);
renderReservations();
renderTrips();
