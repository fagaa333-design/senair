const selectedFlight = JSON.parse(window.sessionStorage.getItem("senairSelectedFlight") || "null");
const seatMap = document.getElementById("seatMap");
const payButton = document.querySelector(".pay-button");
const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const passengerCount = Math.max(1, Number(selectedFlight?.passengers || 1));
const selectedSeats = [];

const nameInput = document.querySelector('[name="name"]');
const cardInput = document.querySelector('[name="card"]');
const expiryInput = document.querySelector('[name="expiry"]');
const cvcInput = document.querySelector('[name="cvc"]');

nameInput.addEventListener("input", () => {
  nameInput.value = nameInput.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, "");
});

cardInput.addEventListener("input", () => {
  const digits = cardInput.value.replace(/\D/g, "").slice(0, 16);
  cardInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
});

expiryInput.addEventListener("input", () => {
  const digits = expiryInput.value.replace(/\D/g, "").slice(0, 4);
  expiryInput.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
});

cvcInput.addEventListener("input", () => {
  cvcInput.value = cvcInput.value.replace(/\D/g, "").slice(0, 4);
});

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
        const seatsComplete = selectedSeats.length === passengerCount;
        payButton.disabled = !seatsComplete;
        payButton.textContent = seatsComplete ? `Pagar ${currency.format(selectedFlight.price * passengerCount)}` : `Selecciona ${passengerCount - selectedSeats.length} asiento${passengerCount - selectedSeats.length === 1 ? "" : "s"} más`;
      });
      seatMap.append(button);
    });
  }
}

document.getElementById("paymentForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (selectedSeats.length !== passengerCount) return;

  const paymentStep = document.querySelector(".payment-step");
  const confirmation = document.getElementById("confirmation");
  const confirmationText = document.getElementById("confirmationText");

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
    if (!response.ok) throw new Error("server");
  } catch {
    const localReservations = JSON.parse(window.localStorage.getItem("senairReservations") || "[]");
    localReservations.push({
      id: `${selectedFlight.id}-${selectedSeats.join("")}-${Date.now()}`,
      origin: reservation.origin,
      destination: reservation.destination,
      departureDate: reservation.departureDate,
      departureTime: reservation.departureTime,
      arrivalTime: reservation.arrivalTime,
      seat: selectedSeats,
      price: reservation.price,
      airline: reservation.airline,
    });
    window.localStorage.setItem("senairReservations", JSON.stringify(localReservations));
  }

  confirmationText.textContent = `${selectedFlight.origin} a ${selectedFlight.destination}, asiento${selectedSeats.length === 1 ? "" : "s"} ${selectedSeats.join(", ")}. Te enviaremos los detalles al correo de tu cuenta.`;
  confirmation.hidden = false;
  confirmation.style.display = "block";

  if (paymentStep) {
    paymentStep.hidden = true;
    paymentStep.style.display = "none";
  }

  confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
});