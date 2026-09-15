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
  const total = selectedFlight.price * passengerCount;
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
  const total = selectedFlight.price * passengerCount;
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

function openPaymentModal() {
  if (selectedSeats.length !== passengerCount) return;
  if (!paymentOverlay) return;

  updateInstallmentsOptions();
  updatePurchaseButtonText();

  paymentOverlay.style.display = "flex";
  paymentOverlay.classList.add("is-open");
  paymentOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    if (nameInput && selectedPaymentMethod === "card") nameInput.focus();
  }, 100);
}

function closePaymentModal() {
  if (!paymentOverlay) return;
  paymentOverlay.classList.remove("is-open");
  paymentOverlay.style.display = "none";
  paymentOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openModalBtns.forEach((btn) => {
  btn.addEventListener("click", openPaymentModal);
});

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

function updatePayButtons() {
  const seatsComplete = selectedSeats.length === passengerCount;
  const remaining = passengerCount - selectedSeats.length;
  const totalFormatted = currency.format(selectedFlight ? selectedFlight.price * passengerCount : 0);

  openModalBtns.forEach((btn) => {
    btn.disabled = !seatsComplete;
    if (seatsComplete) {
      btn.textContent = `Realizar Pago • ${totalFormatted}`;
      btn.classList.add("ready");
    } else {
      btn.textContent = `Selecciona ${remaining} asiento${remaining === 1 ? "" : "s"} más para continuar`;
      btn.classList.remove("ready");
    }
  });
}

if (!selectedFlight) {
  window.location.replace("vuelos.html");
} else {
  document.getElementById("summaryTitle").textContent = selectedFlight.airline;
  document.getElementById("route").textContent = `${selectedFlight.origin}  -  ${selectedFlight.destination}`;
  document.getElementById("departureTime").textContent = selectedFlight.departure_time;
  document.getElementById("arrivalTime").textContent = selectedFlight.arrival_time;
  document.getElementById("passengerCount").textContent = passengerCount;
  document.getElementById("seatInstruction").textContent = `Escoge ${passengerCount} asiento${passengerCount === 1 ? "" : "s"} disponible${passengerCount === 1 ? "" : "s"} para continuar.`;
  document.getElementById("totalPrice").textContent = currency.format(selectedFlight.price * passengerCount);

  updatePayButtons();

  const occupiedSeats = new Set(["1B", "2C", "3A", "3F", "4D", "5E", "6B"]);
  for (let row = 1; row <= 6; row += 1) {
    ["A", "B", "C", "aisle", "D", "E", "F"].forEach((column) => {
      if (column === "aisle") {
        const aisle = document.createElement("span");
        aisle.className = "aisle";
        seatMap.append(aisle);
        return;
      }
      const seat = `${row}${column}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "seat-button";
      button.textContent = seat;
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
        }
        document.getElementById("selectedSeat").textContent = selectedSeats.length ? selectedSeats.join(", ") : "Sin seleccionar";
        updatePayButtons();
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

    const confirmation = document.getElementById("confirmation");
    const confirmationText = document.getElementById("confirmationText");
    const checkoutLayout = document.querySelector(".checkout-layout");
    const checkoutIntro = document.querySelector(".checkout-intro");

    const reservation = {
      origin: selectedFlight.origin,
      destination: selectedFlight.destination,
      departureDate: selectedFlight.departure_date,
      departureTime: selectedFlight.departure_time,
      arrivalTime: selectedFlight.arrival_time,
      seat: selectedSeats.join(", "),
      price: selectedFlight.price * passengerCount,
      airline: selectedFlight.airline,
      flightId: selectedFlight.id,
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
    const totalAmount = selectedFlight.price * passengerCount;
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
    if (invoiceCustNameEl) invoiceCustNameEl.textContent = userName;

    const invoiceCustEmailEl = document.getElementById("invoiceCustomerEmail");
    if (invoiceCustEmailEl) invoiceCustEmailEl.textContent = userEmail;

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
      confirmationText.textContent = `${selectedFlight.origin} a ${selectedFlight.destination}, asiento${selectedSeats.length === 1 ? "" : "s"} ${selectedSeats.join(", ")}${cuotasInfo}. Te hemos enviado los detalles al correo ${userEmail}.`;
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