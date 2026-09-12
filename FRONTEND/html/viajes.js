const favoritesStorageKey = "senairFavoriteDestinations";
const tripsGrid = document.getElementById("tripsGrid");
const emptyState = document.getElementById("tripsEmpty");
const countLabel = document.getElementById("tripsCount");
const searchInput = document.getElementById("tripsSearch");

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
renderTrips();
