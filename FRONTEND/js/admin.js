/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Panel de Administración (Frontend Logic)
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  // Cache de datos en memoria para búsquedas instantáneas
  let allFlights = [];
  let allReservations = [];
  let allUsers = [];

  const copFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const dateFormatter = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // ── 1. Verificación de Seguridad y Sesión ───────────────────────
  async function checkAdminAuth() {
    try {
      const res = await fetch("/api/admin/check", { credentials: "include" });
      if (!res.ok) {
        window.location.href = "login.html";
        return null;
      }
      const data = await res.json();
      if (!data.success) {
        window.location.href = "login.html";
        return null;
      }

      // Mostrar datos del admin en el header
      const nameEl = document.getElementById("adminName");
      const emailEl = document.getElementById("adminEmail");
      const avatarEl = document.getElementById("adminAvatar");
      if (nameEl) nameEl.textContent = data.user.name || "Administrador";
      if (emailEl) emailEl.textContent = data.user.email || "";
      if (avatarEl) {
        avatarEl.textContent = (data.user.name || "A").trim().charAt(0).toUpperCase();
      }

      return data.user;
    } catch {
      window.location.href = "login.html";
      return null;
    }
  }

  // ── 2. Notificaciones Toast ────────────────────────────────────
  function showToast(message, type = "success") {
    let toast = document.getElementById("adminToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "adminToast";
      toast.className = "admin-toast";
      document.body.appendChild(toast);
    }
    toast.className = `admin-toast ${type} show`;
    toast.textContent = message;

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 3800);
  }

  // ── 3. Carga de Estadísticas / KPIs ────────────────────────────
  async function loadStats() {
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      const data = await res.json();
      if (!data.success) return;

      const { stats, recentReservations, maintenanceMode } = data;
      document.getElementById("statUsers").textContent = stats.totalUsers;
      document.getElementById("statFlights").textContent = stats.totalFlights;
      document.getElementById("statReservations").textContent = stats.totalReservations;
      document.getElementById("statRevenue").textContent = copFormatter.format(stats.totalRevenue);

      // Actualizar switch de mantenimiento si existe
      const toggle = document.getElementById("maintenanceToggle");
      if (toggle) toggle.checked = Boolean(maintenanceMode);

      // Renderizar actividad reciente en el dashboard
      renderRecentActivity(recentReservations || []);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  }

  function renderRecentActivity(reservations) {
    const tbody = document.getElementById("recentActivityBody");
    if (!tbody) return;

    if (!reservations.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><p>No hay reservas registradas aún.</p></td></tr>`;
      return;
    }

    tbody.innerHTML = reservations.map((r) => `
      <tr>
        <td><strong>#${String(r.id).padStart(4, "0")}</strong></td>
        <td>
          <div style="font-weight:700;">${escapeHtml(r.user_name || "Cliente")}</div>
          <small style="color:var(--muted);">${escapeHtml(r.user_email || "")}</small>
        </td>
        <td>${escapeHtml(r.origin)} → ${escapeHtml(r.destination)}</td>
        <td><span class="badge badge-confirmed">Asiento ${escapeHtml(r.seat)}</span></td>
        <td><strong>${copFormatter.format(r.price)}</strong></td>
        <td style="color:var(--muted); font-size:12px;">${formatTimestamp(r.created_at)}</td>
      </tr>
    `).join("");
  }

  // ── 4. Gestión de Vuelos (CRUD) ─────────────────────────────────
  async function loadFlights() {
    try {
      const res = await fetch("/api/admin/flights", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        allFlights = data.flights || [];
        renderFlightsTable(allFlights);
      }
    } catch (err) {
      showToast("Error al cargar la lista de vuelos", "error");
    }
  }

  function renderFlightsTable(flights) {
    const tbody = document.getElementById("flightsTableBody");
    if (!tbody) return;

    if (!flights.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state"><p>No se encontraron vuelos programados.</p></td></tr>`;
      return;
    }

    tbody.innerHTML = flights.map((f) => `
      <tr>
        <td><strong>#${f.id}</strong></td>
        <td>
          <div style="font-weight:700; color:var(--navy);">${escapeHtml(f.origin)}</div>
          <div style="font-size:12px; color:var(--muted);">hacia ${escapeHtml(f.destination)}</div>
        </td>
        <td>
          <div>${escapeHtml(f.departure_date)}</div>
          <small style="font-weight:700; color:var(--blue);">${escapeHtml(f.departure_time)} - ${escapeHtml(f.arrival_time)}</small>
        </td>
        <td><strong>${copFormatter.format(f.price)}</strong></td>
        <td>${escapeHtml(f.airline)}</td>
        <td>
          ${f.stops === 0
            ? '<span class="badge badge-direct">Directo</span>'
            : `<span class="badge badge-stop">${f.stops} Escala${f.stops > 1 ? "s" : ""}</span>`}
        </td>
        <td>
          <span style="font-weight:700;">${f.bookings_count || 0}</span> pasajes
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="Editar Vuelo" onclick="window.adminOpenEditFlight(${f.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="btn-icon delete" title="Eliminar Vuelo" onclick="window.adminDeleteFlight(${f.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  // Modal para Crear / Editar Vuelo
  const flightModalOverlay = document.getElementById("flightModalOverlay");
  const flightForm = document.getElementById("flightForm");

  window.adminOpenCreateFlight = function () {
    if (!flightForm) return;
    flightForm.reset();
    document.getElementById("flightModalTitle").textContent = "Nuevo Vuelo SENAIR";
    document.getElementById("flightId").value = "";
    document.getElementById("airline").value = "SENAIR";
    document.getElementById("stops").value = "0";
    flightModalOverlay.classList.add("is-open");
  };

  window.adminOpenEditFlight = function (id) {
    const flight = allFlights.find((f) => f.id === id);
    if (!flight || !flightForm) return;

    document.getElementById("flightModalTitle").textContent = `Editar Vuelo #${flight.id}`;
    document.getElementById("flightId").value = flight.id;
    document.getElementById("origin").value = flight.origin;
    document.getElementById("destination").value = flight.destination;
    document.getElementById("departureDate").value = flight.departure_date;
    document.getElementById("departureTime").value = flight.departure_time.slice(0, 5);
    document.getElementById("arrivalTime").value = flight.arrival_time.slice(0, 5);
    document.getElementById("price").value = flight.price;
    document.getElementById("airline").value = flight.airline;
    document.getElementById("stops").value = flight.stops;

    flightModalOverlay.classList.add("is-open");
  };

  window.adminCloseFlightModal = function () {
    if (flightModalOverlay) flightModalOverlay.classList.remove("is-open");
  };

  if (flightForm) {
    flightForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const flightId = document.getElementById("flightId").value;
      const isEdit = Boolean(flightId);

      const payload = {
        origin: document.getElementById("origin").value.trim(),
        destination: document.getElementById("destination").value.trim(),
        departureDate: document.getElementById("departureDate").value,
        departureTime: document.getElementById("departureTime").value,
        arrivalTime: document.getElementById("arrivalTime").value,
        price: Number(document.getElementById("price").value),
        airline: document.getElementById("airline").value.trim() || "SENAIR",
        stops: Number(document.getElementById("stops").value || 0),
      };

      try {
        const url = isEdit ? `/api/admin/flights/${flightId}` : "/api/admin/flights";
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          showToast(result.message || "No se pudo guardar el vuelo", "error");
          return;
        }

        showToast(result.message || "Vuelo guardado con éxito", "success");
        adminCloseFlightModal();
        await loadFlights();
        await loadStats();
      } catch {
        showToast("Error de conexión con el servidor", "error");
      }
    });
  }

  window.adminDeleteFlight = async function (id) {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el vuelo #${id}?`)) return;

    try {
      const res = await fetch(`/api/admin/flights/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        showToast(result.message || "No se pudo eliminar el vuelo", "error");
        return;
      }
      showToast("Vuelo eliminado del sistema", "success");
      await loadFlights();
      await loadStats();
    } catch {
      showToast("Error de conexión al eliminar vuelo", "error");
    }
  };

  // ── 5. Gestión de Reservas ─────────────────────────────────────
  async function loadReservations() {
    try {
      const res = await fetch("/api/admin/reservations", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        allReservations = data.reservations || [];
        renderReservationsTable(allReservations);
      }
    } catch {
      showToast("Error al cargar reservas", "error");
    }
  }

  function renderReservationsTable(reservations) {
    const tbody = document.getElementById("reservationsTableBody");
    if (!tbody) return;

    if (!reservations.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state"><p>No se encontraron reservas registradas.</p></td></tr>`;
      return;
    }

    tbody.innerHTML = reservations.map((r) => `
      <tr>
        <td><strong>#${String(r.id).padStart(4, "0")}</strong></td>
        <td>
          <div style="font-weight:700;">${escapeHtml(r.user_name || "Pasajero")}</div>
          <small style="color:var(--muted);">${escapeHtml(r.user_email || "")}</small>
        </td>
        <td>${escapeHtml(r.origin)} → ${escapeHtml(r.destination)}</td>
        <td>
          <div>${escapeHtml(r.departure_date)}</div>
          <small style="color:var(--muted); font-weight:600;">${escapeHtml(r.departure_time)}</small>
        </td>
        <td><span class="badge badge-confirmed">Asiento ${escapeHtml(r.seat)}</span></td>
        <td><strong>${copFormatter.format(r.price)}</strong></td>
        <td style="font-size:12px; color:var(--muted);">${formatTimestamp(r.created_at)}</td>
        <td>
          <button class="btn-icon delete" title="Cancelar Reserva" onclick="window.adminDeleteReservation(${r.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </td>
      </tr>
    `).join("");
  }

  window.adminDeleteReservation = async function (id) {
    if (!confirm(`¿Deseas cancelar y anular la reserva #${id}?`)) return;

    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        showToast(result.message || "No se pudo cancelar la reserva", "error");
        return;
      }
      showToast("Reserva cancelada correctamente", "success");
      await loadReservations();
      await loadStats();
    } catch {
      showToast("Error de conexión al cancelar reserva", "error");
    }
  };

  // ── 6. Gestión de Usuarios ─────────────────────────────────────
  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        allUsers = data.users || [];
        renderUsersTable(allUsers);
      }
    } catch {
      showToast("Error al cargar la lista de usuarios", "error");
    }
  }

  function renderUsersTable(users) {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><p>No hay usuarios registrados.</p></td></tr>`;
      return;
    }

    tbody.innerHTML = users.map((u) => `
      <tr>
        <td><strong>#${u.id}</strong></td>
        <td>
          <div style="font-weight:700;">${escapeHtml(u.name)}</div>
          <small style="color:var(--muted);">${escapeHtml(u.email)}</small>
        </td>
        <td>
          ${u.role === "admin"
            ? '<span class="badge badge-admin">Administrador</span>'
            : '<span class="badge badge-user">Cliente</span>'}
        </td>
        <td><strong>${u.reservations_count || 0}</strong> viajes</td>
        <td style="font-size:12px; color:var(--muted);">${formatTimestamp(u.created_at)}</td>
        <td>
          ${u.email === "freinergudino@gmail.com"
            ? '<small style="color:var(--muted); font-weight:700;">Superadmin</small>'
            : `<button class="btn-icon delete" title="Eliminar Usuario" onclick="window.adminDeleteUser(${u.id})">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
               </button>`}
        </td>
      </tr>
    `).join("");
  }

  window.adminDeleteUser = async function (id) {
    const user = allUsers.find((u) => Number(u.id) === Number(id));
    const userName = user ? user.name : `Usuario #${id}`;
    if (!confirm(`¿Deseas eliminar la cuenta de ${userName}? Se eliminarán también todas sus reservas asociadas.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        showToast(result.message || "No se pudo eliminar el usuario", "error");
        return;
      }
      showToast("Usuario eliminado con éxito", "success");
      await loadUsers();
      await loadStats();
      await loadReservations();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      showToast("Error de conexión al eliminar usuario", "error");
    }
  };

  // ── 7. Ajustes & Modo Mantenimiento ────────────────────────────
  const maintenanceToggle = document.getElementById("maintenanceToggle");
  if (maintenanceToggle) {
    maintenanceToggle.addEventListener("change", async () => {
      const active = maintenanceToggle.checked;
      try {
        const res = await fetch("/api/admin/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active }),
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, active ? "error" : "success");
        }
      } catch {
        maintenanceToggle.checked = !active;
        showToast("No se pudo cambiar el estado de mantenimiento", "error");
      }
    });
  }

  // Exportar datos a CSV o JSON
  window.adminExportData = function (type, format) {
    let dataToExport = [];
    let filename = "";

    if (type === "flights") {
      dataToExport = allFlights;
      filename = `vuelos_senair_${new Date().toISOString().slice(0, 10)}`;
    } else if (type === "reservations") {
      dataToExport = allReservations;
      filename = `reservas_senair_${new Date().toISOString().slice(0, 10)}`;
    }

    if (!dataToExport.length) {
      showToast("No hay datos para exportar", "error");
      return;
    }

    let blob;
    if (format === "json") {
      blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
      filename += ".json";
    } else {
      const keys = Object.keys(dataToExport[0]);
      const csvLines = [
        keys.join(","),
        ...dataToExport.map((row) => keys.map((k) => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(",")),
      ];
      blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      filename += ".csv";
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Archivo ${filename} descargado con éxito`, "success");
  };

  // ── 8. Búsquedas y Filtros en Vivo ─────────────────────────────
  const searchFlightsInput = document.getElementById("searchFlights");
  if (searchFlightsInput) {
    searchFlightsInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = allFlights.filter((f) =>
        f.origin.toLowerCase().includes(query) ||
        f.destination.toLowerCase().includes(query) ||
        f.airline.toLowerCase().includes(query) ||
        String(f.id).includes(query)
      );
      renderFlightsTable(filtered);
    });
  }

  const searchReservationsInput = document.getElementById("searchReservations");
  if (searchReservationsInput) {
    searchReservationsInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = allReservations.filter((r) =>
        (r.user_name || "").toLowerCase().includes(query) ||
        (r.user_email || "").toLowerCase().includes(query) ||
        r.origin.toLowerCase().includes(query) ||
        r.destination.toLowerCase().includes(query) ||
        r.seat.toLowerCase().includes(query) ||
        String(r.id).includes(query)
      );
      renderReservationsTable(filtered);
    });
  }

  const searchUsersInput = document.getElementById("searchUsers");
  if (searchUsersInput) {
    searchUsersInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = allUsers.filter((u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        String(u.id).includes(query)
      );
      renderUsersTable(filtered);
    });
  }

  // ── 9. Sistema de Pestañas (Tabs) ──────────────────────────────
  document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      document.querySelectorAll(".admin-tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".admin-section").forEach((sec) => sec.classList.remove("active"));

      btn.classList.add("active");
      const targetSec = document.getElementById(`section-${tabId}`);
      if (targetSec) targetSec.classList.add("active");

      if (tabId === "flights") loadFlights();
      else if (tabId === "reservations") loadReservations();
      else if (tabId === "users") loadUsers();
      else if (tabId === "dashboard") loadStats();
    });
  });

  // ── 10. Logout ─────────────────────────────────────────────────
  const logoutBtn = document.getElementById("adminLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/logout", { method: "POST", credentials: "include" });
      } catch (_) {}
      window.sessionStorage.clear();
      window.location.href = "login.html";
    });
  }

  // ── Utilidades ─────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return "--";
    try {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? timestamp : dateFormatter.format(date);
    } catch {
      return timestamp;
    }
  }

  // ── Inicialización ─────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", async () => {
    const user = await checkAdminAuth();
    if (!user) return;

    await Promise.all([loadStats(), loadFlights(), loadReservations(), loadUsers()]);
  });
})();

