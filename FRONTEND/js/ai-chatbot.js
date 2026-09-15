/**
 * ============================================================
 * SENAIR — AeroBot (Asistente de Inteligencia Artificial)
 * ============================================================
 */

(function () {
  "use strict";

  const STORAGE_KEY = "senairAiChatHistory";

  // Base de conocimiento y respuestas de AeroBot
  const KNOWLEDGE = [
    {
      keywords: ["ruta", "vuelo", "destino", "bogota", "medellin", "cali", "cartagena", "horario", "precio", "cuanto vale", "costo"],
      response: `En **SENAIR** operamos las principales rutas nacionales en Colombia con vuelos directos y conexiones cómodas:
• **Bogotá (BOG) ⇄ Medellín (MDE)**: desde $159.000 COP
• **Bogotá (BOG) ⇄ Cartagena (CTG)**: desde $189.000 COP
• **Medellín (MDE) ⇄ Bogotá (BOG)**: desde $169.000 COP
• **Cali (CLO) ⇄ Cartagena (CTG)**: desde $249.000 COP

Todos los precios incluyen tasas e impuestos. ¿Deseas consultar vuelos ahora?
<a href="vuelos.html" class="ai-btn-link">✈️ Ver vuelos disponibles</a>`
    },
    {
      keywords: ["cuota", "financiar", "interes", "pago", "pagar", "tarjeta", "credito", "debito", "paypal", "apple pay", "google pay", "metodo de pago"],
      response: `¡Claro! En **SENAIR** puedes pagar con total flexibilidad:
• **Tarjetas de crédito:** Puedes diferir tu compra desde **1 hasta 36 cuotas**. La opción de 1 cuota es sin interés de financiación.
• **Cálculo en tiempo real:** Al seleccionar las cuotas en el checkout verás el valor exacto que pagarás mensualmente.
• **Otros métodos:** Aceptamos **PayPal**, **Apple Pay**, **Google Pay** y débito.
• **Factura electrónica:** Al completar tu pago se genera al instante tu factura fiscal con código de reserva.`
    },
    {
      keywords: ["equipaje", "maleta", "peso", "mochila", "kilo", "carry on", "bodega", "dimension"],
      response: `Nuestras políticas de equipaje en **SENAIR** son claras y transparentes:
• **Artículo personal (Gratis):** 1 bolso o mochila de hasta 10 kg que quepa debajo del asiento delantero.
• **Equipaje de mano (Cabina):** 1 maleta de hasta 10 kg para el compartimiento superior (55 x 35 x 25 cm).
• **Equipaje de bodega:** Maletas facturadas de hasta 23 kg por pieza.
¿Tienes dudas sobre algún artículo especial o deportivo? Pregúntame con gusto.`
    },
    {
      keywords: ["milla", "rewards", "punto", "acumular", "nivel", "plata", "oro", "platino", "frecuente", "beneficio"],
      response: `El programa **SENAIR Rewards** premia tu fidelidad:
• **500 millas de bienvenida:** Al iniciar sesión o registrar tu cuenta gratuita.
• **650 millas por cada vuelo:** Se acumulan automáticamente con cada viaje confirmado.
• **Niveles:**
  - **Plata · Explorador** (< 3.000 millas): Descuentos en equipaje.
  - **Oro · Frecuente** (3.000 - 5.999 millas): Embarque prioritario.
  - **Platino · Élite** (6.000+ millas): Acceso a salas VIP y upgrades.
<a href="viajes.html" class="ai-btn-link">⭐ Consultar mis millas</a>`
    },
    {
      keywords: ["asiento", "puesto", "silla", "checkin", "check in", "mapa", "ventana", "pasillo"],
      response: `La selección de asientos en **SENAIR** es interactiva y muy sencilla:
• Durante el proceso de reserva verás el mapa 3D/plano de la aeronave con filas del 1 al 6.
• Puedes elegir puestos de **Ventana (A, F)**, **Medio (B, E)** o **Pasillo (C, D)**.
• Si viajas en grupo, el sistema te permite seleccionar los puestos continuos para todos los pasajeros.`
    },
    {
      keywords: ["factura", "comprobante", "recibo", "fiscal", "dian", "iva", "impuesto"],
      response: `Al finalizar tu compra en el checkout, el sistema te muestra automáticamente:
1. **Factura Electrónica de Venta:** Con número fiscal oficial (\`SEN-XXXXXX\`), NIT de SENAIR, desglose de tarifa base e IVA (19%), método de pago y cuotas.
2. **Botón para imprimir:** Puedes imprimir tu factura o guardarla directamente en PDF.
3. **Código de reserva:** Para realizar tu check-in o consultar en *Mis viajes*.`
    },
    {
      keywords: ["quien", "quienes", "desarrollador", "creador", "equipo", "nosotros", "freiner", "isabel", "jesus", "soto", "cervantes"],
      response: `La plataforma **SENAIR** fue diseñada y desarrollada por un equipo multidisciplinario:
• **Freiner:** Coordinación y Desarrollo Full Stack.
• **Isabel Fernández:** Diseño de Experiencia de Usuario (UI/UX) y Frontend.
• **Jesús Soto:** Arquitectura y Desarrollo.
• **Juan Cervantes:** Desarrollo de Sistemas y Aseguramiento de Calidad.
<a href="nosotros.html" class="ai-btn-link">👥 Conocer al equipo</a>`
    },
    {
      keywords: ["contacto", "ayuda", "telefono", "correo", "atencion", "soporte", "queja", "reclamo", "asesor"],
      response: `Nuestro equipo de servicio al cliente está disponible **24/7**:
• **Línea telefónica:** 01 8000 912 345 (Colombia)
• **Correo:** soporte@senair.com
• **Oficinas:** Aeropuerto Internacional El Dorado, Bogotá D.C.
<a href="contacto.html" class="ai-btn-link">📞 Ir a la página de Contacto</a>`
    },
    {
      keywords: ["hola", "buen", "buenas", "que tal", "hey", "saludos", "hello"],
      response: `¡Hola! 👋 Qué gusto saludarte. Soy **AeroBot**, la inteligencia artificial de **SENAIR**. 
¿En qué te puedo asesorar hoy? Puedo ayudarte a consultar vuelos, conocer nuestras cuotas de pago, equipaje permitido, acumular millas o darte detalles sobre tus reservas.`
    },
    {
      keywords: ["gracias", "muchas gracias", "ok", "vale", "perfecto", "listo", "entendido"],
      response: `¡Con el mayor gusto! ✈️ En **SENAIR** estamos para hacer tus viajes más sencillos y placenteros. Si tienes alguna otra duda, aquí estaré disponible 24/7.`
    }
  ];

  function getAiResponse(userText) {
    const clean = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const item of KNOWLEDGE) {
      const match = item.keywords.some((kw) => {
        const cleanKw = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return clean.includes(cleanKw);
      });
      if (match) return item.response;
    }

    return `Entiendo tu pregunta sobre *"<b>${escapeHtml(userText.slice(0, 40))}</b>"*.
Como asistente virtual de **SENAIR**, puedo brindarte información detallada sobre:
• **Búsqueda y reservas de vuelos** entre Bogotá, Medellín, Cali y Cartagena.
• **Planes de pago en cuotas** (1 a 36 cuotas sin complicaciones).
• **Políticas de equipaje de mano y bodega**.
• **Programa de Millas SENAIR Rewards**.
• **Facturación electrónica y confirmación de tickets**.

¿Te gustaría que profundicemos en alguno de estos puntos?`;
  }

  function escapeHtml(text) {
    return String(text || "").replace(/[&<>'"]/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[c]);
  }

  function getStoredHistory() {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveHistory(history) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30)));
    } catch {
      // Ignorar errores de cuota de storage
    }
  }

  function ensureChatWidgetInDOM() {
    if (document.getElementById("aiChatWidget")) return;

    const widgetHtml = `
      <div class="ai-chatbot-widget" id="aiChatWidget" aria-hidden="true" style="display: none;">
        <div class="ai-chat-card" role="dialog" aria-modal="true" aria-label="Asistente Virtual SENAIR AI">
          <header class="ai-chat-header">
            <div class="ai-chat-header-info">
              <div class="ai-avatar-wrapper">
                <div class="ai-avatar">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5"/>
                  </svg>
                </div>
                <span class="ai-status-dot"></span>
              </div>
              <div>
                <div class="ai-name-row">
                  <h3 class="ai-bot-name">AeroBot</h3>
                  <span class="ai-tag">IA SENAIR</span>
                </div>
                <p class="ai-bot-subtitle">En línea · Atención 24/7</p>
              </div>
            </div>
            <div class="ai-header-controls">
              <button type="button" class="ai-ctrl-btn" id="aiClearChat" title="Reiniciar conversación" aria-label="Reiniciar conversación">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
              <button type="button" class="ai-ctrl-btn ai-close-btn" id="aiCloseChat" title="Cerrar chat" aria-label="Cerrar chat">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </header>

          <div class="ai-chat-body" id="aiChatBody">
            <div class="ai-chat-welcome">
              <span class="ai-welcome-badge">✨ Asistencia Inteligente</span>
              <p>¡Hola! Soy <strong>AeroBot</strong>, tu asistente virtual con IA en SENAIR. Estoy listo para ayudarte con vuelos, equipaje, cuotas de pago y millas al instante.</p>
            </div>

            <div class="ai-quick-chips" id="aiQuickChips">
              <button type="button" class="ai-chip" data-query="¿Qué rutas y vuelos tienen disponibles?">✈️ Rutas y vuelos</button>
              <button type="button" class="ai-chip" data-query="¿Cómo puedo pagar en cuotas mi vuelo?">💳 Pago en cuotas</button>
              <button type="button" class="ai-chip" data-query="¿Cuánto equipaje puedo llevar?">🎒 Equipaje permitido</button>
              <button type="button" class="ai-chip" data-query="¿Cómo funciona el programa de Millas SENAIR Rewards?">⭐ Millas Rewards</button>
              <button type="button" class="ai-chip" data-query="¿Quiénes son los desarrolladores de SENAIR?">👥 Equipo SENAIR</button>
            </div>

            <div class="ai-messages-list" id="aiMessagesList"></div>
          </div>

          <form class="ai-chat-footer" id="aiChatForm">
            <input type="text" class="ai-chat-input" id="aiChatInput" placeholder="Pregúntale a AeroBot sobre vuelos, cuotas..." autocomplete="off" maxlength="300" required />
            <button type="submit" class="ai-send-btn" id="aiSendBtn" aria-label="Enviar mensaje">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      </div>
      
      <!-- Botón flotante para móviles -->
      <button type="button" class="ai-floating-trigger" id="aiFloatingTrigger" aria-label="Abrir Asistente IA SENAIR">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5"/>
        </svg>
        <span>Asistente IA</span>
      </button>
    `;

    document.body.insertAdjacentHTML("beforeend", widgetHtml);
  }

  function initChatbot() {
    ensureChatWidgetInDOM();

    const widget = document.getElementById("aiChatWidget");
    const chatBody = document.getElementById("aiChatBody");
    const messagesList = document.getElementById("aiMessagesList");
    const chatForm = document.getElementById("aiChatForm");
    const chatInput = document.getElementById("aiChatInput");
    const closeBtn = document.getElementById("aiCloseChat");
    const clearBtn = document.getElementById("aiClearChat");
    const quickChips = document.getElementById("aiQuickChips");
    const toggleButtons = document.querySelectorAll("#aiChatToggle, .ai-nav-btn, #aiFloatingTrigger");

    function renderHistory() {
      const history = getStoredHistory();
      messagesList.innerHTML = "";
      history.forEach((item) => appendMessageElement(item.sender, item.text, item.time, false));
      scrollToBottom();
    }

    function appendMessageElement(sender, text, timeStr, animate = true) {
      const msg = document.createElement("div");
      msg.className = `ai-msg ${sender}`;
      if (!animate) msg.style.animation = "none";

      const bubble = document.createElement("div");
      bubble.className = "ai-msg-bubble";

      // Reemplazar saltos de línea simples
      if (sender === "bot") {
        bubble.innerHTML = text.replace(/\n/g, "<br>");
      } else {
        bubble.textContent = text;
      }

      const time = document.createElement("span");
      time.className = "ai-msg-time";
      time.textContent = timeStr || new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

      msg.appendChild(bubble);
      msg.appendChild(time);
      messagesList.appendChild(msg);
      scrollToBottom();
    }

    function scrollToBottom() {
      setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 50);
    }

    function showTypingIndicator() {
      const typing = document.createElement("div");
      typing.className = "ai-typing-indicator";
      typing.id = "aiTypingIndicator";
      typing.innerHTML = `
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
      `;
      messagesList.appendChild(typing);
      scrollToBottom();
    }

    function removeTypingIndicator() {
      const typing = document.getElementById("aiTypingIndicator");
      if (typing) typing.remove();
    }

    function handleSendMessage(text) {
      const cleanText = text.trim();
      if (!cleanText) return;

      const timeNow = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      appendMessageElement("user", cleanText, timeNow);

      const history = getStoredHistory();
      history.push({ sender: "user", text: cleanText, time: timeNow });
      saveHistory(history);

      chatInput.value = "";
      chatInput.focus();

      showTypingIndicator();

      // Simular tiempo de respuesta de IA realista (450ms a 750ms)
      const delay = Math.floor(Math.random() * 300) + 450;
      setTimeout(() => {
        removeTypingIndicator();
        const botAnswer = getAiResponse(cleanText);
        const botTime = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
        appendMessageElement("bot", botAnswer, botTime);

        history.push({ sender: "bot", text: botAnswer, time: botTime });
        saveHistory(history);
      }, delay);
    }

    function openChat() {
      widget.style.display = "flex";
      // Forzar reflujo
      void widget.offsetWidth;
      widget.classList.add("is-open");
      widget.setAttribute("aria-hidden", "false");
      setTimeout(() => chatInput.focus(), 150);
      scrollToBottom();
    }

    function closeChat() {
      widget.classList.remove("is-open");
      widget.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        if (!widget.classList.contains("is-open")) {
          widget.style.display = "none";
        }
      }, 250);
    }

    function toggleChat() {
      if (widget.classList.contains("is-open")) {
        closeChat();
      } else {
        openChat();
      }
    }

    // Event listeners
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleChat();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", closeChat);
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("¿Deseas reiniciar la conversación con AeroBot?")) {
          sessionStorage.removeItem(STORAGE_KEY);
          renderHistory();
        }
      });
    }

    if (chatForm) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSendMessage(chatInput.value);
      });
    }

    if (quickChips) {
      quickChips.addEventListener("click", (e) => {
        const chip = e.target.closest(".ai-chip");
        if (chip && chip.dataset.query) {
          handleSendMessage(chip.dataset.query);
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && widget.classList.contains("is-open")) {
        closeChat();
      }
    });

    // Cargar historial previo si existe
    renderHistory();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatbot);
  } else {
    initChatbot();
  }
})();
