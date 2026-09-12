const params = new URLSearchParams(window.location.search);
const apiBase = window.location.port === "3000" ? "" : "http://localhost:3000";
const origin = params.get("origin") || "";
const destination = params.get("destination") || "";
const departure = params.get("departure") || "";
const resultsContainer = document.getElementById("flightResults");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");
const resultsTitle = document.getElementById("resultsTitle");
const sortButtons = document.querySelectorAll(".sort-button");
const sortStatus = document.querySelector(".filter-note p");
let flights = [];

const moneyFormatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });

function formatDate(value) {
	if (!value) return "Fecha por confirmar";
	return dateFormatter.format(new Date(`${value}T12:00:00`));
}

function formatStops(stops) {
	return Number(stops) === 0 ? "Vuelo directo" : `${stops} escala${Number(stops) === 1 ? "" : "s"}`;
}

function renderFlights() {
	const sortMode = document.querySelector(".sort-button.active")?.dataset.sort || "time";
	if (sortStatus) sortStatus.textContent = sortMode === "price" ? "Mostrando la opción más barata. Los valores incluyen impuestos." : "Los precios mostrados son por pasajero e incluyen impuestos.";
	const sortedFlights = [...flights].sort((first, second) => sortMode === "price" ? first.price - second.price : first.departure_time.localeCompare(second.departure_time));
	const visibleFlights = sortMode === "price" ? sortedFlights.slice(0, 1) : sortedFlights;
	resultCount.textContent = sortMode === "price" ? `1 vuelo visible de ${flights.length}` : `${flights.length} vuelo${flights.length === 1 ? "" : "s"} disponible${flights.length === 1 ? "" : "s"}`;
	resultsContainer.replaceChildren();

	visibleFlights.forEach((flight, index) => {
		const card = document.createElement("article");
		card.className = "flight-card";
		card.innerHTML = `<div class="airline-mark"><strong>${flight.airline}</strong><span>${index === 0 ? "Recomendado" : "SENAIR"}</span></div><div class="flight-times"><div><strong>${flight.departure_time}</strong><span>${flight.origin}</span></div><div class="flight-line"><span>${formatStops(flight.stops)}</span><i></i><span>${flight.arrival_time}</span></div><div class="arrival"><strong>${flight.arrival_time}</strong><span>${flight.destination}</span></div></div><div class="flight-price"><strong>${moneyFormatter.format(flight.price)}</strong><span>por pasajero</span><button type="button" class="choose-flight">Seleccionar</button></div>`;
		resultsContainer.append(card);
	});
}

function renderSummary() {
	document.querySelector(".summary-route").textContent = origin && destination ? `${origin} → ${destination}` : "Todos los vuelos disponibles";
	document.querySelector(".summary-date").textContent = departure ? formatDate(departure) : "Todas las fechas";
	resultsTitle.textContent = origin && destination ? `Vuelos de ${origin} a ${destination}` : "Vuelos disponibles";
}

async function loadFlights() {
	renderSummary();
	const query = new URLSearchParams({ origin, destination, date: departure });
	try {
		const response = await fetch(`${apiBase}/api/flights?${query.toString()}`);
		if (!response.ok) throw new Error("No se pudo consultar la API");
		const data = await response.json();
		flights = data.flights || [];
		loadingState?.remove();
		resultCount.textContent = `${flights.length} vuelo${flights.length === 1 ? "" : "s"} disponible${flights.length === 1 ? "" : "s"}${data.created ? " · Ruta creada" : ""}`;
		emptyState.hidden = flights.length !== 0;
		if (flights.length) renderFlights();
	} catch {
		loadingState.innerHTML = "<strong>No pudimos cargar los vuelos.</strong><span>Revisa que el servidor de SENAIR esté activo e inténtalo de nuevo.</span>";
		resultCount.textContent = "Consulta no disponible";
		emptyState.hidden = true;
	}
}

sortButtons.forEach((button) => button.addEventListener("click", () => {
	sortButtons.forEach((item) => item.classList.toggle("active", item === button));
	if (flights.length) renderFlights();
}));

loadFlights();
