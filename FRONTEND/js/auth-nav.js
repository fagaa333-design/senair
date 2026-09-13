const authStorageKey = "senairAuthenticated";
const isAuthenticated = window.sessionStorage.getItem(authStorageKey) === "true";
const accountName = window.sessionStorage.getItem("senairUserName") || "Usuario";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);
}

function closeSession() {
  fetch("/logout", { method: "POST", credentials: "include" }).catch(() => {});
  window.sessionStorage.removeItem(authStorageKey);
  window.sessionStorage.removeItem("senairUserName");
  window.sessionStorage.removeItem("senairUserEmail");
  window.location.href = "index.html";
}

function updateAuthNavigation() {
  if (!isAuthenticated) return;

  const headerActions = document.querySelector(".header-actions");
  const loginLink = headerActions?.querySelector('a[href="login.html"]');
  if (loginLink) loginLink.hidden = true;

  if (headerActions && !headerActions.querySelector("[data-auth-nav-account]")) {
    const initial = accountName.trim().charAt(0).toUpperCase() || "U";
    const accountMenu = document.createElement("div");
    accountMenu.className = "account-menu auth-nav-account";
    accountMenu.dataset.authNavAccount = "true";
    accountMenu.innerHTML = `<button class="account-trigger" type="button" aria-expanded="false"><span class="account-avatar">${escapeHtml(initial)}</span><span class="account-trigger-name">${escapeHtml(accountName)}</span></button><div class="account-dropdown" hidden><div class="account-summary"><span class="account-avatar account-avatar-large">${escapeHtml(initial)}</span><div><strong class="account-name">${escapeHtml(accountName)}</strong><small class="account-email">${escapeHtml(window.sessionStorage.getItem("senairUserEmail") || "")}</small></div></div><a href="viajes.html">Mis viajes</a><button type="button" data-auth-nav-logout>Cerrar sesión</button></div>`;
    headerActions.append(accountMenu);
    const trigger = accountMenu.querySelector(".account-trigger");
    const dropdown = accountMenu.querySelector(".account-dropdown");
    trigger.addEventListener("click", () => {
      const isOpen = dropdown.hidden;
      dropdown.hidden = !isOpen;
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
    accountMenu.querySelector("[data-auth-nav-logout]").addEventListener("click", closeSession);
  }

  document.querySelectorAll('.mobile-nav a[href="login.html"]').forEach((link) => {
    link.textContent = "Mis viajes";
    link.href = "viajes.html";
  });

  document.querySelectorAll(".mobile-nav").forEach((mobileNav) => {
    if (mobileNav.querySelector("[data-auth-nav-logout]")) return;
    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.textContent = "Cerrar sesión";
    logoutButton.dataset.authNavLogout = "true";
    logoutButton.addEventListener("click", closeSession);
    mobileNav.append(logoutButton);
  });
}

updateAuthNavigation();
