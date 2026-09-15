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

async function renderReservations() {
  const authStorageKey = "senairAuthenticated";
  const isAuthenticated = window.sessionStorage.getItem(authStorageKey) === "true";
  const userEmail = window.sessionStorage.getItem("senairUserEmail") || "";

  // Si no ha iniciado sesión, NO mostrar vuelos pagados
  if (!isAuthenticated) {
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
      <div class="reservation-actions">
        <button class="remove-reservation-button" type="button">Quitar de Mis viajes</button>
      </div>
    `;

    const removeBtn = card.querySelector(".remove-reservation-button");
    removeBtn.addEventListener("click", async () => {
      removeBtn.disabled = true;
      removeBtn.textContent = "Quitando...";
      try {
        const delRes = await fetch(`/api/reservations/${encodeURIComponent(reservation.id)}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (delRes.ok) {
          if (userEmail) {
            const cached = JSON.parse(window.sessionStorage.getItem(`senairReservations_${userEmail}`) || "[]");
            const updated = cached.filter((r) => String(r.id) !== String(reservation.id));
            window.sessionStorage.setItem(`senairReservations_${userEmail}`, JSON.stringify(updated));
          }
          await renderReservations();
        } else {
          alert("No se pudo quitar el vuelo de Mis viajes. Inténtalo de nuevo.");
          removeBtn.disabled = false;
          removeBtn.textContent = "Quitar de Mis viajes";
        }
      } catch {
        alert("Error de conexión al intentar quitar el vuelo.");
        removeBtn.disabled = false;
        removeBtn.textContent = "Quitar de Mis viajes";
      }
    });

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
