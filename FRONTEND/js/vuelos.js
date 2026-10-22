
const AIRLINE_INFO = {
  "Avianca": {
    name: "Avianca",
    code: "AV",
    color: "#d81e05",
    badge: "Vuelo directo",
    img: `<img src="../assets/images/avianca.jpg" alt="Avianca" class="airline-logo-img"/>`
  },
  "LATAM": {
    name: "LATAM Airlines",
    code: "LA",
    color: "#1b0088",
    badge: "Alianza Sky",
    img: `<img src="../assets/images/latam.png" alt="LATAM Airlines" class="airline-logo-img"/>`
  },
  "SENAIR": {
    name: "SENAIR",
    code: "SE",
    color: "#0866c6",
    badge: "Operado por SENAIR",
    img: `<img src="logo.png" alt="SENAIR" class="airline-logo-img" onerror="this.onerror=null;this.src='../assets/images/logo.png'"/>`
  },
  "Copa Airlines": {
    name: "Copa Airlines",
    code: "CM",
    color: "#003882",
    badge: "Star Alliance",
    img: `<img src="../assets/images/copa.jpg" alt="Copa Airlines" class="airline-logo-img"/>`
  },
  "Iberia": {
    name: "Iberia",
    code: "IB",
    color: "#d71921",
    badge: "Vuelo transatlántico",
    svg: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" class="airline-logo-svg"><rect width="32" height="32" rx="8" fill="#d71921"/><path d="M9 22c5-1 10-6 14-14-1 4-1 8 0 11-4 1-9 3-14 3z" fill="#fbbf24"/><path d="M12 21c4-1 8-5 11-10-1 3-1 6 0 8-3 1-7 2-11 2z" fill="#ffffff"/></svg>`
  },
  "Air France": {
    name: "Air France",
    code: "AF",
    color: "#002157",
    badge: "SkyTeam Alliance",
    svg: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" class="airline-logo-svg"><rect width="32" height="32" rx="8" fill="#002157"/><path d="M8 21l9-10h7l-12 11H8z" fill="#ed1c24"/><path d="M11 19l6-7h4l-8 8h-2z" fill="#ffffff"/></svg>`
  },
  "American Airlines": {
    name: "American Airlines",
    code: "AA",
    color: "#0c2340",
    badge: "Oneworld Alliance",
    svg: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" class="airline-logo-svg"><rect width="32" height="32" rx="8" fill="#0c2340"/><path d="M9 16c3-1 6-4 9-7 0 3 1 5 3 6-4 1-8 2-12 1z" fill="#0078d2"/><path d="M14 16c3-1 5-4 8-7 0 3 1 5 2 6-3 1-6 2-10 1z" fill="#d50032"/></svg>`
  }
};

function getAirlineDetails(airlineName, index = 0) {
  const norm = String(airlineName || "SENAIR").trim();
  let found = AIRLINE_INFO[norm];
  if (!found) {
    const key = Object.keys(AIRLINE_INFO).find(k => norm.toLowerCase().includes(k.toLowerCase()));
    found = key ? AIRLINE_INFO[key] : AIRLINE_INFO["SENAIR"];
  }
  return {
    ...found,
    displayName: norm || found.name,
    tag: index === 0 ? "⭐ Recomendado" : found.badge
  };
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);
}

const params = new URLSearchParams(window.location.search);
const origin = params.get("origin") || "";
const destination = params.get("destination") || "";
const departure = params.get("departure") || "";
const passengers = Math.max(1, Number(params.get("passengers") || 1));
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
		const airline = getAirlineDetails(flight.airline, index);
		const card = document.createElement("article");
		card.className = "flight-card";
		card.innerHTML = `
			<div class="airline-mark">
				<div class="airline-logo-wrap">
					${airline.img || airline.svg}
					<div>
						<strong class="airline-name">${escapeHtml(flight.airline || "SENAIR")}</strong>
						<span class="airline-flight-num">${escapeHtml(airline.code)}-${100 + Number(flight.id || (index * 7 + 1))}</span>
					</div>
				</div>
				<span class="airline-tag ${index === 0 ? "tag-recommended" : ""}">${escapeHtml(airline.tag)}</span>
			</div>
			<div class="flight-times">
				<div>
					<strong>${escapeHtml(flight.departure_time)}</strong>
					<span>${escapeHtml(flight.origin)}</span>
				</div>
				<div class="flight-line">
					<span>${escapeHtml(formatStops(flight.stops))}</span>
					<i></i>
					<span>${escapeHtml(flight.arrival_time)}</span>
				</div>
				<div class="arrival">
					<strong>${escapeHtml(flight.arrival_time)}</strong>
					<span>${escapeHtml(flight.destination)}</span>
				</div>
			</div>
			<div class="flight-price">
				<div class="flight-price-wrap">
					<strong>${moneyFormatter.format(flight.price)}</strong>
					<span>${window.SenairI18n && window.SenairI18n.getLanguage() === "en" ? "per passenger" : "por pasajero"}</span>
				</div>
				<button type="button" class="choose-flight">${window.SenairI18n && window.SenairI18n.getLanguage() === "en" ? "Select" : "Seleccionar"}</button>
			</div>
		`;
		resultsContainer.append(card);
	});

let authModalTimer = null;
let authModalInterval = null;

function showAuthRequiredModal(redirectUrl = "login.html?redirect=checkout.html&msg=auth_required") {
	const existing = document.getElementById("senairAuthModal");
	if (existing) existing.remove();
	if (authModalTimer) clearTimeout(authModalTimer);
	if (authModalInterval) clearInterval(authModalInterval);

	const overlay = document.createElement("div");
	overlay.className = "senair-auth-modal-overlay";
	overlay.id = "senairAuthModal";
	overlay.setAttribute("role", "dialog");
	overlay.setAttribute("aria-modal", "true");
	overlay.setAttribute("aria-labelledby", "senairAuthModalTitle");

	overlay.innerHTML = `
		<div class="senair-auth-modal-card">
			<button type="button" class="senair-auth-modal-close" id="senairAuthModalClose" aria-label="Cerrar modal">&times;</button>
			<div class="senair-auth-modal-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
					<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
				</svg>
			</div>
			<span class="senair-auth-modal-kicker">Acceso Requerido</span>
			<h3 id="senairAuthModalTitle">Inicia sesión para continuar</h3>
			<p>Para reservar tu vuelo en SENAIR debes iniciar sesión o registrarte con tu cuenta de cliente o administrador.</p>
			<div class="senair-auth-modal-actions">
				<a href="${redirectUrl}" class="senair-auth-modal-btn primary" id="senairAuthModalGoLogin">Iniciar sesión ahora</a>
				<button type="button" class="senair-auth-modal-btn secondary" id="senairAuthModalStay">Cerrar</button>
			</div>
			<div class="senair-auth-modal-timer">
				<span>Redirigiendo a inicio de sesión en <strong id="senairAuthCountdown">4</strong>s...</span>
				<div class="senair-auth-modal-progress">
					<div class="senair-auth-modal-bar"></div>
				</div>
			</div>
		</div>
	`;

	document.body.appendChild(overlay);
	document.body.style.overflow = "hidden";

	let remainingSeconds = 4;
	const countdownEl = overlay.querySelector("#senairAuthCountdown");

	const closeModal = () => {
		if (authModalTimer) clearTimeout(authModalTimer);
		if (authModalInterval) clearInterval(authModalInterval);
		overlay.classList.add("is-closing");
		document.body.style.overflow = "";
		setTimeout(() => {
			overlay.remove();
		}, 200);
	};

	overlay.querySelector("#senairAuthModalClose").addEventListener("click", closeModal);
	overlay.querySelector("#senairAuthModalStay").addEventListener("click", closeModal);

	overlay.addEventListener("click", (e) => {
		if (e.target === overlay) closeModal();
	});

	const onKeyDown = (e) => {
		if (e.key === "Escape") {
			document.removeEventListener("keydown", onKeyDown);
			closeModal();
		}
	};
	document.addEventListener("keydown", onKeyDown);

	authModalInterval = setInterval(() => {
		remainingSeconds -= 1;
		if (countdownEl && remainingSeconds >= 0) {
			countdownEl.textContent = remainingSeconds;
		}
	}, 1000);

	authModalTimer = setTimeout(() => {
		window.location.href = redirectUrl;
	}, 4000);
}

	resultsContainer.querySelectorAll(".choose-flight").forEach((button, index) => {
		button.addEventListener("click", () => {
			const authStorageKey = "senairAuthenticated";
			const isAuthenticated = window.sessionStorage.getItem(authStorageKey) === "true";
			window.sessionStorage.setItem("senairSelectedFlight", JSON.stringify({ ...visibleFlights[index], passengers }));
			if (!isAuthenticated) {
				showAuthRequiredModal("login.html?redirect=checkout.html&msg=auth_required");
				return;
			}
			window.location.href = "checkout.html";
		});
	});
}

function renderSummary() {
	document.querySelector(".summary-route").textContent = origin && destination ? `${origin} → ${destination}` : (destination ? `Vuelos hacia ${destination}` : (origin ? `Vuelos desde ${origin}` : "Todos los vuelos disponibles"));
	document.querySelector(".summary-date").textContent = departure ? formatDate(departure) : "Todas las fechas";
	resultsTitle.textContent = origin && destination ? `Vuelos de ${origin} a ${destination}` : (destination ? `Vuelos hacia ${destination}` : "Vuelos disponibles");
}

async function loadFlights() {
	renderSummary();
	const query = new URLSearchParams({ origin, destination, date: departure });
	try {
		const response = await fetch(`/api/flights?${query.toString()}`);
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


window.addEventListener("senair:langchange", () => {
	if (typeof renderFlights === "function" && Array.isArray(flights) && flights.length) {
		renderFlights();
	}
});
