const selectedFlight = JSON.parse(window.sessionStorage.getItem("senairSelectedFlight") || "null");
const seatMap = document.getElementById("seatMap");
const payButton = document.querySelector(".pay-button");
const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
let selectedSeat = "";

if (!selectedFlight) {
  window.location.replace("vuelos.html");
} else {
  document.getElementById("summaryTitle").textContent = selectedFlight.airline;
  document.getElementById("route").textContent = `${selectedFlight.origin}  -  ${selectedFlight.destination}`;
  document.getElementById("departureTime").textContent = selectedFlight.departure_time;
  document.getElementById("arrivalTime").textContent = selectedFlight.arrival_time;
  document.getElementById("totalPrice").textContent = currency.format(selectedFlight.price);

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
        document.querySelector(".seat-button.selected")?.classList.remove("selected");
        button.classList.add("selected");
        selectedSeat = seat;
        document.getElementById("selectedSeat").textContent = seat;
        payButton.disabled = false;
        payButton.textContent = `Pagar ${currency.format(selectedFlight.price)}`;
      });
      seatMap.append(button);
    });
  }
}

document.getElementById("paymentForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!selectedSeat) return;
  const reservations = JSON.parse(window.localStorage.getItem("senairReservations") || "[]");
  const reservation = {
    id: `${selectedFlight.id}-${selectedSeat}-${Date.now()}`,
    origin: selectedFlight.origin,
    destination: selectedFlight.destination,
    departureDate: selectedFlight.departure_date,
    departureTime: selectedFlight.departure_time,
    arrivalTime: selectedFlight.arrival_time,
    seat: selectedSeat,
    price: selectedFlight.price,
    airline: selectedFlight.airline,
  };
  window.localStorage.setItem("senairReservations", JSON.stringify([...reservations, reservation]));
  document.getElementById("confirmationText").textContent = `${selectedFlight.origin} a ${selectedFlight.destination}, asiento ${selectedSeat}. Te enviaremos los detalles al correo de tu cuenta.`;
  document.getElementById("confirmation").hidden = false;
  event.currentTarget.closest(".payment-step").hidden = true;
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});