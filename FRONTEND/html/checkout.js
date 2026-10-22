const selectedFlight = JSON.parse(window.sessionStorage.getItem("senairSelectedFlight") || "null");
const seatMap = document.getElementById("seatMap");
const openModalBtns = document.querySelectorAll(".open-modal-btn");
const paymentOverlay = document.getElementById("paymentOverlay");
const closeModalBtn = document.getElementById("closeModalBtn");
const paymentForm = document.getElementById("paymentForm");
const purchaseBtn = document.getElementById("purchaseBtn");
const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const passengerCount = Math.max(1, Number(selectedFlight?.passengers || 1));
const selectedSeats = [];
const passengerDataStore = {};
const passengersCardsContainer = document.getElementById("passengersCardsContainer") || document.getElementById("passengersForm");
const passengersEmptyHint = document.getElementById("passengersEmptyHint");
const passengerActionRow = document.getElementById("passengerActionRow");
const proceedToPaymentBtn = document.getElementById("proceedToPaymentBtn");
const passengerStep = document.getElementById("passengerStep");
const summaryPassengersPreview = document.getElementById("summaryPassengersPreview");
const summaryPassengersList = document.getElementById("summaryPassengersList");
const openModalBtnSeat = document.getElementById("openModalBtnSeat");

// Definición de Clases de Cabina
const CABIN_CLASSES = {
  first: {
    key: "first",
    name: "Primera Clase",
    icon: "",
    badgeLabel: "Primera Clase",
    rows: [1, 2],
    className: "seat-first",
    badgeClass: "badge-first",
    color: "#d97706",
    priceBonus: 140000,
  },
  business: {
    key: "business",
    name: "Clase Empresarial",
    icon: "",
    badgeLabel: "Clase Empresarial",
    rows: [3, 4],
    className: "seat-business",
    badgeClass: "badge-business",
    color: "#6366f1",
    priceBonus: 70000,
  },
  economy: {
    key: "economy",
    name: "Clase Normal",
    icon: "",
    badgeLabel: "Clase Normal",
    rows: [5, 6, 7, 8],
    className: "seat-economy",
    badgeClass: "badge-economy",
    color: "#0866c6",
    priceBonus: 0,
  },
};

function getSeatClass(seat) {
  const row = parseInt(seat, 10);
  if (row <= 2) return "first";
  if (row <= 4) return "business";
  return "economy";
}

function calculateTotalPrice() {
  if (!selectedFlight) return 0;
  const basePrice = Number(selectedFlight.price || 0);
  if (selectedSeats.length === 0) {
    return basePrice * passengerCount;
  }
  let total = 0;
  selectedSeats.forEach((seat) => {
    const cls = getSeatClass(seat);
    const bonus = CABIN_CLASSES[cls]?.priceBonus || 0;
    total += basePrice + bonus;
  });
  const remaining = passengerCount - selectedSeats.length;
  if (remaining > 0) {
    total += basePrice * remaining;
  }
  return total;
}

const nameInput = document.getElementById("card_holder_name");
const cardInput = document.getElementById("card_number_input");
const expiryInput = document.getElementById("card_expiry_input");
const cvvInput = document.getElementById("card_cvv_input");
const paymentOptionBtns = document.querySelectorAll(".payment--options button");

let selectedPaymentMethod = "card";

if (nameInput) {
  nameInput.addEventListener("input", () => {
    nameInput.value = nameInput.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, "");
  });
}

if (cardInput) {
  cardInput.addEventListener("input", () => {
    const digits = cardInput.value.replace(/\D/g, "").slice(0, 16);
    cardInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });
}

if (expiryInput) {
  expiryInput.addEventListener("input", () => {
    const digits = expiryInput.value.replace(/\D/g, "").slice(0, 4);
    expiryInput.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  });
}

if (cvvInput) {
  cvvInput.addEventListener("input", () => {
    cvvInput.value = cvvInput.value.replace(/\D/g, "").slice(0, 4);
  });
}

const installmentsSelect = document.getElementById("card_installments_select");
const installmentsContainer = document.getElementById("installmentsContainer");
const creditCardForm = document.querySelector(".credit-card-info--form");

function getSelectedInstallments() {
  return Math.max(1, Number(installmentsSelect?.value || 1));
}

function updateInstallmentsOptions() {
  if (!installmentsSelect || !selectedFlight) return;
  const total = calculateTotalPrice();
  const plans = [1, 2, 3, 6, 12, 24, 36];
  const cur = installmentsSelect.value || "1";

  installmentsSelect.innerHTML = plans
    .map((n) => {
      const perMonth = Math.round(total / n);
      const text = n === 1
        ? `1 cuota (sin interés) • ${currency.format(total)}`
        : `${n} cuotas de ${currency.format(perMonth)} / mes`;
      return `<option value="${n}">${text}</option>`;
    })
    .join("");

  if (plans.includes(Number(cur))) {
    installmentsSelect.value = cur;
  }
}

function updatePurchaseButtonText() {
  if (!purchaseBtn || !selectedFlight) return;
  const total = calculateTotalPrice();
  if (selectedPaymentMethod !== "card") {
    const providerName = selectedPaymentMethod === "paypal" ? "PayPal" : selectedPaymentMethod === "apple-pay" ? "Apple Pay" : "Google Pay";
    purchaseBtn.textContent = `Pagar con ${providerName} • ${currency.format(total)}`;
    return;
  }

  const n = getSelectedInstallments();
  if (n === 1) {
    purchaseBtn.textContent = `Checkout • ${currency.format(total)}`;
  } else {
    const perMonth = Math.round(total / n);
    purchaseBtn.textContent = `Pagar en ${n} cuotas de ${currency.format(perMonth)}`;
  }
}

if (installmentsSelect) {
  installmentsSelect.addEventListener("change", updatePurchaseButtonText);
}

// Opciones de pago rápido (PayPal, Apple Pay, Google Pay)
paymentOptionBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const isAlreadySelected = btn.classList.contains("is-selected");
    paymentOptionBtns.forEach((b) => b.classList.remove("is-selected"));

    if (isAlreadySelected) {
      selectedPaymentMethod = "card";
      creditCardForm?.classList.remove("is-dimmed");
      if (nameInput) nameInput.required = true;
      if (cardInput) cardInput.required = true;
      if (expiryInput) expiryInput.required = true;
      if (cvvInput) cvvInput.required = true;
      updatePurchaseButtonText();
    } else {
      btn.classList.add("is-selected");
      selectedPaymentMethod = btn.name;
      creditCardForm?.classList.add("is-dimmed");
      if (nameInput) nameInput.required = false;
      if (cardInput) cardInput.required = false;
      if (expiryInput) expiryInput.required = false;
      if (cvvInput) cvvInput.required = false;
      updatePurchaseButtonText();
    }
  });
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
      <h3 id="senairAuthModalTitle">Inicia sesión para pagar</h3>
      <p>Para completar tu compra en SENAIR debes iniciar sesión o registrarte con tu cuenta de cliente o administrador.</p>
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


// ══════════════════════════════════════════════════════════════════
// LÓGICA DEL APARTADO DE PASAJEROS (PASO 2)
// ══════════════════════════════════════════════════════════════════

function getPassengersData() {
  return selectedSeats.map((seat, idx) => {
    const store = passengerDataStore[seat] || {};
    return {
      seat,
      seatClass: CABIN_CLASSES[getSeatClass(seat)]?.name || "Clase Normal",
      badgeClass: CABIN_CLASSES[getSeatClass(seat)]?.badgeClass || "badge-economy",
      name: (store.name || "").trim(),
      docType: store.docType || "CC",
      docNumber: (store.docNumber || "").trim(),
      email: (store.email || "").trim(),
      phone: (store.phone || "").trim(),
    };
  });
}

function validateAllPassengers() {
  if (selectedSeats.length !== passengerCount || selectedSeats.length === 0) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return selectedSeats.every((seat) => {
    const p = passengerDataStore[seat];
    if (!p) return false;
    const nameValid = (p.name || "").trim().length >= 3;
    const docValid = (p.docNumber || "").trim().length >= 4 && (p.docNumber || "").trim().length <= 20;
    const emailStr = (p.email || "").trim();
    const emailValid = emailRegex.test(emailStr) && emailStr.length <= 50;
    const phoneStr = (p.phone || "").trim();
    const phoneValid = phoneStr.replace(/\D/g, "").length >= 7 && phoneStr.length <= 20;
    return nameValid && docValid && emailValid && phoneValid;
  });
}

function updateSummaryPassengers() {
  if (!summaryPassengersPreview || !summaryPassengersList) return;
  if (selectedSeats.length === 0) {
    summaryPassengersPreview.style.display = "none";
    summaryPassengersList.innerHTML = "";
    return;
  }

  summaryPassengersPreview.style.display = "block";
  summaryPassengersList.innerHTML = selectedSeats.map((seat) => {
    const p = passengerDataStore[seat];
    const nameText = p && p.name ? p.name.trim() : "Por asignar...";
    return `
      <div class="summary-pass-item">
        <strong>${escapeHtml(nameText)}</strong>
        <span>${seat}</span>
      </div>
    `;
  }).join("");
}

function syncPassengerValidationUI() {
  const isComplete = validateAllPassengers();
  const seatsComplete = selectedSeats.length === passengerCount;
  const totalFormatted = currency.format(calculateTotalPrice());
  const authStorageKey = "senairAuthenticated";
  const isAuthenticated = window.sessionStorage.getItem(authStorageKey) === "true";

  if (proceedToPaymentBtn) {
    proceedToPaymentBtn.disabled = !isComplete;
    if (isComplete) {
      proceedToPaymentBtn.classList.add("ready");
      if (!isAuthenticated) {
        proceedToPaymentBtn.textContent = `Iniciar sesión para pagar • ${totalFormatted}`;
      } else {
        proceedToPaymentBtn.textContent = `Proceder al Pago Seguro • ${totalFormatted}`;
      }
    } else {
      proceedToPaymentBtn.classList.remove("ready");
      if (!seatsComplete) {
        proceedToPaymentBtn.textContent = `Selecciona todos tus asientos arriba primero`;
      } else {
        proceedToPaymentBtn.textContent = `Completa los datos de todos los pasajeros para pagar`;
      }
    }
  }

  updateSummaryPassengers();
}

function renderPassengerForms() {
  if (!passengersCardsContainer) return;

  // El formulario de datos del cliente aparece SOLO cuando se han seleccionado los asientos correspondientes
  const seatsReady = selectedSeats.length === passengerCount && passengerCount > 0;

  if (!seatsReady) {
    if (passengerStep) {
      passengerStep.style.display = "none";
      passengerStep.classList.remove("is-active");
    }
    passengersCardsContainer.style.display = "none";
    if (passengerActionRow) passengerActionRow.style.display = "none";
    updateSummaryPassengers();
    return;
  }

  // Hacer visible el apartado de pasajeros solo cuando los asientos están seleccionados
  if (passengerStep) {
    passengerStep.style.display = "block";
    passengerStep.classList.add("is-active");
  }
  passengersCardsContainer.style.display = "flex";
  if (passengerActionRow) passengerActionRow.style.display = "flex";

  const loggedUser = window.sessionStorage.getItem("senairUserName") || "";
  const loggedEmail = window.sessionStorage.getItem("senairUserEmail") || "";

  // Crear tarjetas para cada asiento seleccionado con los límites de 20 dígitos en doc/tel y 50 en email
  passengersCardsContainer.innerHTML = selectedSeats.map((seat, index) => {
    if (!passengerDataStore[seat]) {
      passengerDataStore[seat] = {
        name: index === 0 && loggedUser ? loggedUser : "",
        docType: "CC",
        docNumber: "",
        email: index === 0 && loggedEmail ? loggedEmail.slice(0, 50) : "",
        phone: ""
      };
    }
    const store = passengerDataStore[seat];
    const seatClassKey = getSeatClass(seat);
    const classInfo = CABIN_CLASSES[seatClassKey];
    const column = seat.slice(-1);
    const locLabel = column === "A" || column === "F" ? "Ventana" : column === "C" || column === "D" ? "Pasillo" : "Medio";

    return `
      <article class="passenger-card" data-seat="${seat}">
        <div class="passenger-card-header">
          <div class="passenger-seat-badge">
            <span class="seat-pill">${seat}</span>
            <span class="class-pill ${classInfo.badgeClass}">${classInfo.badgeLabel}</span>
            <span class="location-pill">${locLabel}</span>
          </div>
          <span class="ticket-num-label">Boleto #${index + 1} de ${passengerCount}</span>
        </div>

        <div class="passenger-form-grid">
          <!-- Nombre Completo -->
          <div class="passenger-form-group full-width">
            <label for="pass_name_${seat}" class="pass-label">
              Nombre y Apellidos del Pasajero <span class="req">*</span>
            </label>
            <input 
              type="text" 
              id="pass_name_${seat}" 
              class="pass-input pass-input-name" 
              data-seat="${seat}" 
              placeholder="Ej. Juan Andrés Pérez Gómez" 
              value="${escapeHtml(store.name)}" 
              maxlength="70"
              required 
              autocomplete="name"
            />
          </div>

          <!-- Tipo de Documento -->
          <div class="passenger-form-group">
            <label for="pass_doctype_${seat}" class="pass-label">
              Tipo de Documento <span class="req">*</span>
            </label>
            <select id="pass_doctype_${seat}" class="pass-select pass-select-doctype" data-seat="${seat}">
              <option value="CC" ${store.docType === "CC" ? "selected" : ""}>Cédula de Ciudadanía (CC)</option>
              <option value="CE" ${store.docType === "CE" ? "selected" : ""}>Cédula de Extranjería (CE)</option>
              <option value="PA" ${store.docType === "PA" ? "selected" : ""}>Pasaporte (PA)</option>
              <option value="TI" ${store.docType === "TI" ? "selected" : ""}>Tarjeta de Identidad (TI)</option>
              <option value="PEP" ${store.docType === "PEP" ? "selected" : ""}>Permiso Especial (PEP)</option>
            </select>
          </div>

          <!-- Número de Documento (Límite: 20 dígitos) -->
          <div class="passenger-form-group">
            <label for="pass_doc_${seat}" class="pass-label">
              Número de Documento <span class="req">*</span> <small style="color:var(--muted); font-weight:normal;">(Máx. 20 dígitos)</small>
            </label>
            <input 
              type="text" 
              id="pass_doc_${seat}" 
              class="pass-input pass-input-doc" 
              data-seat="${seat}" 
              placeholder="Ej. 1020304050" 
              value="${escapeHtml(store.docNumber)}" 
              maxlength="20"
              required 
              inputmode="numeric"
            />
          </div>

          <!-- Correo Electrónico (Límite: 50 caracteres) -->
          <div class="passenger-form-group">
            <label for="pass_email_${seat}" class="pass-label">
              Correo Electrónico <span class="req">*</span> <small style="color:var(--muted); font-weight:normal;">(Máx. 50 caracteres)</small>
            </label>
            <input 
              type="email" 
              id="pass_email_${seat}" 
              class="pass-input pass-input-email" 
              data-seat="${seat}" 
              placeholder="correo@ejemplo.com" 
              value="${escapeHtml(store.email)}" 
              maxlength="50"
              required 
              autocomplete="email"
            />
          </div>

          <!-- Teléfono / Celular (Límite: 20 dígitos) -->
          <div class="passenger-form-group">
            <label for="pass_phone_${seat}" class="pass-label">
              Teléfono / Celular <span class="req">*</span> <small style="color:var(--muted); font-weight:normal;">(Máx. 20 dígitos)</small>
            </label>
            <input 
              type="tel" 
              id="pass_phone_${seat}" 
              class="pass-input pass-input-phone" 
              data-seat="${seat}" 
              placeholder="Ej. 300 123 4567" 
              value="${escapeHtml(store.phone)}" 
              maxlength="20"
              required 
              autocomplete="tel"
            />
          </div>
        </div>
      </article>
    `;
  }).join("");

  // Añadir listeners para cada campo con validación estricta de longitudes
  passengersCardsContainer.querySelectorAll(".pass-input, .pass-select").forEach((el) => {
    const seat = el.dataset.seat;
    el.addEventListener("input", () => {
      if (!passengerDataStore[seat]) passengerDataStore[seat] = {};

      if (el.classList.contains("pass-input-name")) {
        passengerDataStore[seat].name = el.value.slice(0, 70);
        el.classList.toggle("is-valid", el.value.trim().length >= 3);
        el.classList.toggle("is-invalid", el.value.trim().length > 0 && el.value.trim().length < 3);
      } else if (el.classList.contains("pass-select-doctype")) {
        passengerDataStore[seat].docType = el.value;
      } else if (el.classList.contains("pass-input-doc")) {
        // Solo caracteres alfanuméricos y guiones, máximo 20 dígitos
        const cleanDoc = el.value.replace(/[^0-9A-Za-z-]/g, "").slice(0, 20);
        el.value = cleanDoc;
        passengerDataStore[seat].docNumber = cleanDoc;
        el.classList.toggle("is-valid", cleanDoc.length >= 4 && cleanDoc.length <= 20);
        el.classList.toggle("is-invalid", cleanDoc.length > 0 && cleanDoc.length < 4);
      } else if (el.classList.contains("pass-input-email")) {
        // Máximo 50 caracteres para correo electrónico
        const cleanEmail = el.value.trim().slice(0, 50);
        el.value = cleanEmail;
        passengerDataStore[seat].email = cleanEmail;
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) && cleanEmail.length <= 50;
        el.classList.toggle("is-valid", valid);
        el.classList.toggle("is-invalid", cleanEmail.length > 0 && !valid);
      } else if (el.classList.contains("pass-input-phone")) {
        // Teléfono: máximo 20 dígitos/caracteres
        const cleanPhone = el.value.replace(/[^0-9+ ()-]/g, "").slice(0, 20);
        el.value = cleanPhone;
        passengerDataStore[seat].phone = cleanPhone;
        const digitsCount = cleanPhone.replace(/\D/g, "").length;
        el.classList.toggle("is-valid", digitsCount >= 7 && cleanPhone.length <= 20);
        el.classList.toggle("is-invalid", cleanPhone.length > 0 && digitsCount < 7);
      }

      syncPassengerValidationUI();
    });
  });

  syncPassengerValidationUI();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);
}

function openPaymentModal() {
  if (selectedSeats.length !== passengerCount) return;

  if (!validateAllPassengers()) {
    if (passengerStep) {
      passengerStep.scrollIntoView({ behavior: "smooth", block: "center" });
      const firstInvalid = passengerStep.querySelector(".pass-input:invalid, .pass-input.is-invalid") || passengerStep.querySelector(".pass-input");
      if (firstInvalid) firstInvalid.focus();
    }
    alert("Por favor completa los datos reglamentarios de todos los pasajeros antes de realizar el pago.");
    return;
  }

  const authStorageKey = "senairAuthenticated";
  const isAuthenticated = window.sessionStorage.getItem(authStorageKey) === "true";
  if (!isAuthenticated) {
    showAuthRequiredModal("login.html?redirect=checkout.html&msg=auth_required");
    return;
  }

  // Prellenar nombre del titular de tarjeta con el primer pasajero si está vacío
  const firstPass = passengerDataStore[selectedSeats[0]];
  if (nameInput && !nameInput.value.trim() && firstPass && firstPass.name) {
    nameInput.value = firstPass.name;
  }

  if (!paymentOverlay) return;

  updateInstallmentsOptions();
  updatePurchaseButtonText();

  paymentOverlay.style.display = "flex";
  paymentOverlay.classList.add("is-open");
  const modalEl = document.getElementById("paymentModal");
  if (modalEl) modalEl.classList.add("open");
  paymentOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    if (nameInput && selectedPaymentMethod === "card") nameInput.focus();
  }, 100);
}

function closePaymentModal() {
  if (!paymentOverlay) return;
  paymentOverlay.classList.remove("is-open");
  const modalEl = document.getElementById("paymentModal");
  if (modalEl) modalEl.classList.remove("open");
  paymentOverlay.style.display = "none";
  paymentOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

if (openModalBtnSeat) {
  openModalBtnSeat.addEventListener("click", () => {
    if (selectedSeats.length === passengerCount && passengerStep) {
      passengerStep.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const firstInput = passengerStep.querySelector(".pass-input");
        if (firstInput) firstInput.focus();
      }, 350);
    }
  });
}

if (proceedToPaymentBtn) {
  proceedToPaymentBtn.addEventListener("click", openPaymentModal);
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closePaymentModal);
}

if (paymentOverlay) {
  paymentOverlay.addEventListener("click", (event) => {
    if (event.target === paymentOverlay) {
      closePaymentModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && paymentOverlay?.classList.contains("is-open")) {
    closePaymentModal();
  }
});

function updateSelectedSeatClassSummary() {
  const el = document.getElementById("selectedSeatClass");
  if (!el) return;
  if (selectedSeats.length === 0) {
    el.innerHTML = '<span class="badge-none">Sin seleccionar</span>';
    return;
  }
  const classes = [...new Set(selectedSeats.map(getSeatClass))];
  el.innerHTML = classes
    .map((c) => {
      const info = CABIN_CLASSES[c];
      return `<span class="seat-class-badge ${info.badgeClass}">${info.badgeLabel}</span>`;
    })
    .join(" ");
}

function updatePayButtons() {
  const seatsComplete = selectedSeats.length === passengerCount;
  const remaining = passengerCount - selectedSeats.length;

  if (openModalBtnSeat) {
    openModalBtnSeat.disabled = !seatsComplete;
    if (seatsComplete) {
      openModalBtnSeat.textContent = `Confirmar Asientos e Ingresar Datos de Pasajeros (${selectedSeats.join(", ")}) ↓`;
      openModalBtnSeat.classList.add("ready");
    } else {
      openModalBtnSeat.textContent = `Selecciona ${remaining} asiento${remaining === 1 ? "" : "s"} más para continuar`;
      openModalBtnSeat.classList.remove("ready");
    }
  }

  renderPassengerForms();
  syncPassengerValidationUI();
}

if (!selectedFlight) {
  window.location.replace("vuelos.html");
} else {
  const authStorageKey = "senairAuthenticated";
  const isAuthenticated = window.sessionStorage.getItem(authStorageKey) === "true";
  const authWarningBanner = document.getElementById("authWarningBanner");
  if (authWarningBanner) {
    authWarningBanner.style.display = isAuthenticated ? "none" : "flex";
  }

  document.getElementById("summaryTitle").textContent = selectedFlight.airline;
  document.getElementById("route").textContent = `${selectedFlight.origin}  -  ${selectedFlight.destination}`;
  document.getElementById("departureTime").textContent = selectedFlight.departure_time;
  document.getElementById("arrivalTime").textContent = selectedFlight.arrival_time;
  document.getElementById("passengerCount").textContent = passengerCount;
  document.getElementById("seatInstruction").textContent = `Escoge ${passengerCount} asiento${passengerCount === 1 ? "" : "s"} disponible${passengerCount === 1 ? "" : "s"} para continuar.`;
  document.getElementById("totalPrice").textContent = currency.format(calculateTotalPrice());

  updateSelectedSeatClassSummary();
  updatePayButtons();

  // Controladores del selector de clases (filtros)
  const classFilterBtns = document.querySelectorAll(".class-nav-btn");
  classFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      classFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.classFilter;
      seatMap.classList.remove("filter-all", "filter-first", "filter-business", "filter-economy");
      if (filter && filter !== "all") {
        seatMap.classList.add(`filter-${filter}`);
        const targetDivider = seatMap.querySelector(`.${filter}-divider`);
        if (targetDivider) {
          targetDivider.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    });
  });

  const occupiedSeats = new Set(["1B", "2C", "3A", "3F", "4D", "5E", "6B", "7A", "8F"]);

  for (let row = 1; row <= 8; row += 1) {
    // Inserción de divisores estéticos de cabina de avión
    if (row === 1) {
      const divider = document.createElement("div");
      divider.className = "cabin-section-divider first-divider";
      divider.setAttribute("role", "separator");
      divider.innerHTML = `<span class="cabin-divider-badge first"> Primera Clase · Suites Confort (Filas 1-2)</span>`;
      seatMap.append(divider);
    } else if (row === 3) {
      const divider = document.createElement("div");
      divider.className = "cabin-section-divider business-divider";
      divider.setAttribute("role", "separator");
      divider.innerHTML = `<span class="cabin-divider-badge business"> Clase Empresarial · Premium (Filas 3-4)</span>`;
      seatMap.append(divider);
    } else if (row === 5) {
      const divider = document.createElement("div");
      divider.className = "cabin-section-divider economy-divider";
      divider.setAttribute("role", "separator");
      divider.innerHTML = `<span class="cabin-divider-badge economy"> Clase Normal · Confort Estándar (Filas 5-8)</span>`;
      seatMap.append(divider);
    }

    ["A", "B", "C", "aisle", "D", "E", "F"].forEach((column) => {
      if (column === "aisle") {
        const aisle = document.createElement("span");
        aisle.className = "aisle";
        const badge = document.createElement("span");
        badge.className = "aisle-row-badge";
        badge.textContent = row;
        badge.title = `Fila ${row}`;
        badge.setAttribute("aria-hidden", "true");
        aisle.append(badge);
        seatMap.append(aisle);
        return;
      }

      const seat = `${row}${column}`;
      const isWindow = column === "A" || column === "F";
      const isAisle = column === "C" || column === "D";
      const locLabel = isWindow ? "Ventana" : isAisle ? "Pasillo" : "Medio";
      const seatClass = getSeatClass(seat);
      const classInfo = CABIN_CLASSES[seatClass];

      const button = document.createElement("button");
      button.type = "button";
      button.className = `seat-button ${classInfo.className}`;
      button.textContent = seat;
      button.title = `Asiento ${seat} · ${locLabel} · ${classInfo.icon} ${classInfo.name}${occupiedSeats.has(seat) ? " (Ocupado)" : " (Disponible)"}`;
      button.setAttribute("aria-label", `Asiento ${seat}, ${locLabel}, ${classInfo.name}`);
      button.dataset.seat = seat;
      button.dataset.location = locLabel;
      button.dataset.seatClass = seatClass;
      button.disabled = occupiedSeats.has(seat);
      if (button.disabled) button.classList.add("occupied");

      button.addEventListener("click", () => {
        const existingIndex = selectedSeats.indexOf(seat);
        if (existingIndex >= 0) {
          selectedSeats.splice(existingIndex, 1);
          button.classList.remove("selected");
        } else if (selectedSeats.length < passengerCount) {
          selectedSeats.push(seat);
          button.classList.add("selected");
        } else if (passengerCount === 1) {
          const prevSeat = selectedSeats[0];
          const prevBtn = Array.from(seatMap.querySelectorAll(".seat-button")).find((b) => b.dataset.seat === prevSeat);
          if (prevBtn) prevBtn.classList.remove("selected");
          selectedSeats[0] = seat;
          button.classList.add("selected");
        } else {
          const oldestSeat = selectedSeats.shift();
          const oldestBtn = Array.from(seatMap.querySelectorAll(".seat-button")).find((b) => b.dataset.seat === oldestSeat);
          if (oldestBtn) oldestBtn.classList.remove("selected");
          selectedSeats.push(seat);
          button.classList.add("selected");
        }

        document.getElementById("selectedSeat").textContent = selectedSeats.length ? selectedSeats.join(", ") : "Sin seleccionar";
        document.getElementById("totalPrice").textContent = currency.format(calculateTotalPrice());
        updateSelectedSeatClassSummary();
        updatePayButtons();
        updateInstallmentsOptions();
        updatePurchaseButtonText();
      });

      seatMap.append(button);
    });
  }
}

if (paymentForm) {
  paymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (selectedSeats.length !== passengerCount) return;

    const authStorageKey = "senairAuthenticated";
    const isAuthenticated = window.sessionStorage.getItem(authStorageKey) === "true";

    if (!isAuthenticated) {
      alert("Debes iniciar sesión para completar tu compra y asociar el vuelo a tu cuenta.");
      closePaymentModal();
      window.location.href = "login.html";
      return;
    }

    if (purchaseBtn) {
      purchaseBtn.disabled = true;
      purchaseBtn.textContent = "Procesando pago...";
    }

    const confirmationText = document.getElementById("confirmationText");
    const checkoutLayout = document.querySelector(".checkout-layout");
    const checkoutIntro = document.querySelector(".checkout-intro");

    const calculatedTotal = calculateTotalPrice();
    const classNamesUsed = [...new Set(selectedSeats.map(getSeatClass))].map((c) => CABIN_CLASSES[c].name).join(", ");
    const passengersList = getPassengersData();
    const passengerNamesStr = passengersList.map((p) => `${p.name} (${p.seat})`).join(", ");
    const passengerDocsStr = passengersList.map((p) => `${p.docType} ${p.docNumber}`).join(", ");
    const primaryPassenger = passengersList[0] || {};

    const reservation = {
      origin: selectedFlight.origin,
      destination: selectedFlight.destination,
      departureDate: selectedFlight.departure_date,
      departureTime: selectedFlight.departure_time,
      arrivalTime: selectedFlight.arrival_time,
      seat: selectedSeats.join(", "),
      seatClass: classNamesUsed || "Clase Normal",
      price: calculatedTotal,
      airline: selectedFlight.airline,
      flightId: selectedFlight.id,
      passengerName: passengerNamesStr,
      passengerDoc: passengerDocsStr,
      passengerEmail: primaryPassenger.email || "",
      passengerPhone: primaryPassenger.phone || "",
      passengers: passengersList,
    };

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(reservation),
        credentials: "include",
      });

      if (response.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión para completar tu reserva.");
        window.sessionStorage.removeItem(authStorageKey);
        closePaymentModal();
        window.location.href = "login.html";
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "No se pudo registrar la reserva. Intenta de nuevo.");
        if (purchaseBtn) {
          purchaseBtn.disabled = false;
          purchaseBtn.textContent = "Checkout";
        }
        return;
      }
    } catch {
      alert("Hubo un problema de conexión con el servidor. Inténtalo de nuevo.");
      if (purchaseBtn) {
        purchaseBtn.disabled = false;
        purchaseBtn.textContent = "Checkout";
      }
      return;
    }

    window.localStorage.removeItem("senairReservations");

    closePaymentModal();

    // 1. Datos para la Factura Electrónica
    const totalAmount = calculatedTotal;
    const subtotalAmount = Math.round(totalAmount / 1.19);
    const taxesAmount = totalAmount - subtotalAmount;
    const invoiceNum = `SEN-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const invoiceDateStr = now.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" }) + " " + now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    const userName = (nameInput?.value || "").trim() || window.sessionStorage.getItem("senairUserName") || "Pasajero SENAIR";
    const userEmail = window.sessionStorage.getItem("senairUserEmail") || "correo@senair.com";
    const reservationCode = `SNR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const paymentMethodLabel = selectedPaymentMethod === "card"
      ? (cardInput?.value ? `Tarjeta •••• ${cardInput.value.replace(/\s+/g, "").slice(-4)}` : "Tarjeta de Crédito")
      : selectedPaymentMethod === "paypal" ? "PayPal" : selectedPaymentMethod === "apple-pay" ? "Apple Pay" : "Google Pay";

    const nCuotas = selectedPaymentMethod === "card" ? getSelectedInstallments() : 1;
    const installmentsLabel = nCuotas === 1
      ? "1 cuota (pago directo)"
      : `${nCuotas} cuotas de ${currency.format(Math.round(totalAmount / nCuotas))} / mes`;

    // Llenar campos de la factura
    const invoiceNumberEl = document.getElementById("invoiceNumber");
    if (invoiceNumberEl) invoiceNumberEl.textContent = `N° ${invoiceNum}`;

    const invoiceDateEl = document.getElementById("invoiceDate");
    if (invoiceDateEl) invoiceDateEl.textContent = `Fecha: ${invoiceDateStr}`;

    const invoiceCustNameEl = document.getElementById("invoiceCustomerName");
    if (invoiceCustNameEl) invoiceCustNameEl.textContent = primaryPassenger.name || userName;

    const invoiceCustEmailEl = document.getElementById("invoiceCustomerEmail");
    if (invoiceCustEmailEl) invoiceCustEmailEl.textContent = primaryPassenger.email || userEmail;

    const invoiceCustDocEl = document.getElementById("invoiceCustomerDoc");
    if (invoiceCustDocEl && primaryPassenger.docNumber) {
      invoiceCustDocEl.textContent = `Doc: ${primaryPassenger.docType} ${primaryPassenger.docNumber}`;
    }

    // Llenar grilla de boletos por pasajero en la factura
    const invoicePassGrid = document.getElementById("invoicePassengersGrid");
    if (invoicePassGrid) {
      invoicePassGrid.innerHTML = passengersList.map((p) => `
        <div class="invoice-pass-card">
          <div class="invoice-pass-seat-badge">${p.seat}</div>
          <div class="invoice-pass-details">
            <strong>${escapeHtml(p.name)}</strong>
            <span>${p.docType}: ${escapeHtml(p.docNumber)} · ${p.seatClass}</span>
          </div>
        </div>
      `).join("");
    }

    const invoicePaymentEl = document.getElementById("invoicePaymentMethod");
    if (invoicePaymentEl) invoicePaymentEl.textContent = paymentMethodLabel;

    const invoiceInstallmentsEl = document.getElementById("invoiceInstallments");
    if (invoiceInstallmentsEl) invoiceInstallmentsEl.textContent = installmentsLabel;

    const invoiceResCodeEl = document.getElementById("invoiceReservationCode");
    if (invoiceResCodeEl) invoiceResCodeEl.textContent = reservationCode;

    const invoiceAirlineEl = document.getElementById("invoiceFlightAirline");
    if (invoiceAirlineEl) invoiceAirlineEl.textContent = `Operado por ${selectedFlight.airline || "SENAIR"}`;

    const invoiceRouteDateEl = document.getElementById("invoiceFlightRouteDate");
    if (invoiceRouteDateEl) {
      invoiceRouteDateEl.innerHTML = `${selectedFlight.origin} → ${selectedFlight.destination}<br><small>${selectedFlight.departure_date} · ${selectedFlight.departure_time} - ${selectedFlight.arrival_time}</small>`;
    }

    const invoiceSeatsEl = document.getElementById("invoiceFlightSeats");
    if (invoiceSeatsEl) invoiceSeatsEl.textContent = selectedSeats.join(", ");

    const invoiceClassEl = document.getElementById("invoiceFlightClass");
    if (invoiceClassEl) invoiceClassEl.textContent = classNamesUsed || "Clase Normal";

    const invoicePassEl = document.getElementById("invoiceFlightPassengers");
    if (invoicePassEl) invoicePassEl.textContent = `${passengerCount} pasajero${passengerCount === 1 ? "" : "s"}`;

    const invoiceBasePriceEl = document.getElementById("invoiceBasePrice");
    if (invoiceBasePriceEl) invoiceBasePriceEl.textContent = currency.format(totalAmount);

    const invoiceSubtotalEl = document.getElementById("invoiceSubtotal");
    if (invoiceSubtotalEl) invoiceSubtotalEl.textContent = currency.format(subtotalAmount);

    const invoiceTaxesEl = document.getElementById("invoiceTaxes");
    if (invoiceTaxesEl) invoiceTaxesEl.textContent = currency.format(taxesAmount);

    const invoiceGrandTotalEl = document.getElementById("invoiceGrandTotal");
    if (invoiceGrandTotalEl) invoiceGrandTotalEl.textContent = currency.format(totalAmount);

    // 2. Llenar sección de confirmación (debajo de la factura)
    const cuotasInfo = nCuotas > 1 ? ` (diferido a ${nCuotas} cuotas)` : "";
    if (confirmationText) {
      const targetEmail = primaryPassenger.email || userEmail;
      confirmationText.textContent = `${selectedFlight.origin} a ${selectedFlight.destination}, asiento${selectedSeats.length === 1 ? "" : "s"} ${selectedSeats.join(", ")} (${classNamesUsed})${cuotasInfo}. Boleto emitido para: ${passengerNamesStr}. Te hemos enviado el comprobante oficial al correo ${targetEmail}.`;
    }

    if (checkoutLayout) checkoutLayout.style.display = "none";
    if (checkoutIntro) checkoutIntro.style.display = "none";

    const postCheckoutContainer = document.getElementById("postCheckoutContainer");
    if (postCheckoutContainer) {
      postCheckoutContainer.hidden = false;
      postCheckoutContainer.style.display = "flex";
      postCheckoutContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
