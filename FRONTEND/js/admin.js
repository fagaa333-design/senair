/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Panel de Administración (Frontend Logic)
 * 100% Funcional: Edición y Borrado de Vuelos, Usuarios y Reservas
 * Sin Alertas Bloqueantes del Navegador (In-App Confirm Modals)
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

  // ── 2.1. Modal de Confirmación In-App (Sin alertas de Google/Browser) ─
  let confirmResolve = null;

  function showConfirmModal({ title = "Confirmar Acción", message = "¿Estás seguro?", acceptText = "Confirmar", isDanger = true }) {
    const modal = document.getElementById("adminConfirmModalOverlay");
    const titleEl = document.getElementById("confirmModalTitle");
    const msgEl = document.getElementById("confirmModalMessage");
    const acceptBtn = document.getElementById("confirmModalAcceptBtn");

    if (!modal) {
      // Fallback seguro en caso de que no exista el modal en el DOM
      return Promise.resolve(window.confirm(message));
    }

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (acceptBtn) {
      acceptBtn.textContent = acceptText;
      acceptBtn.className = isDanger ? "btn-danger" : "btn-primary";
    }

    modal.classList.add("is-open");

    return new Promise((resolve) => {
      confirmResolve = resolve;
    });
  }

  function closeConfirmModal(result = false) {
    const modal = document.getElementById("adminConfirmModalOverlay");
    if (modal) modal.classList.remove("is-open");
    if (typeof confirmResolve === "function") {
      confirmResolve(result);
      confirmResolve = null;
    }
  }

  // ── 3. Carga de Estadísticas / KPIs ────────────────────────────
  async function loadStats() {
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      const data = await res.json();
      if (!data.success) return;

      const { stats, recentReservations, maintenanceMode } = data;
      const elUsers = document.getElementById("statUsers");
      const elFlights = document.getElementById("statFlights");
      const elRes = document.getElementById("statReservations");
      const elRev = document.getElementById("statRevenue");

      if (elUsers) elUsers.textContent = stats.totalUsers;
      if (elFlights) elFlights.textContent = stats.totalFlights;
      if (elRes) elRes.textContent = stats.totalReservations;
      if (elRev) elRev.textContent = copFormatter.format(stats.totalRevenue);

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

  // ── 4. Gestión de Vuelos (CRUD Completo) ─────────────────────────
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
          <small style="font-weight:700; color:var(--blue);">${escapeHtml(String(f.departure_time || "").slice(0, 5))} - ${escapeHtml(String(f.arrival_time || "").slice(0, 5))}</small>
        </td>
        <td><strong>${copFormatter.format(f.price)}</strong></td>
        <td>${escapeHtml(f.airline || "SENAIR")}</td>
        <td>
          ${Number(f.stops) === 0
            ? '<span class="badge badge-direct">Directo</span>'
            : `<span class="badge badge-stop">${f.stops} Escala${Number(f.stops) > 1 ? "s" : ""}</span>`}
        </td>
        <td>
          <span style="font-weight:700;">${f.bookings_count || 0}</span> pasajes
        </td>
        <td>
          <div class="action-buttons">
            <button type="button" class="btn-icon edit" title="Editar Vuelo" data-action="edit-flight" data-id="${f.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button type="button" class="btn-icon delete" title="Eliminar Vuelo" data-action="delete-flight" data-id="${f.id}">
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

  function adminOpenCreateFlight() {
    if (!flightForm || !flightModalOverlay) return;
    flightForm.reset();
    const titleEl = document.getElementById("flightModalTitle");
    if (titleEl) titleEl.textContent = "Nuevo Vuelo SENAIR";
    document.getElementById("flightId").value = "";
    document.getElementById("airline").value = "SENAIR";
    document.getElementById("stops").value = "0";

    // Fecha mínima hoy por defecto
    const today = new Date().toISOString().split("T")[0];
    const depDateInput = document.getElementById("departureDate");
    if (depDateInput) depDateInput.value = today;

    flightModalOverlay.classList.add("is-open");
  }

  function adminOpenEditFlight(id) {
    const flight = allFlights.find((f) => Number(f.id) === Number(id));
    if (!flight || !flightForm || !flightModalOverlay) {
      showToast("Vuelo no encontrado en memoria", "error");
      return;
    }

    const titleEl = document.getElementById("flightModalTitle");
    if (titleEl) titleEl.textContent = `Editar Vuelo #${flight.id}`;

    document.getElementById("flightId").value = flight.id;
    document.getElementById("origin").value = flight.origin || "";
    document.getElementById("destination").value = flight.destination || "";
    document.getElementById("departureDate").value = flight.departure_date || "";
    document.getElementById("departureTime").value = String(flight.departure_time || "").slice(0, 5);
    document.getElementById("arrivalTime").value = String(flight.arrival_time || "").slice(0, 5);
    document.getElementById("price").value = flight.price || "";
    document.getElementById("airline").value = flight.airline || "SENAIR";
    document.getElementById("stops").value = String(flight.stops ?? 0);

    flightModalOverlay.classList.add("is-open");
  }

  function adminCloseFlightModal() {
    if (flightModalOverlay) flightModalOverlay.classList.remove("is-open");
  }

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

      const saveBtn = document.getElementById("btnSaveFlight");
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Guardando...";
      }

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
      } catch (err) {
        console.error("Error al guardar vuelo:", err);
        showToast("Error de conexión con el servidor", "error");
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar Vuelo";
        }
      }
    });
  }

  async function adminDeleteFlight(id) {
    const flight = allFlights.find((f) => Number(f.id) === Number(id));
    const flightLabel = flight ? `${flight.origin} → ${flight.destination} (${flight.departure_date})` : `Vuelo #${id}`;

    const confirmed = await showConfirmModal({
      title: `¿Eliminar Vuelo #${id}?`,
      message: `¿Estás seguro de que deseas eliminar permanentemente el vuelo #${id} (${flightLabel})? Esta acción lo quitará del itinerario de SENAIR.`,
      acceptText: "Eliminar Vuelo",
      isDanger: true,
    });

    if (!confirmed) return;

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
      showToast("Vuelo eliminado del sistema con éxito", "success");
      await loadFlights();
      await loadStats();
    } catch {
      showToast("Error de conexión al eliminar vuelo", "error");
    }
  }

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
          <div style="font-weight:700;">${escapeHtml(r.passenger_name || r.user_name || "Pasajero")}</div>
          <small style="color:var(--muted);">${escapeHtml(r.passenger_email || r.user_email || "")}</small>
        </td>
        <td>${escapeHtml(r.origin)} → ${escapeHtml(r.destination)}</td>
        <td>
          <div>${escapeHtml(r.departure_date)}</div>
          <small style="color:var(--muted); font-weight:600;">${escapeHtml(String(r.departure_time || "").slice(0, 5))}</small>
        </td>
        <td><span class="badge badge-confirmed">Asiento ${escapeHtml(r.seat)}</span></td>
        <td><strong>${copFormatter.format(r.price)}</strong></td>
        <td style="font-size:12px; color:var(--muted);">${formatTimestamp(r.created_at)}</td>
        <td>
          <button type="button" class="btn-icon delete" title="Cancelar Reserva" data-action="delete-reservation" data-id="${r.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </td>
      </tr>
    `).join("");
  }

  async function adminDeleteReservation(id) {
    const confirmed = await showConfirmModal({
      title: `¿Cancelar Reserva #${String(id).padStart(4, "0")}?`,
      message: `¿Deseas anular esta reserva? El asiento asignado quedará inmediatamente liberado en la cabina para otros viajeros.`,
      acceptText: "Anular Reserva",
      isDanger: true,
    });

    if (!confirmed) return;

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
      await loadFlights();
    } catch {
      showToast("Error de conexión al cancelar reserva", "error");
    }
  }

  // ── 6. Gestión de Usuarios (CRUD Completo) ─────────────────────
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

    tbody.innerHTML = users.map((u) => {
      const isSuperAdmin = u.email === "freinergudino@gmail.com";
      return `
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
            ${isSuperAdmin
              ? '<small style="color:var(--muted); font-weight:700;">Superadmin</small>'
              : `<div class="action-buttons">
                   <button type="button" class="btn-icon edit" title="Editar Usuario" data-action="edit-user" data-id="${u.id}">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                   </button>
                   <button type="button" class="btn-icon delete" title="Eliminar Usuario" data-action="delete-user" data-id="${u.id}">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                   </button>
                 </div>`}
          </td>
        </tr>
      `;
    }).join("");
  }

  // Modal para Crear / Editar Usuario
  const userModalOverlay = document.getElementById("userModalOverlay");
  const userForm = document.getElementById("userForm");

  function adminOpenCreateUser() {
    if (!userForm || !userModalOverlay) return;
    userForm.reset();
    document.getElementById("userModalTitle").textContent = "Nuevo Usuario SENAIR";
    document.getElementById("userId").value = "";
    document.getElementById("userRole").value = "user";

    const pwInput = document.getElementById("userPassword");
    const pwNote = document.getElementById("userPasswordNote");
    if (pwInput) {
      pwInput.required = true;
      pwInput.placeholder = "Mínimo 8 caracteres";
    }
    if (pwNote) pwNote.textContent = "(mínimo 8 caracteres)";

    userModalOverlay.classList.add("is-open");
  }

  function adminOpenEditUser(id) {
    const user = allUsers.find((u) => Number(u.id) === Number(id));
    if (!user || !userForm || !userModalOverlay) {
      showToast("Usuario no encontrado", "error");
      return;
    }

    document.getElementById("userModalTitle").textContent = `Editar Usuario #${user.id}`;
    document.getElementById("userId").value = user.id;
    document.getElementById("userName").value = user.name || "";
    document.getElementById("userEmail").value = user.email || "";
    document.getElementById("userRole").value = user.role || "user";

    const pwInput = document.getElementById("userPassword");
    const pwNote = document.getElementById("userPasswordNote");
    if (pwInput) {
      pwInput.value = "";
      pwInput.required = false;
      pwInput.placeholder = "Dejar en blanco para conservar actual";
    }
    if (pwNote) pwNote.textContent = "(dejar en blanco para no modificar)";

    userModalOverlay.classList.add("is-open");
  }

  function adminCloseUserModal() {
    if (userModalOverlay) userModalOverlay.classList.remove("is-open");
  }

  if (userForm) {
    userForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userId = document.getElementById("userId").value;
      const isEdit = Boolean(userId);

      const name = document.getElementById("userName").value.trim();
      const email = document.getElementById("userEmail").value.trim();
      const role = document.getElementById("userRole").value;
      const password = document.getElementById("userPassword").value;

      if (!name || name.length < 2) {
        showToast("Ingresa un nombre válido (mínimo 2 letras)", "error");
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Ingresa un correo electrónico con formato válido", "error");
        return;
      }
      if (!isEdit && (!password || password.length < 8)) {
        showToast("La contraseña debe tener al menos 8 caracteres", "error");
        return;
      }

      const saveBtn = document.getElementById("btnSaveUser");
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Guardando...";
      }

      const payload = { name, email, role };
      if (password && password.length >= 8) {
        payload.password = password;
      }

      try {
        const url = isEdit ? `/api/admin/users/${userId}` : "/api/admin/users";
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          showToast(result.message || "No se pudo guardar el usuario", "error");
          return;
        }

        showToast(result.message || "Usuario guardado con éxito", "success");
        adminCloseUserModal();
        await loadUsers();
        await loadStats();
      } catch (err) {
        console.error("Error al guardar usuario:", err);
        showToast("Error de conexión al guardar usuario", "error");
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar Usuario";
        }
      }
    });
  }

  async function adminDeleteUser(id) {
    const user = allUsers.find((u) => Number(u.id) === Number(id));
    const userName = user ? user.name : `Usuario #${id}`;

    const confirmed = await showConfirmModal({
      title: `¿Eliminar Cuenta de ${userName}?`,
      message: `¿Deseas eliminar permanentemente la cuenta de ${userName} (${user ? user.email : ""})? Se cancelarán y eliminarán también todas sus reservas asociadas.`,
      acceptText: "Eliminar Usuario",
      isDanger: true,
    });

    if (!confirmed) return;

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
      showToast("Usuario y sus reservas eliminados con éxito", "success");
      await loadUsers();
      await loadStats();
      await loadReservations();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      showToast("Error de conexión al eliminar usuario", "error");
    }
  }

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
  function adminExportData(type, format) {
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
      showToast("No hay datos para exportar en este momento", "error");
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
  }

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
        (r.passenger_name || r.user_name || "").toLowerCase().includes(query) ||
        (r.passenger_email || r.user_email || "").toLowerCase().includes(query) ||
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
      else if (tabId === "survey") loadSurveyData();
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

  // ── 11. Encuesta Interactiva Feria de Software ─────────────────
  async function loadSurveyData() {
    try {
      const res = await fetch("/api/admin/survey/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Error HTTP " + res.status);
      const data = await res.json();
      if (!data.success) return;

      const stats = data.stats;
      const kpiTotal = document.getElementById("kpiSurveyTotal");
      const kpiComp = document.getElementById("kpiSurveyCompleted");
      const kpiRate = document.getElementById("kpiSurveyCompletionRate");
      const kpiRating = document.getElementById("kpiSurveyAvgRating");

      if (kpiTotal) kpiTotal.textContent = stats.total;
      if (kpiComp) kpiComp.textContent = stats.completed;
      if (kpiRate) kpiRate.textContent = stats.completionRate + "% tasa de finalización";
      if (kpiRating) kpiRating.textContent = stats.avgRating + " / 5";

      // Renderizar distribuciones
      renderSurveyDistributions(stats.distributions || {});

      // Renderizar participantes recientes
      renderSurveyParticipants(stats.recentParticipants || []);

      // Cargar código QR
      loadSurveyQr();
    } catch (e) {
      console.error("Error al cargar datos de encuesta:", e);
      showToast("Error al cargar datos de la encuesta", "error");
    }
  }

  function renderSurveyDistributions(distributions) {
    const container = document.getElementById("surveyDistributionsContainer");
    if (!container) return;

    const keys = Object.keys(distributions);
    if (keys.length === 0) {
      container.innerHTML = '<p style="color:var(--muted); font-size:14px;">Aún no se han registrado respuestas en la encuesta.</p>';
      return;
    }

    let html = "";
    keys.forEach((qid) => {
      const dist = distributions[qid];
      const totalAnswers = dist.answers.reduce((acc, a) => acc + a.count, 0);

      html += `
        <div style="border-bottom: 1px solid var(--border); padding-bottom: 14px;">
          <h4 style="margin: 0 0 10px; font-size: 14.5px; color: var(--navy);">${escapeHtml(dist.title)}</h4>
          <div>
            ${dist.answers.map((ans) => {
              const pct = totalAnswers > 0 ? Math.round((ans.count / totalAnswers) * 100) : 0;
              return `
                <div class="survey-dist-bar-wrap">
                  <div class="survey-dist-info">
                    <span style="color:var(--text);">${escapeHtml(ans.answer)}</span>
                    <span style="color:var(--muted);">${ans.count} (${pct}%)</span>
                  </div>
                  <div class="survey-dist-track">
                    <div class="survey-dist-fill" style="width: ${pct}%;"></div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderSurveyParticipants(participants) {
    const tbody = document.getElementById("surveyParticipantsTableBody");
    if (!tbody) return;

    if (!participants || participants.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>No hay participantes registrados aún.</p></td></tr>';
      return;
    }

    tbody.innerHTML = participants.map((p) => `
      <tr>
        <td><strong>#${p.id}</strong></td>
        <td>${formatTimestamp(p.created_at)}</td>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${p.email ? escapeHtml(p.email) : '<span style="color:var(--muted); font-style:italic;">No provisto</span>'}</td>
        <td>${escapeHtml(p.city || "--")}</td>
        <td>${escapeHtml(p.age_range || "--")}</td>
        <td><span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700;">${escapeHtml(p.traveler_profile || "Sin asignar")}</span></td>
        <td><span class="badge badge-${p.status === 'completed' ? 'confirmed' : 'cancelled'}">${p.status === 'completed' ? 'Completada' : 'En progreso'}</span></td>
      </tr>
    `).join("");
  }

  async function loadSurveyQr(customUrl) {
    const previewImg = document.getElementById("surveyQrPreview");
    const downloadLink = document.getElementById("surveyDownloadQrLink");
    const urlDisplay = document.getElementById("surveyQrUrlDisplay");
    const urlInput = document.getElementById("surveyCustomUrlInput");

    const targetUrl = customUrl || (urlInput && urlInput.value.trim()) || (window.location.origin + "/encuesta.html");
    if (urlInput && !urlInput.value) {
      urlInput.value = targetUrl;
    }

    try {
      const res = await fetch(`/api/survey/qr?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      if (data.success && data.qrDataUrl) {
        if (previewImg) previewImg.src = data.qrDataUrl;
        if (downloadLink) downloadLink.href = data.qrDataUrl;
        if (urlDisplay) urlDisplay.textContent = data.targetUrl;
      }
    } catch (e) {
      console.warn("No se pudo cargar QR:", e);
    }
  }

  const refreshSurveyBtn = document.getElementById("refreshSurveyBtn");
  if (refreshSurveyBtn) {
    refreshSurveyBtn.addEventListener("click", () => {
      loadSurveyData();
      showToast("Métricas de encuesta actualizadas", "success");
    });
  }

  const surveyRegenerateQrBtn = document.getElementById("surveyRegenerateQrBtn");
  if (surveyRegenerateQrBtn) {
    surveyRegenerateQrBtn.addEventListener("click", () => {
      const input = document.getElementById("surveyCustomUrlInput");
      const url = input?.value.trim();
      loadSurveyQr(url);
      showToast("Código QR actualizado con nueva URL", "success");
    });
  }

  // ── 12. Delegación Global de Eventos (Cero Bloqueo CSP) ─────────
  document.addEventListener("click", async (e) => {
    // 1. Botón de aceptar confirmación
    if (e.target.closest("#confirmModalAcceptBtn")) {
      closeConfirmModal(true);
      return;
    }

    // 2. Botón de cancelar confirmación o cerrar modal de confirmación
    if (e.target.closest("#confirmModalCancelBtn, [data-action='close-confirm-modal']")) {
      closeConfirmModal(false);
      return;
    }

    // 3. Clic fuera de los modales (en el backdrop overlay)
    if (e.target.classList.contains("admin-modal-overlay")) {
      if (e.target.id === "adminConfirmModalOverlay") {
        closeConfirmModal(false);
      } else {
        e.target.classList.remove("is-open");
      }
      return;
    }

    // 4. Botones con data-action
    const actionBtn = e.target.closest("[data-action]");
    if (!actionBtn) return;

    const action = actionBtn.getAttribute("data-action");
    const id = actionBtn.getAttribute("data-id");

    switch (action) {
      case "open-create-flight":
        e.preventDefault();
        adminOpenCreateFlight();
        break;

      case "edit-flight":
        e.preventDefault();
        adminOpenEditFlight(id);
        break;

      case "delete-flight":
        e.preventDefault();
        adminDeleteFlight(id);
        break;

      case "close-flight-modal":
        e.preventDefault();
        adminCloseFlightModal();
        break;

      case "open-create-user":
        e.preventDefault();
        adminOpenCreateUser();
        break;

      case "edit-user":
        e.preventDefault();
        adminOpenEditUser(id);
        break;

      case "delete-user":
        e.preventDefault();
        adminDeleteUser(id);
        break;

      case "close-user-modal":
        e.preventDefault();
        adminCloseUserModal();
        break;

      case "delete-reservation":
        e.preventDefault();
        adminDeleteReservation(id);
        break;

      case "export-data":
        e.preventDefault();
        const exportType = actionBtn.getAttribute("data-export-type") || "flights";
        const exportFormat = actionBtn.getAttribute("data-export-format") || "csv";
        adminExportData(exportType, exportFormat);
        break;
    }
  });

  // Cerrar modales con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeConfirmModal(false);
      adminCloseFlightModal();
      adminCloseUserModal();
    }
  });

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

  // Exportar al ámbito global para compatibilidad
  window.adminOpenCreateFlight = adminOpenCreateFlight;
  window.adminOpenEditFlight = adminOpenEditFlight;
  window.adminCloseFlightModal = adminCloseFlightModal;
  window.adminDeleteFlight = adminDeleteFlight;
  window.adminOpenCreateUser = adminOpenCreateUser;
  window.adminOpenEditUser = adminOpenEditUser;
  window.adminCloseUserModal = adminCloseUserModal;
  window.adminDeleteUser = adminDeleteUser;
  window.adminDeleteReservation = adminDeleteReservation;
  window.adminExportData = adminExportData;

  // ── Inicialización ─────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", async () => {
    const user = await checkAdminAuth();
    if (!user) return;

    await Promise.all([loadStats(), loadFlights(), loadReservations(), loadUsers()]);
  });
})();
