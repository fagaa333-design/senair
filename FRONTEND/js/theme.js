/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Controlador de Tema Claro / Oscuro (Light & Dark Mode)
 * Permite alternar entre modo claro y oscuro, ubicado al lado del selector
 * de idioma (ES | EN), conservando el azul de la marca y oscureciendo el blanco.
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  const STORAGE_KEY = "senair_theme";

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      if (document.body) document.body.classList.add("dark-theme");
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (document.body) document.body.classList.remove("dark-theme");
    }
    updateButtons(theme);
  }

  function updateButtons(theme) {
    document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
      const isDark = theme === "dark";
      btn.classList.toggle("is-dark", isDark);
      btn.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      btn.setAttribute("title", isDark ? "Modo Claro" : "Modo Oscuro");
    });
  }

  window.toggleSenairTheme = function () {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  // Aplicar inmediatamente para evitar flash de fondo blanco
  const initialTheme = getPreferredTheme();
  if (initialTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  function createThemeButton(isDark) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `theme-toggle-btn ${isDark ? "is-dark" : ""}`;
    btn.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    btn.setAttribute("title", isDark ? "Modo Claro" : "Modo Oscuro");
    btn.innerHTML = `
      <svg class="theme-icon-moon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      <svg class="theme-icon-sun" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
    `;
    btn.addEventListener("click", window.toggleSenairTheme);
    return btn;
  }

  function injectThemeButtons() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.querySelectorAll(".lang-switch").forEach((langSwitch) => {
      const nextEl = langSwitch.nextElementSibling;
      if (nextEl && nextEl.classList.contains("theme-toggle-btn")) return;
      const btn = createThemeButton(isDark);
      langSwitch.after(btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyTheme(getPreferredTheme());
      injectThemeButtons();
    });
  } else {
    applyTheme(getPreferredTheme());
    injectThemeButtons();
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector(".lang-switch:not(+ .theme-toggle-btn)")) {
      injectThemeButtons();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
