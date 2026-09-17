(() => {
const modal = document.getElementById("modal");

document.querySelectorAll('[data-modal="manage"]').forEach((button) => button.remove());

const authStorageKey = "senairAuthenticated";
window.localStorage.removeItem(authStorageKey);
const isAuthenticated = window.sessionStorage.getItem(authStorageKey) === "true";
const accountName = window.sessionStorage.getItem("senairUserName") || "Usuario";
const accountEmail = window.sessionStorage.getItem("senairUserEmail") || "";

const hamburgerBtn = document.querySelector(".hamburger");
const mobileNavEl = document.getElementById("mobileNav");

if (hamburgerBtn && mobileNavEl) {
    hamburgerBtn.addEventListener("click", () => {
        const isOpen = hamburgerBtn.classList.toggle("open");
        mobileNavEl.classList.toggle("open", isOpen);
        hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
        mobileNavEl.setAttribute("aria-hidden", String(!isOpen));
    });

    document.addEventListener("click", (event) => {
        if (!mobileNavEl.contains(event.target) && !hamburgerBtn.contains(event.target)) {
            hamburgerBtn.classList.remove("open");
            mobileNavEl.classList.remove("open");
            hamburgerBtn.setAttribute("aria-expanded", "false");
            mobileNavEl.setAttribute("aria-hidden", "true");
        }
    });
}

function goToHome() {
    window.location.href = "index.html";
}

document.querySelectorAll("[data-auth-required]").forEach((element) => {
    element.hidden = !isAuthenticated;
});

document.querySelectorAll(".login-link, .mobile-login-link").forEach((element) => {
    element.hidden = isAuthenticated;
});

document.querySelectorAll(".mobile-logout-link").forEach((element) => {
    element.hidden = !isAuthenticated;
});

document.querySelectorAll("[data-account-menu]").forEach((menu) => {
    menu.hidden = !isAuthenticated;
    menu.querySelectorAll(".account-trigger-name, .account-name").forEach((element) => {
        element.textContent = accountName;
    });
    menu.querySelectorAll(".account-email").forEach((element) => {
        element.textContent = accountEmail;
    });
    const initial = accountName.trim().charAt(0).toUpperCase() || "U";
    menu.querySelectorAll(".account-avatar").forEach((element) => {
        element.textContent = initial;
    });

    const trigger = menu.querySelector(".account-trigger");
    const dropdown = menu.querySelector(".account-dropdown");
    trigger.addEventListener("click", () => {
        const isOpen = dropdown.hidden;
        dropdown.hidden = !isOpen;
        trigger.setAttribute("aria-expanded", String(isOpen));
    });
});

document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
        fetch("/logout", { method: "POST", credentials: "include" }).catch(() => {});
        window.sessionStorage.removeItem(authStorageKey);
        window.sessionStorage.removeItem("senairUserName");
        window.sessionStorage.removeItem("senairUserEmail");
        goToHome();
    });
});

document.addEventListener("click", (event) => {
    document.querySelectorAll("[data-account-menu]").forEach((menu) => {
        if (!menu.contains(event.target)) {
            const dropdown = menu.querySelector(".account-dropdown");
            const trigger = menu.querySelector(".account-trigger");
            dropdown.hidden = true;
            trigger.setAttribute("aria-expanded", "false");
        }
    });
});

const loginForm = document.querySelector('form[action="/login"]');
const registerForm = document.querySelector('form[action="/register"]');

async function submitAuthForm(form, isRegistration) {
    try {
        const endpoint = window.location.protocol === "file:"
            ? `http://localhost:3000/${isRegistration ? "register" : "login"}`
            : form.action;
        const formData = new FormData(form);
        const response = await fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(Object.fromEntries(formData.entries())),
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            credentials: "include",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            window.alert(result.message || "No se pudo completar la operación.");
            return;
        }

        const name = isRegistration ? formData.get("name") : (result.name || formData.get("email"));
        window.sessionStorage.setItem(authStorageKey, "true");
        window.sessionStorage.setItem("senairUserName", String(name || "Usuario"));
        window.sessionStorage.setItem("senairUserEmail", String(formData.get("email") || ""));
        window.location.href = new URL("../index.html", window.location.href).href;
    } catch {
        window.alert("No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.");
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        submitAuthForm(loginForm, false);
    });
}

if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        submitAuthForm(registerForm, true);
    });
}

document.querySelectorAll('input[type="password"]').forEach((passwordInput) => {
    const wrapper = document.createElement("div");
    const toggleBtn = document.createElement("button");
    const inputId = passwordInput.id || `password-${Math.random().toString(16).slice(2)}`;

    wrapper.className = "password-input-wrapper";
    toggleBtn.type = "button";
    toggleBtn.className = "password-toggle";
    toggleBtn.setAttribute("aria-label", "Mostrar contraseña");
    toggleBtn.textContent = "Mostrar";
    passwordInput.setAttribute("id", inputId);
    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.append(passwordInput, toggleBtn);

    passwordInput.addEventListener("input", () => {
        toggleBtn.textContent = passwordInput.value ? (passwordInput.type === "password" ? "Mostrar" : "Ocultar") : "Mostrar";
    });

    toggleBtn.addEventListener("click", () => {
        const isHidden = passwordInput.type === "password";
        passwordInput.type = isHidden ? "text" : "password";
        toggleBtn.textContent = isHidden ? "Ocultar" : "Mostrar";
        toggleBtn.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
        passwordInput.focus();
    });
});

const recoveryModal = document.getElementById("passwordRecovery");
const recoveryForm = document.getElementById("recoveryForm");
const recoveryEmail = document.getElementById("recoveryEmail");
const recoveryMessage = document.getElementById("recoveryMessage");

function closeRecoveryModal() {
    if (!recoveryModal) return;
    recoveryModal.classList.remove("is-open");
    recoveryModal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-recovery-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
        event.preventDefault();
        recoveryModal.classList.add("is-open");
        recoveryModal.setAttribute("aria-hidden", "false");
        recoveryEmail.focus();
    });
});

document.querySelector("[data-recovery-close]")?.addEventListener("click", closeRecoveryModal);
recoveryModal?.addEventListener("click", (event) => {
    if (event.target === recoveryModal) closeRecoveryModal();
});

recoveryForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    recoveryMessage.textContent = `Solicitud recibida para ${recoveryEmail.value.trim()}. Revisa tu correo para continuar.`;
    recoveryForm.reset();
});

const loadingScreen = document.getElementById("loadingScreen");
const loadingVideo = document.getElementById("loadingVideo");
let loadingClosed = false;

function closeLoadingScreen() {
    if (loadingClosed || !loadingScreen) return;
    loadingClosed = true;
    loadingScreen.classList.add("is-hidden");
    window.setTimeout(() => loadingScreen.remove(), 500);
}

if (loadingScreen && loadingVideo) {
    loadingVideo.addEventListener("ended", closeLoadingScreen, { once: true });
    loadingVideo.addEventListener("error", closeLoadingScreen, { once: true });
    window.setTimeout(closeLoadingScreen, 8000);
}

const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalInput = document.getElementById("modalInput");
const modalField = document.getElementById("modalField");
const modalAction = document.getElementById("modalAction");
const closeModalButton = document.getElementById("closeModal");

function openModal({ title, text, placeholder = "", showInput = true }) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    modalInput.placeholder = placeholder;
    modalInput.value = "";
    modalField.hidden = !showInput;
    modalAction.hidden = !showInput;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    if (showInput) {
        modalInput.focus();
    } else {
        closeModalButton.focus();
    }
}

function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
}

if (modal) {
    document.querySelectorAll("[data-modal]").forEach((button) => {
        button.addEventListener("click", () => {
            const modalType = button.dataset.modal;
            const modalContent = {
                manage: {
                    title: "Gestiona tu reserva",
                    text: "Consulta tu itinerario, añade servicios o realiza cambios.",
                    placeholder: "Ejemplo: AB12CD",
                },
                offer: {
                    title: "Oferta seleccionada",
                    text: "Déjanos tu correo y te enviaremos los detalles de esta oferta.",
                    placeholder: "Tu correo electrónico",
                },
            };

            if (modalContent[modalType]) openModal(modalContent[modalType]);
        });
    });

    closeModalButton.addEventListener("click", closeModal);
    modalAction.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });
}

document.addEventListener("keydown", (event) => {
    if (modal && event.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
    }

    if (event.key === "Escape" && passengerField.classList.contains("is-open")) {
        passengerField.classList.remove("is-open");
        passengerTrigger.setAttribute("aria-expanded", "false");
        passengerOverlay.setAttribute("aria-hidden", "true");
    }

    if (event.key === "Escape" && calendarOverlay.classList.contains("is-open")) {
        closeCalendar();
    }
});

if (document.getElementById("flightForm") && typeof Choices !== "undefined") {
const availableDestinations = [
    ["Bogotá", "BOG"], ["Medellín", "MDE"], ["Cali", "CLO"],
    ["Cartagena", "CTG"], ["Barranquilla", "BAQ"], ["Santa Marta", "SMR"],
    ["San Andrés", "ADZ"], ["Pereira", "PEI"], ["Bucaramanga", "BGA"],
    ["Armenia", "AXM"], ["Manizales", "MZL"], ["Villavicencio", "VVC"],
    ["París", "CDG"], ["Tokio", "NRT"], ["Barcelona", "BCN"],
    ["Madrid", "MAD"], ["Londres", "LHR"], ["Roma", "FCO"],
    ["Miami", "MIA"], ["Lima", "LIM"], ["Buenos Aires", "EZE"],
    ["Quito", "UIO"], ["Santiago", "SCL"], ["Nueva York", "JFK"],
    ["Caracas", "CCS"],
].map(([city, code]) => ({ value: `${city} (${code})`, label: `${city} (${code})` }));

const airportChoices = ["origin", "destination"].map((fieldId) => new Choices(`#${fieldId}`, {
    choices: availableDestinations,
    searchEnabled: true,
    searchPlaceholderValue: "¿A dónde quieres viajar?",
    noResultsText: "No encontramos ese aeropuerto",
    itemSelectText: "Seleccionar",
    shouldSort: false,
    allowHTML: false,
}));

document.getElementById("flightForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const origin = document.getElementById("origin").value.trim();
    const destination = document.getElementById("destination").value.trim();
    const departure = document.getElementById("departure").value;
    const returnDate = document.getElementById("return").value;
    const passengers = String(document.getElementById("passengers").value.match(/\d+/)?.[0] || "1");
    const tripType = document.querySelector(".search-tab.active")?.dataset.trip || "roundtrip";
    const query = new URLSearchParams({ origin, destination, departure, passengers, trip: tripType });
    if (returnDate) query.set("return", returnDate);
    window.location.href = `vuelos.html?${query.toString()}`;
});

const passengerField = document.querySelector(".passengers-field");
const passengerTrigger = document.getElementById("passengersTrigger");
const passengerMenu = document.getElementById("passengerMenu");
const passengerOverlay = document.getElementById("passengerOverlay");
const passengerSummary = document.getElementById("passengerSummary");
const passengerInput = document.getElementById("passengers");

const calendarOverlay = document.getElementById("calendarOverlay");
const calendarDays = document.getElementById("calendarDays");
const calendarMonth = document.getElementById("calendarMonth");
const calendarTitle = document.getElementById("calendarTitle");
const calendarPrevious = document.getElementById("calendarPrevious");
const calendarNext = document.getElementById("calendarNext");
const calendarTriggers = document.querySelectorAll(".date-trigger");
const calendarInputs = {
    departure: document.getElementById("departure"),
    return: document.getElementById("return"),
};
const calendarFormatter = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" });
const today = new Date();
today.setHours(0, 0, 0, 0);
let activeDateType = "departure";
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);

function dateToValue(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function valueToDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function minimumDate(type) {
    if (type === "return" && calendarInputs.departure.value) return valueToDate(calendarInputs.departure.value);
    return today;
}

function renderCalendar() {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const selectedValue = calendarInputs[activeDateType].value;
    const minimumValue = dateToValue(minimumDate(activeDateType));

    calendarMonth.textContent = monthFormatter.format(visibleMonth);
    calendarDays.replaceChildren();
    for (let index = 0; index < firstWeekday; index += 1) {
        const emptyDay = document.createElement("span");
        emptyDay.className = "calendar-day is-empty";
        calendarDays.append(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
        const value = dateToValue(date);
        const dayButton = document.createElement("button");
        dayButton.className = "calendar-day";
        dayButton.type = "button";
        dayButton.textContent = day;
        dayButton.dataset.value = value;
        dayButton.disabled = value < minimumValue;
        dayButton.classList.toggle("is-selected", value === selectedValue);
        dayButton.classList.toggle("is-today", value === dateToValue(today));
        calendarDays.append(dayButton);
    }

    calendarPrevious.disabled = visibleMonth <= new Date(minimumDate(activeDateType).getFullYear(), minimumDate(activeDateType).getMonth(), 1);
}

function updateDateTrigger(type) {
    const input = calendarInputs[type];
    const trigger = document.getElementById(`${type}Trigger`);
    const label = trigger.querySelector("span");
    label.textContent = input.value ? calendarFormatter.format(valueToDate(input.value)) : "Selecciona una fecha";
    trigger.classList.toggle("has-value", Boolean(input.value));
}

function closeCalendar() {
    calendarOverlay.classList.remove("is-open");
    calendarOverlay.setAttribute("aria-hidden", "true");
    calendarTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
}

calendarTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        activeDateType = trigger.id.replace("Trigger", "");
        const selectedDate = calendarInputs[activeDateType].value;
        visibleMonth = selectedDate ? valueToDate(selectedDate) : new Date(minimumDate(activeDateType).getFullYear(), minimumDate(activeDateType).getMonth(), 1);
        renderCalendar();
        calendarTitle.textContent = activeDateType === "departure" ? "Salida" : "Regreso";
        calendarOverlay.classList.add("is-open");
        calendarOverlay.setAttribute("aria-hidden", "false");
        trigger.setAttribute("aria-expanded", "true");
    });
});

calendarDays.addEventListener("click", (event) => {
    const dayButton = event.target.closest(".calendar-day:not(:disabled)");
    if (!dayButton || dayButton.classList.contains("is-empty")) return;
    calendarInputs[activeDateType].value = dayButton.dataset.value;
    calendarInputs[activeDateType].dispatchEvent(new Event("change", { bubbles: true }));
    updateDateTrigger(activeDateType);
    if (activeDateType === "departure" && calendarInputs.return.value < calendarInputs.departure.value) {
        calendarInputs.return.value = "";
        updateDateTrigger("return");
    }
    closeCalendar();
});

calendarPrevious.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
});

calendarNext.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
});

document.getElementById("calendarClose").addEventListener("click", closeCalendar);
calendarOverlay.addEventListener("click", (event) => {
    if (event.target === calendarOverlay) closeCalendar();
});

calendarInputs.departure.min = dateToValue(today);
calendarInputs.return.min = dateToValue(today);
Object.keys(calendarInputs).forEach(updateDateTrigger);

function updatePassengerSummary() {
    const rows = [...passengerMenu.querySelectorAll(".passenger-row")];
    const total = rows.reduce((sum, row) => sum + Number(row.querySelector("output").textContent), 0);
    passengerSummary.textContent = `${total} pasajero${total === 1 ? "" : "s"}`;
    passengerInput.value = `${total} pasajero${total === 1 ? "" : "s"}`;

    rows.forEach((row) => {
        const output = row.querySelector("output");
        row.querySelector('[data-action="decrease"]').disabled = Number(output.textContent) <= Number(row.dataset.min);
    });
}

passengerTrigger.addEventListener("click", () => {
    const isOpen = passengerField.classList.toggle("is-open");
    passengerTrigger.setAttribute("aria-expanded", String(isOpen));
    passengerOverlay.setAttribute("aria-hidden", String(!isOpen));
});

passengerMenu.addEventListener("click", (event) => {
    const counterButton = event.target.closest(".counter-button");
    if (!counterButton) return;

    const row = counterButton.closest(".passenger-row");
    const output = row.querySelector("output");
    const change = counterButton.dataset.action === "increase" ? 1 : -1;
    const minimum = Number(row.dataset.min);
    output.textContent = Math.max(minimum, Number(output.textContent) + change);
    updatePassengerSummary();
});

document.getElementById("passengerConfirm").addEventListener("click", () => {
    passengerField.classList.add("has-confirmed");
    passengerField.classList.remove("is-open");
    passengerTrigger.setAttribute("aria-expanded", "false");
    passengerOverlay.setAttribute("aria-hidden", "true");
});

passengerOverlay.addEventListener("click", (event) => {
    if (event.target !== passengerOverlay) return;
    passengerField.classList.remove("is-open");
    passengerTrigger.setAttribute("aria-expanded", "false");
    passengerOverlay.setAttribute("aria-hidden", "true");
});

document.addEventListener("click", (event) => {
    if (!passengerField.contains(event.target)) {
        passengerField.classList.remove("is-open");
        passengerTrigger.setAttribute("aria-expanded", "false");
        passengerOverlay.setAttribute("aria-hidden", "true");
    }
});

updatePassengerSummary();

document.getElementById("newsletterForm").addEventListener("submit", (event) => {
    event.preventDefault();
    
    openModal({
        title: "Suscripción completada",
        text: "Gracias. Recibirás nuestras próximas ofertas y novedades.",
        showInput: false,
    });
    
    event.currentTarget.reset();
});

document.querySelectorAll(".search-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".search-tab").forEach((item) => {
            item.classList.remove("active");
            item.setAttribute("aria-selected", "false");
        });
        
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        const isOneWay = tab.dataset.trip === "oneway";
        const searchPanel = document.getElementById("flightSearch");
        const returnInput = document.getElementById("return");

        searchPanel.classList.toggle("one-way", isOneWay);
        returnInput.required = !isOneWay;
        returnInput.disabled = isOneWay;
    });
});

document.getElementById("swapRoute").addEventListener("click", () => {
    const origin = document.getElementById("origin");
    const destination = document.getElementById("destination");
    const currentOrigin = origin.value;
    const currentDestination = destination.value;

    airportChoices[0].removeActiveItems();
    airportChoices[1].removeActiveItems();
    if (currentDestination) airportChoices[0].setChoiceByValue(currentDestination);
    if (currentOrigin) airportChoices[1].setChoiceByValue(currentOrigin);
    origin.focus();
});
}

const currentYear = document.getElementById("currentYear");
if (currentYear) currentYear.textContent = new Date().getFullYear();

// Handle login / register forms (flip-card)
document.querySelectorAll('.flip-card__form').forEach((form) => {
    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const action = form.getAttribute('action') || '/login';
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(action, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });

            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                openModal({ title: 'Éxito', text: data.message || 'Operación completada', showInput: false });
                if (data.redirect) setTimeout(() => { window.location.href = data.redirect; }, 900);
            } else {
                openModal({ title: 'Error', text: data.message || 'Ocurrió un error', showInput: false });
            }
        } catch (err) {
            openModal({ title: 'Error', text: 'No se pudo conectar con el servidor', showInput: false });
        }
    });
});

// Cargar sistema de idioma (i18n)
if (!document.querySelector('script[src*="i18n.js"]')) {
    const i18nScript = document.createElement('script');
    i18nScript.src = window.location.pathname.includes('/html/') ? '../js/i18n.js' : 'FRONTEND/js/i18n.js';
    i18nScript.defer = true;
    document.head.appendChild(i18nScript);
}

// Cargar asistente de IA (AeroBot)
if (!document.querySelector('script[src*="ai-chatbot.js"]')) {
    const aiScript = document.createElement('script');
    aiScript.src = window.location.pathname.includes('/html/') ? '../js/ai-chatbot.js' : 'FRONTEND/js/ai-chatbot.js';
    aiScript.defer = true;
    document.head.appendChild(aiScript);
}

})();

