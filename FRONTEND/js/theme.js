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
