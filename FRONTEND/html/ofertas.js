const filterButtons = document.querySelectorAll(".filter-button");
const offerCards = document.querySelectorAll(".offer-card");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

function filterOffers(category) {
  let visibleCount = 0;

  offerCards.forEach((card) => {
    const isVisible = category === "all" || card.dataset.category === category;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  resultCount.textContent = `${visibleCount} oferta${visibleCount === 1 ? "" : "s"} disponible${visibleCount === 1 ? "" : "s"}`;
  emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    filterOffers(button.dataset.filter);
  });
});

document.getElementById("offerNewsletter").addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("formMessage").textContent = "Listo. Te enviaremos las próximas rutas y ofertas.";
  event.currentTarget.reset();
});

filterOffers("all");
