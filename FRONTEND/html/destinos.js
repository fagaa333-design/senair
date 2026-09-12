const filterButtons = document.querySelectorAll(".filter-button");
const destinationCards = document.querySelectorAll(".destination-card");
const searchInput = document.getElementById("destinationSearch");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
let selectedFilter = "all";
const favoritesStorageKey = "senairFavoriteDestinations";

function getFavorites() {
  try {
    const favorites = JSON.parse(window.localStorage.getItem(favoritesStorageKey) || "[]");
    return Array.isArray(favorites) ? favorites : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  try {
    window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
  } catch {
    return false;
  }
  return true;
}

function destinationFromCard(card) {
  const image = card.querySelector(".destination-image");
  return {
    id: card.dataset.name,
    name: card.querySelector("h3").textContent.trim(),
    category: card.dataset.category,
    searchName: card.dataset.name,
    imageClass: [...image.classList].find((className) => className.startsWith("image-")),
    meta: [...card.querySelectorAll(".card-meta span")].map((item) => item.textContent.trim()),
    description: card.querySelector(".destination-content > p").textContent.trim(),
    price: card.querySelector(".card-footer strong").textContent.trim(),
  };
}

function updateFavoriteButton(button, isSaved) {
  button.setAttribute("aria-pressed", String(isSaved));
  button.textContent = isSaved ? "♥" : "♡";
  button.setAttribute("aria-label", `${isSaved ? "Quitar" : "Guardar"} ${button.closest(".destination-card").querySelector("h3").textContent.trim()} ${isSaved ? "de Mis viajes" : "en Mis viajes"}`);
}

function updateDestinations() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  destinationCards.forEach((card) => {
    const matchesFilter = selectedFilter === "all" || card.dataset.category === selectedFilter;
    const matchesSearch = !query || card.dataset.name.includes(query);
    const isVisible = matchesFilter && matchesSearch;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  resultCount.textContent = `${visibleCount} destino${visibleCount === 1 ? "" : "s"} disponible${visibleCount === 1 ? "" : "s"}`;
  emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    updateDestinations();
  });
});

searchInput.addEventListener("input", updateDestinations);

document.querySelectorAll(".save-button").forEach((button) => {
  const card = button.closest(".destination-card");
  const destination = destinationFromCard(card);
  const isSaved = getFavorites().some((favorite) => favorite.id === destination.id);
  updateFavoriteButton(button, isSaved);

  button.addEventListener("click", () => {
    const favorites = getFavorites();
    const saved = favorites.some((favorite) => favorite.id === destination.id);
    saveFavorites(saved ? favorites.filter((favorite) => favorite.id !== destination.id) : [...favorites, destination]);
    updateFavoriteButton(button, !saved);
  });
});

updateDestinations();
