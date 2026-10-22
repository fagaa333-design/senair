/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Controlador de Modo Claro / Oscuro con Switch Sol-Luna
 * El modo predeterminado es SIEMPRE CLARO (Light Mode).
 * Solo se activa el modo oscuro cuando el usuario activa el switch.
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  const STORAGE_KEY = "senair_theme_mode";

  // Limpiar cualquier residuo de la clave anterior que forzó modo oscuro automáticamente
  try {
    if (localStorage.getItem("senair_theme") === "dark" && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.removeItem("senair_theme");
    }
  } catch (e) {}

  function getPreferredTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // Por defecto es SIEMPRE 'light', a menos que el usuario lo haya puesto explícitamente en 'dark'
      return saved === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }

  function syncLoadingVideo(theme) {
    const isDark = theme === "dark";
    const video = document.getElementById("loadingVideo");
    if (!video) return;
    const source = video.querySelector("source");
    const currentSrc = source ? source.getAttribute("src") : "";
    if (isDark && !currentSrc.includes("blackair")) {
      video.innerHTML = `
        <source src="../assets/videos/blackair.mp4" type="video/mp4" />
        <source src="../assets/video/blackair.mp4" type="video/mp4" />
      `;
      video.load();
      video.play().catch(() => {});
    } else if (!isDark && !currentSrc.includes("carga")) {
      video.innerHTML = `
        <source src="../assets/videos/carga%20air%20white.mp4" type="video/mp4" />
        <source src="../assets/video/carga%20air%20white.mp4" type="video/mp4" />
      `;
      video.load();
      video.play().catch(() => {});
    }
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      if (document.body) document.body.classList.add("dark-theme");
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (document.body) document.body.classList.remove("dark-theme");
    }
    updateSwitches(theme);
    syncLoadingVideo(theme);
  }

  function updateSwitches(theme) {
    const isLight = theme === "light";
    document.querySelectorAll(".theme-checkbox, input#checkbox, input#themeCheckbox").forEach((input) => {
      input.checked = isLight;
    });
  }

  window.setSenairTheme = function (theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    applyTheme(theme);
  };

  window.toggleSenairTheme = function () {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    window.setSenairTheme(next);
  };

  // Aplicar inmediatamente al iniciar (evitando flash de pantalla)
  const initialTheme = getPreferredTheme();
  if (initialTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  function createThemeSwitch(isLight) {
    const label = document.createElement("label");
    label.className = "switch theme-switch";
    label.setAttribute("aria-label", "Cambiar entre modo claro y modo oscuro");
    label.setAttribute("title", isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
    label.innerHTML = `
      <input ${isLight ? 'checked="true"' : ''} class="theme-checkbox" id="checkbox" type="checkbox" />
      <span class="slider">
        <div class="star star_1"></div>
        <div class="star star_2"></div>
        <div class="star star_3"></div>
        <svg viewBox="0 0 16 16" class="cloud_1 cloud">
          <path
            transform="matrix(.77976 0 0 .78395-299.99-418.63)"
            fill="#fff"
            d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
          ></path>
        </svg>
      </span>
    `;

    const input = label.querySelector("input");
    input.addEventListener("change", (e) => {
      const targetTheme = e.target.checked ? "light" : "dark";
      window.setSenairTheme(targetTheme);
    });

    return label;
  }

  function injectThemeSwitches() {
    const isLight = document.documentElement.getAttribute("data-theme") !== "dark";

    document.querySelectorAll(".lang-switch").forEach((langSwitch) => {
      const nextEl = langSwitch.nextElementSibling;
      if (nextEl && (nextEl.classList.contains("theme-switch") || nextEl.classList.contains("theme-toggle-btn"))) {
        if (nextEl.classList.contains("theme-toggle-btn")) {
          const sw = createThemeSwitch(isLight);
          nextEl.replaceWith(sw);
        }
        return;
      }
      const sw = createThemeSwitch(isLight);
      langSwitch.after(sw);
    });

    // Enlazar cualquier switch estático en el DOM
    document.querySelectorAll(".theme-switch input, input#checkbox, input#themeCheckbox").forEach((input) => {
      input.checked = isLight;
      input.onchange = (e) => {
        const targetTheme = e.target.checked ? "light" : "dark";
        window.setSenairTheme(targetTheme);
      };
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyTheme(getPreferredTheme());
      injectThemeSwitches();
    });
  } else {
    applyTheme(getPreferredTheme());
    injectThemeSwitches();
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector(".lang-switch:not(+ .theme-switch)")) {
      injectThemeSwitches();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Sistema Global de Alertas Personalizadas (Branded Modals)
 * ═════════════════════════════════════════════════════════════════════════
 */
window.senairAlert = function (options) {
  return new Promise((resolve) => {
    const opts = typeof options === "string" ? { message: options } : options || {};
    const message = String(opts.message || "");
    const isError =
      opts.type === "error" ||
      /error|falló|fallo|incorrect|expir|problema|no se pudo|inválid|bloquead|denegad/i.test(message) ||
      /error|falló|fallo|incorrect|expir|problema|no se pudo|inválid/i.test(opts.title || "");
    const isSuccess = opts.type === "success" || /éxito|exito|correctamente|guardad|completad/i.test(message);

    const type = opts.type || (isSuccess ? "success" : isError ? "error" : "info");
    const title =
      opts.title ||
      (type === "success" ? "¡Operación Exitosa!" : type === "error" ? "Atención" : "SENAIR");
    const confirmText = opts.confirmText || "Entendido";

    let overlay = document.getElementById("senairAlertOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "senairAlertOverlay";
      overlay.className = "senair-alert-overlay";
      overlay.innerHTML = `
        <div class="senair-alert-box" role="dialog" aria-modal="true">
          <button type="button" class="senair-alert-close" aria-label="Cerrar">&times;</button>
          <div class="senair-alert-icon-wrap" id="senairAlertIcon"></div>
          <h3 class="senair-alert-title" id="senairAlertTitle"></h3>
          <p class="senair-alert-message" id="senairAlertMessage"></p>
          <div class="senair-alert-actions">
            <button type="button" class="senair-alert-btn" id="senairAlertBtn"></button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    const titleEl = overlay.querySelector("#senairAlertTitle");
    const msgEl = overlay.querySelector("#senairAlertMessage");
    const iconEl = overlay.querySelector("#senairAlertIcon");
    const btnEl = overlay.querySelector("#senairAlertBtn");
    const closeBtn = overlay.querySelector(".senair-alert-close");

    titleEl.textContent = title;
    msgEl.textContent = message;
    btnEl.textContent = confirmText;

    iconEl.className = "senair-alert-icon-wrap " + type;
    if (type === "success") {
      iconEl.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
    } else if (type === "error") {
      iconEl.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
      iconEl.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    let closed = false;
    function cleanup() {
      if (closed) return;
      closed = true;
      overlay.classList.remove("is-visible");
      document.removeEventListener("keydown", onKeyDown);
      btnEl.onclick = null;
      closeBtn.onclick = null;
      overlay.onclick = null;
      if (typeof opts.onConfirm === "function") {
        try {
          opts.onConfirm();
        } catch (e) {
          console.error(e);
        }
      }
      resolve(true);
    }

    function onKeyDown(e) {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        cleanup();
      }
    }

    btnEl.onclick = cleanup;
    closeBtn.onclick = cleanup;
    overlay.onclick = (e) => {
      if (e.target === overlay) cleanup();
    };
    document.addEventListener("keydown", onKeyDown);

    overlay.classList.add("is-visible");
    setTimeout(() => {
      try {
        btnEl.focus();
      } catch (e) {}
    }, 60);
  });
};

if (typeof window !== "undefined") {
  window.alert = function (message) {
    return window.senairAlert(message);
  };
}
