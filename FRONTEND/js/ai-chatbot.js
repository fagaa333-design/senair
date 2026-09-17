/**
 * ============================================================
 * SENAIR — AeroBot (Asistente de Inteligencia Artificial)
 * ============================================================
 */

(function () {
  "use strict";

  const STORAGE_KEY = "senairAiChatHistory";

  // Base de conocimiento y respuestas de AeroBot
  // Base de conocimiento y respuestas de AeroBot (Español e Inglés sin asteriscos)
  const KNOWLEDGE_ES = [
    {
      keywords: ["ruta", "vuelo", "destino", "bogota", "medellin", "cali", "cartagena", "horario", "precio", "cuanto vale", "costo"],
      response: `En SENAIR operamos las principales rutas nacionales en Colombia con vuelos directos y conexiones cómodas:
• Bogotá (BOG) ⇄ Medellín (MDE): desde $159.000 COP
• Bogotá (BOG) ⇄ Cartagena (CTG): desde $189.000 COP
• Medellín (MDE) ⇄ Bogotá (BOG): desde $169.000 COP
• Cali (CLO) ⇄ Cartagena (CTG): desde $249.000 COP

Todos los precios incluyen tasas e impuestos. ¿Deseas consultar vuelos ahora?
<a href="vuelos.html" class="ai-btn-link">✈️ Ver vuelos disponibles</a>`
    },
    {
      keywords: ["cuota", "financiar", "interes", "pago", "pagar", "tarjeta", "credito", "debito", "paypal", "apple pay", "google pay", "metodo de pago"],
      response: `¡Claro! En SENAIR puedes pagar con total flexibilidad:
• Tarjetas de crédito: Puedes diferir tu compra desde 1 hasta 36 cuotas. La opción de 1 cuota es sin interés de financiación.
• Cálculo en tiempo real: Al seleccionar las cuotas en el checkout verás el valor exacto que pagarás mensualmente.
• Otros métodos: Aceptamos PayPal, Apple Pay, Google Pay y débito.
• Factura electrónica: Al completar tu pago se genera al instante tu factura fiscal con código de reserva.`
    },
    {
      keywords: ["equipaje", "maleta", "peso", "mochila", "kilo", "carry on", "bodega", "dimension"],
      response: `Nuestras políticas de equipaje en SENAIR son claras y transparentes:
• Artículo personal (Gratis): 1 bolso o mochila de hasta 10 kg que quepa debajo del asiento delantero.
• Equipaje de mano (Cabina): 1 maleta de hasta 10 kg para el compartimiento superior (55 x 35 x 25 cm).
• Equipaje de bodega: Maletas facturadas de hasta 23 kg por pieza.
¿Tienes dudas sobre algún artículo especial o deportivo? Pregúntame con gusto.`
    },
    {
      keywords: ["milla", "rewards", "punto", "acumular", "nivel", "plata", "oro", "platino", "frecuente", "beneficio"],
      response: `El programa SENAIR Rewards premia tu fidelidad:
• 500 millas de bienvenida: Al iniciar sesión o registrar tu cuenta gratuita.
• 650 millas por cada vuelo: Se acumulan automáticamente con cada viaje confirmado.
• Niveles:
  - Plata · Explorador (< 3.000 millas): Descuentos en equipaje.
  - Oro · Frecuente (3.000 - 5.999 millas): Embarque prioritario.
  - Platino · Élite (6.000+ millas): Acceso a salas VIP y upgrades.
<a href="viajes.html" class="ai-btn-link">⭐ Consultar mis millas</a>`
    },
    {
      keywords: ["asiento", "puesto", "silla", "checkin", "check in", "mapa", "ventana", "pasillo"],
      response: `La selección de asientos en SENAIR es interactiva y muy sencilla:
• Durante el proceso de reserva verás el mapa 3D/plano de la aeronave con filas del 1 al 6.
• Puedes elegir puestos de Ventana (A, F), Medio (B, E) o Pasillo (C, D).
• Si viajas en grupo, el sistema te permite seleccionar los puestos continuos para todos los pasajeros.`
    },
    {
      keywords: ["factura", "comprobante", "recibo", "fiscal", "dian", "iva", "impuesto"],
      response: `Al finalizar tu compra en el checkout, el sistema te muestra automáticamente:
1. Factura Electrónica de Venta: Con número fiscal oficial (SEN-XXXXXX), NIT de SENAIR, desglose de tarifa base e IVA (19%), método de pago y cuotas.
2. Botón para imprimir: Puedes imprimir tu factura o guardarla directamente en PDF.
3. Código de reserva: Para realizar tu check-in o consultar en Mis viajes.`
    },
    {
      keywords: ["quien", "quienes", "desarrollador", "creador", "equipo", "nosotros", "freiner", "isabel", "jesus", "soto", "cervantes"],
      response: `La plataforma SENAIR fue diseñada y desarrollada por un equipo multidisciplinario:
• Freiner: Coordinación y Desarrollo Full Stack.
• Isabel Fernández: Diseño de Experiencia de Usuario (UI/UX) y Frontend.
• Jesús Soto: Arquitectura y Desarrollo.
• Juan Cervantes: Desarrollo de Sistemas y Aseguramiento de Calidad.
<a href="nosotros.html" class="ai-btn-link">👥 Conocer al equipo</a>`
    },
    {
      keywords: ["contacto", "ayuda", "telefono", "correo", "atencion", "soporte", "queja", "reclamo", "asesor"],
      response: `Nuestro equipo de servicio al cliente está disponible 24/7:
• Línea telefónica: 01 8000 912 345 (Colombia)
• Correo: soporte@senair.com
• Oficinas: Aeropuerto Internacional El Dorado, Bogotá D.C.
<a href="contacto.html" class="ai-btn-link">📞 Ir a la página de Contacto</a>`
    },
    {
      keywords: ["hola", "buen", "buenas", "que tal", "hey", "saludos", "hello"],
      response: `¡Hola! 👋 Qué gusto saludarte. Soy AeroBot, la inteligencia artificial de SENAIR. 
¿En qué te puedo asesorar hoy? Puedo ayudarte a consultar vuelos, conocer nuestras cuotas de pago, equipaje permitido, acumular millas o darte detalles sobre tus reservas.`
    },
    {
      keywords: ["gracias", "muchas gracias", "ok", "vale", "perfecto", "listo", "entendido"],
      response: `¡Con el mayor gusto! ✈️ En SENAIR estamos para hacer tus viajes más sencillos y placenteros. Si tienes alguna otra duda, aquí estaré disponible 24/7.`
    }
  ];

  const KNOWLEDGE_EN = [
    {
      keywords: ["route", "flight", "destination", "bogota", "medellin", "cali", "cartagena", "schedule", "price", "cost", "how much"],
      response: `At SENAIR we operate key domestic routes across Colombia with direct flights and comfortable connections:
• Bogotá (BOG) ⇄ Medellín (MDE): from $159,000 COP
• Bogotá (BOG) ⇄ Cartagena (CTG): from $189,000 COP
• Medellín (MDE) ⇄ Bogotá (BOG): from $169,000 COP
• Cali (CLO) ⇄ Cartagena (CTG): from $249,000 COP

All fares include taxes and airport fees. Would you like to check flights now?
<a href="vuelos.html" class="ai-btn-link">✈️ View available flights</a>`
    },
    {
      keywords: ["installment", "financing", "interest", "pay", "payment", "card", "credit", "debit", "paypal", "apple pay", "google pay"],
      response: `Of course! At SENAIR you can pay with complete flexibility:
• Credit cards: Split your payment into 1 to 36 monthly installments. 1 installment has zero financing interest.
• Real-time calculation: When you choose your installments at checkout, you'll see the exact monthly fee.
• Other payment methods: We accept PayPal, Apple Pay, Google Pay, and debit cards.
• Electronic invoice: Upon completing payment, your official fiscal receipt with booking code is generated instantly.`
    },
    {
      keywords: ["baggage", "luggage", "weight", "backpack", "carry on", "checked", "size", "dimension"],
      response: `Our baggage policies at SENAIR are simple and clear:
• Personal item (Free): 1 handbag or backpack up to 10 kg that fits under the seat in front of you.
• Carry-on bag (Cabin): 1 suitcase up to 10 kg for the overhead bin (55 x 35 x 25 cm).
• Checked baggage: Checked luggage up to 23 kg per piece.
Have questions about sports equipment or special baggage? Feel free to ask!`
    },
    {
      keywords: ["mile", "rewards", "point", "tier", "silver", "gold", "platinum", "frequent", "benefit"],
      response: `The SENAIR Rewards program rewards your loyalty:
• 500 welcome miles: When you create or log in to your free account.
• 650 miles per flight: Automatically accumulated with every confirmed booking.
• Membership tiers:
  - Silver · Explorer (< 3,000 miles): Baggage discounts.
  - Gold · Frequent (3,000 - 5,999 miles): Priority boarding.
  - Platinum · Elite (6,000+ miles): VIP lounge access & complimentary upgrades.
<a href="viajes.html" class="ai-btn-link">⭐ Check my miles</a>`
    },
    {
      keywords: ["seat", "seatmap", "window", "aisle", "middle", "checkin"],
      response: `Seat selection at SENAIR is interactive and simple:
• During booking, you'll view the aircraft cabin layout with rows 1 to 6.
• Choose from Window (A, F), Middle (B, E), or Aisle (C, D) seats.
• For group travel, the system allows contiguous seats for all passengers.`
    },
    {
      keywords: ["invoice", "receipt", "tax", "vat", "dian"],
      response: `After completing your payment at checkout, the system automatically displays:
1. Official Electronic Invoice: With fiscal number (SEN-XXXXXX), SENAIR company ID, base fare and VAT (19%) breakdown, and payment details.
2. Print button: Print your invoice or save it directly as a PDF.
3. Booking confirmation code: Use it for online check-in or viewing in My Trips.`
    },
    {
      keywords: ["who", "developer", "creator", "team", "about", "freiner", "isabel", "jesus", "soto", "cervantes"],
      response: `The SENAIR platform was designed and developed by a talented team:
• Freiner: Full Stack Development & Coordination.
• Isabel Fernández: UI/UX Design & Frontend Engineering.
• Jesús Soto: System Architecture & Development.
• Juan Cervantes: Systems Development & Quality Assurance.
<a href="nosotros.html" class="ai-btn-link">👥 Meet the team</a>`
    },
    {
      keywords: ["contact", "help", "support", "phone", "email", "call", "agent"],
      response: `Our customer care team is available 24/7:
• Phone helpline: 01 8000 912 345 (Colombia)
• Email: soporte@senair.com
• Main offices: El Dorado International Airport, Bogotá D.C.
<a href="contacto.html" class="ai-btn-link">📞 Go to Contact page</a>`
    },
    {
      keywords: ["hi", "hello", "good morning", "good afternoon", "hey", "greetings"],
      response: `Hello! 👋 Great to meet you. I'm AeroBot, SENAIR's virtual AI assistant.
How can I assist you today? I can help you search flights, explore installment plans, check baggage rules, track rewards miles, or review your bookings.`
    },
    {
      keywords: ["thank", "thanks", "ok", "great", "perfect", "got it"],
      response: `You're very welcome! ✈️ At SENAIR we're dedicated to making your travel seamless. If you need anything else, I'm here 24/7.`
    }
  ];

  function getAiResponse(userText) {
    const isEn = (window.SenairI18n && window.SenairI18n.getLanguage() === "en") || /^(hi|hello|hey|flights|how|where|when|can i)/i.test(userText.trim());
    const knowledgeBase = isEn ? KNOWLEDGE_EN : KNOWLEDGE_ES;
    const clean = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (const item of knowledgeBase) {
      const match = item.keywords.some((kw) => {
        const cleanKw = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return clean.includes(cleanKw);
      });
      if (match) return item.response;
    }

    if (isEn) {
      return `I understand your question about "${escapeHtml(userText.slice(0, 40))}".
As SENAIR's virtual assistant, I can provide detailed guidance on:
• Flight search and reservations between Bogotá, Medellín, Cali, and Cartagena.
• Flexible installment plans (1 to 36 months).
• Carry-on and checked baggage policies.
• The SENAIR Rewards miles program.
• Electronic invoicing and ticket confirmations.

Would you like more details on any of these topics?`;
    }

    return `Entiendo tu pregunta sobre "${escapeHtml(userText.slice(0, 40))}".
Como asistente virtual de SENAIR, puedo brindarte información detallada sobre:
• Búsqueda y reservas de vuelos entre Bogotá, Medellín, Cali y Cartagena.
• Planes de pago en cuotas (1 a 36 cuotas sin complicaciones).
• Políticas de equipaje de mano y bodega.
• Programa de Millas SENAIR Rewards.
• Facturación electrónica y confirmación de tickets.

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

  function ensureStylesInDOM() {
    if (document.getElementById("senair-ai-chatbot-css")) return;
    const styleEl = document.createElement("style");
    styleEl.id = "senair-ai-chatbot-css";
    styleEl.textContent = `
/* ── Botón en el Navbar (Icono circular) ────────────────────────── */
.ai-nav-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 44px !important;
  height: 44px !important;
  min-width: 44px !important;
  min-height: 44px !important;
  padding: 0 !important;
  background: linear-gradient(135deg, #062b55 0%, #0866c6 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 50% !important;
  cursor: pointer !important;
  box-shadow: 0 4px 14px rgba(8, 102, 198, 0.28) !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  position: relative !important;
  text-decoration: none !important;
  flex-shrink: 0 !important;
  box-sizing: border-box !important;
  outline: none !important;
}

.ai-nav-btn:hover {
  transform: translateY(-2px) scale(1.06) !important;
  box-shadow: 0 6px 20px rgba(8, 102, 198, 0.45) !important;
  background: linear-gradient(135deg, #0866c6 0%, #062b55 100%) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.ai-nav-btn:active {
  transform: translateY(0) scale(0.97) !important;
}

.ai-nav-icon {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #ffffff !important;
  transition: transform 0.25s ease !important;
  width: 100% !important;
  height: 100% !important;
}

.ai-nav-btn:hover .ai-nav-icon {
  transform: scale(1.12) rotate(6deg) !important;
}

.ai-nav-text {
  display: none !important;
}

.ai-nav-btn .ai-online-dot {
  position: absolute !important;
  top: 2px !important;
  right: 2px !important;
  width: 10px !important;
  height: 10px !important;
  border-radius: 50% !important;
  background-color: #22c55e !important;
  border: 2px solid #ffffff !important;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.4) !important;
  animation: aiPulse 2s infinite ease-in-out !important;
}

@keyframes aiPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.15);
  }
}

/* ── Botón flotante móvil (acceso rápido) ─────────────────────── */
.ai-floating-trigger {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  z-index: 9998 !important;
  display: none !important;
  align-items: center !important;
  justify-content: center !important;
  width: 52px !important;
  height: 52px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  background: linear-gradient(135deg, #062b55 0%, #0866c6 100%) !important;
  color: #ffffff !important;
  border: 2px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 10px 28px rgba(6, 43, 85, 0.38) !important;
  cursor: pointer !important;
  transition: all 0.25s ease !important;
  outline: none !important;
}

.ai-floating-trigger:hover {
  transform: translateY(-3px) scale(1.05) !important;
  box-shadow: 0 14px 34px rgba(6, 43, 85, 0.48) !important;
}

/* ── Ventana del Chatbot ──────────────────────────────────────── */
.ai-chatbot-widget {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  z-index: 99999 !important;
  width: 400px !important;
  max-width: calc(100vw - 32px) !important;
  height: 600px !important;
  max-height: calc(100vh - 48px) !important;
  display: flex !important;
  flex-direction: column !important;
  pointer-events: none !important;
  opacity: 0 !important;
  transform: scale(0.92) translateY(20px) !important;
  transform-origin: bottom right !important;
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.ai-chatbot-widget.is-open {
  pointer-events: auto !important;
  opacity: 1 !important;
  transform: scale(1) translateY(0) !important;
}

.ai-chat-card {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  background: #ffffff !important;
  border-radius: 20px !important;
  box-shadow: 0 20px 50px rgba(6, 43, 85, 0.22), 0 0 0 1px rgba(8, 102, 198, 0.12) !important;
  overflow: hidden !important;
  font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

/* ── Encabezado del Chat ──────────────────────────────────────── */
.ai-chat-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 16px 20px !important;
  background: linear-gradient(135deg, #062b55 0%, #0d4684 60%, #0866c6 100%) !important;
  color: #ffffff !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.ai-chat-header-info {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

.ai-avatar-wrapper {
  position: relative !important;
}

.ai-avatar {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.18) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.35) !important;
  display: grid !important;
  place-items: center !important;
}

.ai-status-dot {
  position: absolute !important;
  bottom: 0 !important;
  right: 0 !important;
  width: 10px !important;
  height: 10px !important;
  border-radius: 50% !important;
  background: #22c55e !important;
  border: 2px solid #062b55 !important;
}

.ai-name-row {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}

.ai-bot-name {
  margin: 0 !important;
  font-size: 16px !important;
  font-weight: 800 !important;
  color: #ffffff !important;
  letter-spacing: -0.2px !important;
}

.ai-tag {
  font-size: 10px !important;
  font-weight: 800 !important;
  padding: 2px 7px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  color: #ffffff !important;
}

.ai-bot-subtitle {
  margin: 2px 0 0 !important;
  font-size: 12px !important;
  color: #b9dcfe !important;
}

.ai-header-controls {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}

.ai-ctrl-btn {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.14) !important;
  border: 0 !important;
  color: #ffffff !important;
  display: grid !important;
  place-items: center !important;
  cursor: pointer !important;
  transition: background 0.15s ease, transform 0.15s ease !important;
  outline: none !important;
}

.ai-ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.28) !important;
  transform: scale(1.05) !important;
}

/* ── Cuerpo y Mensajes ────────────────────────────────────────── */
.ai-chat-body {
  flex: 1 !important;
  overflow-y: auto !important;
  padding: 18px !important;
  background: #f8fafc !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
  scroll-behavior: smooth !important;
}

.ai-chat-welcome {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
  padding: 14px 16px !important;
  box-shadow: 0 2px 8px rgba(6, 43, 85, 0.04) !important;
}

.ai-welcome-badge {
  display: inline-block !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  color: #0866c6 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  margin-bottom: 6px !important;
}

.ai-chat-welcome p {
  margin: 0 !important;
  font-size: 13px !important;
  color: #334155 !important;
  line-height: 1.5 !important;
}

/* ── Chips Rápidos ────────────────────────────────────────────── */
.ai-quick-chips {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 7px !important;
  margin-top: 4px !important;
}

.ai-chip {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 20px !important;
  padding: 6px 12px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #062b55 !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  white-space: nowrap !important;
}

.ai-chip:hover {
  background: #edf5fd !important;
  border-color: #0866c6 !important;
  color: #0866c6 !important;
  transform: translateY(-1px) !important;
}

/* ── Lista de Mensajes ────────────────────────────────────────── */
.ai-messages-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

.ai-msg {
  display: flex !important;
  flex-direction: column !important;
  max-width: 85% !important;
  animation: aiMsgIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

@keyframes aiMsgIn {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

.ai-msg.user {
  align-self: flex-end !important;
}

.ai-msg.user .ai-msg-bubble {
  background: linear-gradient(135deg, #062b55 0%, #0866c6 100%) !important;
  color: #ffffff !important;
  border-radius: 16px 16px 4px 16px !important;
}

.ai-msg.bot {
  align-self: flex-start !important;
}

.ai-msg.bot .ai-msg-bubble {
  background: #ffffff !important;
  color: #1e293b !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px 16px 16px 4px !important;
  box-shadow: 0 2px 6px rgba(6, 43, 85, 0.04) !important;
}

.ai-msg-bubble {
  padding: 11px 15px !important;
  font-size: 13.5px !important;
  line-height: 1.5 !important;
  word-break: break-word !important;
}

.ai-msg-bubble p {
  margin: 0 0 6px !important;
}

.ai-msg-bubble p:last-child {
  margin-bottom: 0 !important;
}

.ai-msg-bubble ul {
  margin: 6px 0 !important;
  padding-left: 18px !important;
}

.ai-msg-bubble li {
  margin-bottom: 4px !important;
}

.ai-msg-bubble a.ai-btn-link {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  margin-top: 8px !important;
  padding: 6px 12px !important;
  background: #0866c6 !important;
  color: #ffffff !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  text-decoration: none !important;
}

.ai-msg-bubble a.ai-btn-link:hover {
  background: #062b55 !important;
}

.ai-msg-time {
  font-size: 10px !important;
  color: #94a3b8 !important;
  margin-top: 4px !important;
  padding: 0 4px !important;
}

.ai-msg.user .ai-msg-time {
  text-align: right !important;
}

/* ── Indicador de escritura ───────────────────────────────────── */
.ai-typing-indicator {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 10px 14px !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  width: fit-content !important;
}

.ai-typing-dot {
  width: 6px !important;
  height: 6px !important;
  border-radius: 50% !important;
  background: #0866c6 !important;
  animation: aiTyping 1.4s infinite ease-in-out !important;
}

.ai-typing-dot:nth-child(1) { animation-delay: 0s !important; }
.ai-typing-dot:nth-child(2) { animation-delay: 0.2s !important; }
.ai-typing-dot:nth-child(3) { animation-delay: 0.4s !important; }

@keyframes aiTyping {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-5px); opacity: 1; }
}

/* ── Input y Envío ────────────────────────────────────────────── */
.ai-chat-footer {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 12px 16px !important;
  background: #ffffff !important;
  border-top: 1px solid #e2e8f0 !important;
}

.ai-chat-input {
  flex: 1 !important;
  height: 42px !important;
  padding: 0 14px !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 22px !important;
  font-size: 13.5px !important;
  color: #1e293b !important;
  outline: none !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
}

.ai-chat-input:focus {
  border-color: #0866c6 !important;
  box-shadow: 0 0 0 3px rgba(8, 102, 198, 0.15) !important;
}

.ai-send-btn {
  width: 42px !important;
  height: 42px !important;
  border-radius: 50% !important;
  background: #0866c6 !important;
  color: #ffffff !important;
  border: 0 !important;
  display: grid !important;
  place-items: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0 !important;
  outline: none !important;
}

.ai-send-btn:hover {
  background: #062b55 !important;
  transform: scale(1.05) !important;
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 760px) {
  .ai-floating-trigger {
    display: inline-flex !important;
  }
  .ai-chatbot-widget {
    bottom: 12px !important;
    right: 12px !important;
    left: 12px !important;
    width: calc(100% - 24px) !important;
    height: calc(100vh - 24px) !important;
    max-height: 560px !important;
  }
}
`;
    document.head.appendChild(styleEl);
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
      <button type="button" class="ai-floating-trigger" id="aiFloatingTrigger" aria-label="Abrir Asistente IA SENAIR" title="Asistente Virtual SENAIR">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5"/>
        </svg>
      </button>
    `;

    document.body.insertAdjacentHTML("beforeend", widgetHtml);
  }

  function initChatbot() {
    ensureStylesInDOM();
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

      // Reemplazar saltos de línea y eliminar asteriscos **
      if (sender === "bot") {
        const cleaned = text
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*\*/g, "")
          .replace(/\n/g, "<br>");
        bubble.innerHTML = cleaned;
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

    // Actualización de textos según idioma (ES / EN)
    function updateChatbotLanguage(lang) {
      const isEn = lang === "en" || (window.SenairI18n && window.SenairI18n.getLanguage() === "en");
      const subtitle = widget.querySelector(".ai-bot-subtitle");
      const badge = widget.querySelector(".ai-welcome-badge");
      const welcomeP = widget.querySelector(".ai-chat-welcome p");
      
      if (subtitle) {
        subtitle.textContent = isEn ? "Online · 24/7 Support" : "En línea · Atención 24/7";
      }
      if (badge) {
        badge.textContent = isEn ? "✨ Intelligent Support" : "✨ Asistencia Inteligente";
      }
      if (welcomeP) {
        welcomeP.innerHTML = isEn
          ? "Hello! I am <strong>AeroBot</strong>, your virtual AI assistant at SENAIR. I'm ready to help you with flights, baggage, installment plans, and miles instantly."
          : "¡Hola! Soy <strong>AeroBot</strong>, tu asistente virtual con IA en SENAIR. Estoy listo para ayudarte con vuelos, equipaje, cuotas de pago y millas al instante.";
      }
      if (chatInput) {
        chatInput.placeholder = isEn
          ? "Ask AeroBot about flights, installments..."
          : "Pregúntale a AeroBot sobre vuelos, cuotas...";
      }
      if (clearBtn) {
        clearBtn.title = isEn ? "Restart conversation" : "Reiniciar conversación";
        clearBtn.setAttribute("aria-label", clearBtn.title);
      }
      if (closeBtn) {
        closeBtn.title = isEn ? "Close chat" : "Cerrar chat";
        closeBtn.setAttribute("aria-label", closeBtn.title);
      }

      if (quickChips) {
        if (isEn) {
          quickChips.innerHTML = `
            <button type="button" class="ai-chip" data-query="What routes and flights are available?">✈️ Routes & flights</button>
            <button type="button" class="ai-chip" data-query="How can I pay for my flight in installments?">💳 Pay in installments</button>
            <button type="button" class="ai-chip" data-query="How much baggage can I bring?">🎒 Baggage allowance</button>
            <button type="button" class="ai-chip" data-query="How does the SENAIR Rewards miles program work?">⭐ SENAIR Rewards</button>
            <button type="button" class="ai-chip" data-query="Who are the SENAIR developers?">👥 SENAIR Team</button>
          `;
        } else {
          quickChips.innerHTML = `
            <button type="button" class="ai-chip" data-query="¿Qué rutas y vuelos tienen disponibles?">✈️ Rutas y vuelos</button>
            <button type="button" class="ai-chip" data-query="¿Cómo puedo pagar en cuotas mi vuelo?">💳 Pago en cuotas</button>
            <button type="button" class="ai-chip" data-query="¿Cuánto equipaje puedo llevar?">🎒 Equipaje permitido</button>
            <button type="button" class="ai-chip" data-query="¿Cómo funciona el programa de Millas SENAIR Rewards?">⭐ Millas Rewards</button>
            <button type="button" class="ai-chip" data-query="¿Quiénes son los desarrolladores de SENAIR?">👥 Equipo SENAIR</button>
          `;
        }
      }
    }

    window.addEventListener("senair:langchange", (e) => {
      updateChatbotLanguage(e.detail?.lang);
    });

    const initialLang = window.SenairI18n ? window.SenairI18n.getLanguage() : (localStorage.getItem("senair_lang") || "es");
    updateChatbotLanguage(initialLang);

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

