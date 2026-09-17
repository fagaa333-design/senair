/**
 * ============================================================
 * SENAIR — Sistema de Internacionalización (i18n ES / EN)
 * ============================================================
 */

(function () {
  "use strict";

  const STORAGE_KEY = "senair_lang";

  // Diccionario de traducciones clave y frases comunes de la interfaz
  const TRANSLATIONS = {
    es: {
      "topbar.tagline": "Viaja con tranquilidad. Atención 24/7.",
      "nav.flights": "Vuelos",
      "nav.destinations": "Destinos",
      "nav.offers": "Ofertas",
      "nav.contact": "Contacto",
      "nav.login": "Iniciar Sesión",
      "nav.my_trips": "Mis viajes",
      "nav.manage": "Gestionar reserva",
      "nav.logout": "Cerrar sesión",
      "nav.user": "Usuario",
      "nav.ai_assistant": "Asistente Virtual SENAIR",
      "footer.tagline": "Conectando destinos, impulsando oportunidades.",
      "footer.about": "Sobre nosotros",
      "footer.help": "Ayuda",
      "footer.legal": "Legal",
      "footer.terms": "Términos y condiciones",
      "footer.privacy": "Política de privacidad",
      "footer.copyright": "© 2026 SENAIR. Todos los derechos reservados.",
      "footer.locale": "Colombia · COP · Español",
      // Chatbot
      "ai.welcome_badge": "✨ Asistencia Inteligente",
      "ai.welcome_msg": "¡Hola! Soy AeroBot, tu asistente virtual con IA en SENAIR. Estoy listo para ayudarte con vuelos, equipaje, cuotas de pago y millas al instante.",
      "ai.input_placeholder": "Pregúntale a AeroBot sobre vuelos, cuotas...",
      "ai.subtitle": "En línea · Atención 24/7",
      "ai.chip_routes": "✈️ Rutas y vuelos",
      "ai.chip_installments": "💳 Pago en cuotas",
      "ai.chip_baggage": "🎒 Equipaje permitido",
      "ai.chip_miles": "⭐ Millas Rewards",
      "ai.chip_team": "👥 Equipo SENAIR"
    },
    en: {
      "topbar.tagline": "Travel with peace of mind. 24/7 Support.",
      "nav.flights": "Flights",
      "nav.destinations": "Destinations",
      "nav.offers": "Offers",
      "nav.contact": "Contact",
      "nav.login": "Log In",
      "nav.my_trips": "My Trips",
      "nav.manage": "Manage Booking",
      "nav.logout": "Log Out",
      "nav.user": "User",
      "nav.ai_assistant": "SENAIR Virtual Assistant",
      "footer.tagline": "Connecting destinations, inspiring opportunities.",
      "footer.about": "About Us",
      "footer.help": "Help",
      "footer.legal": "Legal",
      "footer.terms": "Terms & Conditions",
      "footer.privacy": "Privacy Policy",
      "footer.copyright": "© 2026 SENAIR. All rights reserved.",
      "footer.locale": "Colombia · COP · English",
      // Chatbot
      "ai.welcome_badge": "✨ Smart AI Assistant",
      "ai.welcome_msg": "Hello! I'm AeroBot, your SENAIR virtual assistant. I'm ready to assist you with flights, baggage policies, installment payment plans and miles in real time.",
      "ai.input_placeholder": "Ask AeroBot about flights, installments...",
      "ai.subtitle": "Online · 24/7 Support",
      "ai.chip_routes": "✈️ Routes & flights",
      "ai.chip_installments": "💳 Installment plans",
      "ai.chip_baggage": "🎒 Baggage allowance",
      "ai.chip_miles": "⭐ Rewards miles",
      "ai.chip_team": "👥 SENAIR Team"
    }
  };

  // Mapeo bidireccional de textos exactos de interfaz (Español <-> Inglés)
  const PHRASE_MAP = [
    // Topbar y Navbar
    ["Viaja con tranquilidad. Atención 24/7.", "Travel with peace of mind. 24/7 Support."],
    ["Iniciar Sesión", "Log In"],
    ["Iniciar sesión", "Log In"],
    ["Cerrar sesión", "Log Out"],
    ["Gestionar reserva", "Manage Booking"],
    ["Mis viajes", "My Trips"],
    ["Vuelos", "Flights"],
    ["Destinos", "Destinations"],
    ["Ofertas", "Offers"],
    ["Contacto", "Contact"],
    ["Sobre nosotros", "About Us"],
    ["Usuario", "User"],

    // Home / Hero / Buscador
    ["Encuentra tu próximo vuelo", "Find your next flight"],
    ["Ida y vuelta", "Round Trip"],
    ["Solo ida", "One Way"],
    ["Origen", "Origin"],
    ["Destino", "Destination"],
    ["Fecha ida", "Departure Date"],
    ["Fecha regreso", "Return Date"],
    ["Pasajeros", "Passengers"],
    ["Pasajero", "Passenger"],
    ["Buscar vuelos", "Search Flights"],
    ["Adultos (12+ años)", "Adults (12+ yrs)"],
    ["Niños (2-11 años)", "Children (2-11 yrs)"],
    ["Bebés (<2 años)", "Infants (<2 yrs)"],
    ["Clase Económica", "Economy Class"],
    ["Clase Ejecutiva", "Business Class"],
    ["Aplicar", "Apply"],
    ["Elige tu próxima historia", "Choose your next journey"],
    ["Ofertas que te llevan más lejos.", "Offers that take you further."],
    ["Explorar ofertas", "Explore Offers"],
    ["Destinos Populares", "Popular Destinations"],
    ["Explora los rincones más fascinantes de Colombia y el mundo con tarifas excepcionales.", "Explore the most fascinating destinations in Colombia with exceptional fares."],
    ["Ver todos los destinos", "View all destinations"],
    ["¿Por qué elegir SENAIR?", "Why choose SENAIR?"],
    ["Puntualidad garantizada", "Guaranteed Punctuality"],
    ["Mejor tarifa garantizada", "Best Fare Guaranteed"],
    ["Atención 24/7", "24/7 Customer Care"],
    ["Preguntas frecuentes", "Frequently Asked Questions"],
    ["¿Cómo puedo cambiar o cancelar mi vuelo?", "How can I change or cancel my flight?"],
    ["¿Cuánto equipaje puedo llevar?", "How much baggage can I carry?"],
    ["¿Cómo realizo el check-in online?", "How do I check in online?"],

    // Vuelos / Filtros / Cards
    ["Encuentra tu próxima ruta", "Find your next route"],
    ["Vuelos disponibles", "Available Flights"],
    ["Vuelo directo", "Direct Flight"],
    ["Seleccionar", "Select"],
    ["Seleccionar asientos", "Select seats"],
    ["Realizar pago", "Proceed to payment"],
    ["Confirmar reserva", "Confirm Booking"],
    ["Equipaje incluido", "Baggage included"],
    ["Desde", "From"],
    ["Precio final por pasajero", "Final price per passenger"],
    ["Duración", "Duration"],
    ["Filtrar por", "Filter by"],
    ["Todos", "All"],
    ["Todas", "All"],
    ["Playa", "Beach"],
    ["Ciudad", "City"],
    ["Naturaleza", "Nature"],

    // Destinos
    ["Tu próxima historia empieza aquí", "Your next journey starts here"],
    ["Hay un lugar esperando por ti.", "There is a place waiting for you."],
    ["Ver vuelos", "View flights"],
    ["Conoce más", "Learn more"],

    // Contacto
    ["Estamos para ayudarte", "We are here to help"],
    ["Hablemos de tu próximo viaje.", "Let's talk about your next trip."],
    ["¿Tienes una pregunta, necesitas ayuda con una reserva o quieres compartir una idea? El equipo SENAIR está listo para escucharte.", "Have a question, need help with a reservation, or want to share an idea? The SENAIR team is ready to assist you."],
    ["Nombre completo", "Full name"],
    ["Correo electrónico", "Email address"],
    ["Mensaje", "Message"],
    ["Enviar mensaje", "Send Message"],
    ["Enviar", "Send"],
    ["Línea de atención nacional", "National support helpline"],
    ["Horario de atención", "Working hours"],
    ["Lunes a domingo, 24 horas", "Monday to Sunday, 24/7"],

    // Mis viajes / Millas
    ["Tus destinos favoritos y viajes guardados en SENAIR.", "Your favorite destinations and saved trips on SENAIR."],
    ["Tus reservas y favoritos", "Your bookings and favorites"],
    ["Reservas confirmadas", "Confirmed Bookings"],
    ["Programa de Millas SENAIR Rewards", "SENAIR Rewards Miles Program"],
    ["Millas acumuladas", "Accumulated Miles"],
    ["Nivel actual", "Current tier"],
    ["Próximo viaje", "Next trip"],
    ["No tienes reservas activas por ahora.", "You have no active bookings right now."],

    // Nosotros
    ["Conócenos", "About Us"],
    ["Somos SENAIR.", "We are SENAIR."],
    ["Conectamos personas con sus destinos a través de una plataforma sencilla, confiable y pensada para cada viajero colombiano.", "We connect people with their destinations through a simple, reliable platform tailored for every Colombian traveler."],
    ["Nuestra misión", "Our Mission"],
    ["Facilitar la búsqueda, reserva y gestión de vuelos, acercando a las personas a los lugares y momentos que más importan.", "Facilitate flight search, booking and management, bringing people closer to the places and moments that matter most."],
    ["Nuestra visión", "Our Vision"],
    ["Ser la plataforma de viajes preferida en Colombia, reconocida por su transparencia, atención y facilidad de uso.", "To be Colombia's preferred travel platform, recognized for transparency, service and ease of use."],
    ["Nuestros valores", "Our Values"],
    ["Confianza, cercanía con el viajero, mejora constante y compromiso con la calidad del servicio en cada etapa del viaje.", "Trust, customer closeness, continuous improvement, and dedication to service quality at every stage of the journey."],
    ["El equipo detrás de SENAIR", "The team behind SENAIR"],
    ["Coordinación y Desarrollo Full Stack", "Full Stack Coordination & Development"],
    ["Diseño UI/UX y Frontend", "UI/UX Design & Frontend"],
    ["Arquitectura y Desarrollo", "Architecture & Development"],
    ["Desarrollo de Sistemas y QA", "Systems Development & QA"],

    // Login
    ["Bienvenido a SENAIR", "Welcome to SENAIR"],
    ["Regístrate", "Sign Up"],
    ["Contraseña", "Password"],
    ["Confirmar contraseña", "Confirm password"],
    ["¿Olvidaste tu contraseña?", "Forgot your password?"],
    ["¿No tienes cuenta?", "Don't have an account?"],
    ["¿Ya tienes cuenta?", "¿Already have an account?"],

    // Legal / Footer
    ["Información legal", "Legal Information"],
    ["Términos y condiciones", "Terms and Conditions"],
    ["Política de privacidad", "Privacy Policy"],
    ["© 2026 SENAIR. Todos los derechos reservados.", "© 2026 SENAIR. All rights reserved."],
    ["Colombia · COP · Español", "Colombia · COP · English"],
    ["Última actualización: 11 de septiembre de 2026", "Last updated: September 11, 2026"]
  ];

  // Mapas compilados para búsqueda rápida
  const ES_TO_EN = new Map();
  const EN_TO_ES = new Map();

  PHRASE_MAP.forEach(([es, en]) => {
    ES_TO_EN.set(es.trim(), en.trim());
    EN_TO_ES.set(en.trim(), es.trim());
  });

  function getCurrentLanguage() {
    return localStorage.getItem(STORAGE_KEY) || "es";
  }

  function setLanguage(lang) {
    if (lang !== "es" && lang !== "en") lang = "es";
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    applyTranslations(lang);
    updateSwitcherButtons(lang);

    // Disparar evento personalizado para que otros módulos (como el chatbot) reaccionen
    window.dispatchEvent(new CustomEvent("senair:langchange", { detail: { lang } }));
  }

  function updateSwitcherButtons(lang) {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const btnLang = btn.getAttribute("data-lang");
      if (btnLang === lang) {
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  function translateText(text, targetLang) {
    if (!text || typeof text !== "string") return text;
    const clean = text.trim();
    if (!clean) return text;

    if (targetLang === "en") {
      if (ES_TO_EN.has(clean)) return ES_TO_EN.get(clean);
    } else {
      if (EN_TO_ES.has(clean)) return EN_TO_ES.get(clean);
    }

    return text;
  }

  function applyTranslations(targetLang) {
    // 1. Elementos explícitos con data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (TRANSLATIONS[targetLang] && TRANSLATIONS[targetLang][key]) {
        el.textContent = TRANSLATIONS[targetLang][key];
      }
    });

    // 2. Traducción contextual en nodos de texto del documento
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (["script", "style", "code", "pre", "textarea"].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest(".ai-messages-list, .lang-switch")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodesToTranslate = [];
    while (walker.nextNode()) {
      nodesToTranslate.push(walker.currentNode);
    }

    nodesToTranslate.forEach((node) => {
      const original = node.nodeValue;
      const leadingSpace = original.match(/^\s*/)[0];
      const trailingSpace = original.match(/\s*$/)[0];
      const core = original.trim();

      const translated = translateText(core, targetLang);
      if (translated !== core) {
        node.nodeValue = leadingSpace + translated + trailingSpace;
      }
    });

    // 3. Traducir atributos comunes (placeholder, title, aria-label)
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((input) => {
      const ph = input.getAttribute("placeholder");
      if (ph) {
        const translated = translateText(ph, targetLang);
        if (translated !== ph) input.setAttribute("placeholder", translated);
      }
    });

    // 4. Actualizar footer locale
    const localeEl = document.querySelector(".copyright span:last-child, .footer-row span:last-child");
    if (localeEl && localeEl.textContent.includes("Colombia · COP")) {
      localeEl.textContent = targetLang === "en" ? "Colombia · COP · English" : "Colombia · COP · Español";
    }

    // 5. Actualizar botón de login / texto
    const loginText = document.querySelector(".login-link .text, .mobile-login-link");
    if (loginText) {
      loginText.textContent = targetLang === "en" ? "Log In" : "Iniciar Sesión";
    }
  }

  function initI18n() {
    // Asegurar que el switcher tenga event listeners
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".lang-btn");
      if (!btn) return;
      const lang = btn.getAttribute("data-lang");
      if (lang) {
        setLanguage(lang);
      }
    });

    const currentLang = getCurrentLanguage();
    setLanguage(currentLang);
  }

  // Exponer API global
  window.SenairI18n = {
    getLanguage: getCurrentLanguage,
    setLanguage: setLanguage,
    t: (key) => {
      const lang = getCurrentLanguage();
      return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || key;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
  } else {
    initI18n();
  }
})();
