/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Encuesta Interactiva Feria de Software
 * Lógica Mobile-First, Estado Persistente y Comunicación con Backend
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  const STORAGE_TOKEN_KEY = "senair_survey_token";
  const STORAGE_NAME_KEY = "senair_survey_name";

  // Definición de las 8 Preguntas de la Feria
  const QUESTIONS = [
    {
      id: "q1_frequency",
      category: "Hábitos de Viaje",
      title: "¿Con qué frecuencia sueles viajar en avión?",
      desc: "Selecciona la opción que mejor represente tus viajes habituales.",
      type: "single",
      options: [
        { val: "Varias veces al mes", label: "Varias veces al mes", sub: "Viajero frecuente de negocios o turismo constante" },
        { val: "Cada 2 o 3 meses", label: "Cada 2 o 3 meses", sub: "Vuelo con regularidad a lo largo del año" },
        { val: "1 o 2 veces al año", label: "1 o 2 veces al año", sub: "Temporadas de vacaciones y visitas familiares" },
        { val: "Rara vez o primera vez", label: "Rara vez o primera vez", sub: "Vuelo únicamente cuando es indispensable" }
      ]
    },
    {
      id: "q2_destination",
      category: "Destinos & Experiencias",
      title: "¿Qué tipo de destino prefieres al momento de vacacionar?",
      desc: "Elige el entorno que más te inspira a tomar un vuelo.",
      type: "single",
      options: [
        { val: "Playas y Caribe", label: "Playas y descanso paradisíaco", sub: "Cartagena, Santa Marta, San Andrés, Cancún" },
        { val: "Grandes Metrópolis", label: "Grandes metrópolis cosmopolitas", sub: "Bogotá, Medellín, New York, Madrid, Barcelona" },
        { val: "Aventura y Naturaleza", label: "Naturaleza, ecoturismo y aventura", sub: "Leticia, Patagonia, Eje Cafetero, Cusco" },
        { val: "Cultura y Gastronomía", label: "Rutas culturales, historia y buena comida", sub: "Quito, Lima, Villa de Leyva, Oaxaca" }
      ]
    },
    {
      id: "q3_factor",
      category: "Decisión de Compra",
      title: "¿Cuál es el factor más determinante para ti al elegir una aerolínea?",
      desc: "Identifica qué aspecto priorizas por encima de los demás.",
      type: "single",
      options: [
        { val: "Precios y Promociones", label: "Precios competitivos y tarifas claras", sub: "Transparencia sin cobros ocultos ni sorpresas" },
        { val: "Puntualidad y Confianza", label: "Puntualidad e itinerarios confiables", sub: "Llegar a tiempo y que cumplan la programación" },
        { val: "Comodidad y Asientos", label: "Comodidad a bordo y elección de sillas", sub: "Espacio en cabina, clases ejecutivas y servicio" },
        { val: "Plataforma Web Ágil", label: "Facilidad de compra y sitio web rápido", sub: "Reservar sin fricción, pagos sencillos y check-in" }
      ]
    },
    {
      id: "q4_web_rating",
      category: "Experiencia Digital SENAIR",
      title: "¿Cómo calificarías el diseño, agilidad y usabilidad del sitio web de SENAIR?",
      desc: "Toca las estrellas para calificar del 1 al 5 tu experiencia navegando en la plataforma.",
      type: "rating",
      labels: {
        1: "1 Estrella • Necesita mejoras importantes",
        2: "2 Estrellas • Regular, puede ser más intuitiva",
        3: "3 Estrellas • Buena experiencia y diseño agradable",
        4: "4 Estrellas • Muy ágil, moderna y atractiva",
        5: "5 Estrellas • ¡Excelente e innovadora!"
      }
    },
    {
      id: "q5_innovation",
      category: "Innovación en la Feria",
      title: "¿Qué innovación tecnológica de SENAIR te ha llamado más la atención?",
      desc: "Evalúa las funciones desarrolladas por nuestro equipo para esta feria de software.",
      type: "single",
      options: [
        { val: "Mapa Interactivo de Asientos", label: "Mapa interactivo de asientos en cabina", sub: "Selección gráfica en tiempo real por clases" },
        { val: "Asistente Virtual con IA", label: "Asistente virtual de vuelos con Inteligencia Artificial", sub: "Respuestas y asesoría contextual personalizada" },
        { val: "Modo Oscuro con Video Dinámico", label: "Modo Claro / Oscuro dinámico con video adaptativo", sub: "Transición visual sincronizada en pantalla de carga" },
        { val: "Facturación y Reservas en Tiempo Real", label: "Factura electrónica y gestión de viajes", sub: "Generación de comprobantes DIAN y persistencia completa" }
      ]
    },
    {
      id: "q6_cabin",
      category: "Experiencia a Bordo",
      title: "Si viajaras hoy con SENAIR, ¿qué clase de cabina elegirías para tu vuelo?",
      desc: "Considerando tu equilibrio preferido entre confort y presupuesto.",
      type: "single",
      options: [
        { val: "Primera Clase", label: "Primera Clase Exclusiva", sub: "Máximo espacio personal, privacidad y servicio premium" },
        { val: "Clase Ejecutiva", label: "Clase Ejecutiva", sub: "Espacio ergonómico ideal para trabajar o descansar" },
        { val: "Clase Normal", label: "Clase Normal", sub: "Excelente relación calidad-precio y eficiencia garantizada" }
      ]
    },
    {
      id: "q7_probability",
      category: "Recomendación",
      title: "¿Qué tan probable es que elijas o recomiendes SENAIR para tu próximo viaje?",
      desc: "Tu recomendación es clave para nuestro crecimiento y validación del proyecto.",
      type: "single",
      options: [
        { val: "Totalmente Seguro (10/10)", label: "¡Totalmente seguro! (10 de 10)", sub: "Será mi primera opción al momento de volar" },
        { val: "Muy Probable (8/10)", label: "Muy probable (8 de 10)", sub: "La consideraré firmemente entre mis opciones" },
        { val: "Probable (6/10)", label: "Probable (6 de 10)", sub: "Dependerá de las rutas y promociones vigentes" },
        { val: "Poco Probable", label: "Poco probable", sub: "Prefiero esperar a ver más rutas operando" }
      ]
    },
    {
      id: "q8_feedback",
      category: "Comentarios & Sugerencias",
      title: "¿Tienes algún comentario, felicitación o sugerencia para el equipo de SENAIR?",
      desc: "Escribe libremente cualquier sugerencia o aporte que desees dejarnos (Opcional).",
      type: "text",
      placeholder: "Escribe aquí tu opinión sobre la presentación, ideas para la plataforma o felicitaciones al equipo..."
    }
  ];

  // Estado local
  let surveyState = {
    token: null,
    participantName: "",
    currentIndex: 0,
    answers: {},
    isCompleted: false
  };

  // Referencias DOM
  const welcomeScreen = document.getElementById("welcomeScreen");
  const registerScreen = document.getElementById("registerScreen");
  const questionsScreen = document.getElementById("questionsScreen");
  const resultScreen = document.getElementById("resultScreen");

  const startSurveyBtn = document.getElementById("startSurveyBtn");
  const backToWelcomeBtn = document.getElementById("backToWelcomeBtn");
  const participantForm = document.getElementById("participantForm");
  const formErrorBanner = document.getElementById("formErrorBanner");

  const questionContainer = document.getElementById("questionContainer");
  const progressStepText = document.getElementById("progressStepText");
  const progressPctText = document.getElementById("progressPctText");
  const progressFill = document.getElementById("progressFill");
  const prevQuestionBtn = document.getElementById("prevQuestionBtn");
  const nextQuestionBtn = document.getElementById("nextQuestionBtn");

  // Modal Privacidad
  const openPrivacyModal = document.getElementById("openPrivacyModal");
  const closePrivacyModal = document.getElementById("closePrivacyModal");
  const confirmPrivacyModalBtn = document.getElementById("confirmPrivacyModalBtn");
  const privacyModalBackdrop = document.getElementById("privacyModalBackdrop");
  const privacyCheckbox = document.getElementById("privacyConsent");

  // Inicialización
  async function init() {
    setupEventListeners();
    await tryRestoreSession();
  }

  function setupEventListeners() {
    startSurveyBtn?.addEventListener("click", () => {
      showScreen("register");
    });

    backToWelcomeBtn?.addEventListener("click", () => {
      showScreen("welcome");
    });

    participantForm?.addEventListener("submit", handleRegisterSubmit);

    prevQuestionBtn?.addEventListener("click", () => {
      if (surveyState.currentIndex > 0) {
        surveyState.currentIndex--;
        renderCurrentQuestion();
      }
    });

    nextQuestionBtn?.addEventListener("click", handleNextOrFinish);

    // Modal Privacidad
    openPrivacyModal?.addEventListener("click", () => {
      if (privacyModalBackdrop) {
        privacyModalBackdrop.style.display = "flex";
        privacyModalBackdrop.setAttribute("aria-hidden", "false");
      }
    });

    const hidePrivacy = () => {
      if (privacyModalBackdrop) {
        privacyModalBackdrop.style.display = "none";
        privacyModalBackdrop.setAttribute("aria-hidden", "true");
      }
    };

    closePrivacyModal?.addEventListener("click", hidePrivacy);
    confirmPrivacyModalBtn?.addEventListener("click", () => {
      hidePrivacy();
      if (privacyCheckbox) privacyCheckbox.checked = true;
    });

    privacyModalBackdrop?.addEventListener("click", (e) => {
      if (e.target === privacyModalBackdrop) hidePrivacy();
    });

    const restartSurveyBtn = document.getElementById("restartSurveyBtn");
    restartSurveyBtn?.addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      sessionStorage.removeItem(STORAGE_NAME_KEY);
      surveyState.token = null;
      surveyState.participantName = "";
      surveyState.currentIndex = 0;
      surveyState.answers = {};
      surveyState.isCompleted = false;
      participantForm?.reset();
      showScreen("welcome");
    });

    // Soporte para teclas de navegación en escritorio
    document.addEventListener("keydown", (e) => {
      if (questionsScreen.style.display === "block") {
        if (e.key === "ArrowRight" && !e.target.matches("textarea, input")) {
          nextQuestionBtn?.click();
        } else if (e.key === "ArrowLeft" && !e.target.matches("textarea, input")) {
          prevQuestionBtn?.click();
        }
      }
    });
  }

  function showScreen(screen) {
    if (welcomeScreen) welcomeScreen.style.display = screen === "welcome" ? "block" : "none";
    if (registerScreen) registerScreen.style.display = screen === "register" ? "block" : "none";
    if (questionsScreen) questionsScreen.style.display = screen === "questions" ? "block" : "none";
    if (resultScreen) resultScreen.style.display = screen === "result" ? "block" : "none";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function tryRestoreSession() {
    const savedToken = sessionStorage.getItem(STORAGE_TOKEN_KEY) || localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!savedToken) {
      showScreen("welcome");
      return;
    }

    try {
      const res = await fetch(`/api/survey/state?token=${encodeURIComponent(savedToken)}`);
      if (!res.ok) {
        showScreen("welcome");
        return;
      }
      const data = await res.json();
      if (data.success && data.participant) {
        surveyState.token = savedToken;
        surveyState.participantName = data.participant.name;
        surveyState.answers = data.answers || {};

        if (data.participant.status === "completed") {
          surveyState.isCompleted = true;
          renderResults(data.participant);
          showScreen("result");
          return;
        }

        // Buscar la primera pregunta sin responder
        let firstUnanswered = QUESTIONS.findIndex((q) => !surveyState.answers[q.id]);
        surveyState.currentIndex = firstUnanswered !== -1 ? firstUnanswered : 0;

        showScreen("questions");
        renderCurrentQuestion();
      } else {
        showScreen("welcome");
      }
    } catch (e) {
      console.warn("No se pudo restaurar estado de encuesta previa:", e);
      showScreen("welcome");
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    if (formErrorBanner) formErrorBanner.style.display = "none";

    const nameInput = document.getElementById("pName");
    const emailInput = document.getElementById("pEmail");
    const ageSelect = document.getElementById("pAge");
    const cityInput = document.getElementById("pCity");
    const privacyCheck = document.getElementById("privacyConsent");

    const name = nameInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const age_range = ageSelect?.value || "";
    const city = cityInput?.value.trim() || "";
    const privacy_accepted = privacyCheck?.checked;

    if (!name || name.length < 2) {
      showError("Por favor ingresa tu nombre completo (mínimo 2 caracteres).");
      nameInput?.focus();
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("El formato del correo electrónico no es válido.");
      emailInput?.focus();
      return;
    }

    if (!privacy_accepted) {
      showError("Debes aceptar el aviso de privacidad y tratamiento de datos personales conforme a la Ley 1581 de 2012 para participar.");
      return;
    }

    const submitBtn = document.getElementById("submitRegisterBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Registrando...";
    }

    try {
      const res = await fetch("/api/survey/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, age_range, city, privacy_accepted: 1 })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showError(data.message || "No se pudo registrar la participación. Intenta de nuevo.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Iniciar Preguntas";
        }
        return;
      }

      surveyState.token = data.token;
      surveyState.participantName = data.name;
      surveyState.currentIndex = 0;
      surveyState.answers = {};

      sessionStorage.setItem(STORAGE_TOKEN_KEY, data.token);
      localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
      sessionStorage.setItem(STORAGE_NAME_KEY, data.name);

      showScreen("questions");
      renderCurrentQuestion();
    } catch (err) {
      showError("Error de conexión al registrar. Verifica tu red e inténtalo de nuevo.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Iniciar Preguntas";
      }
    }
  }

  function showError(msg) {
    if (!formErrorBanner) return;
    formErrorBanner.textContent = msg;
    formErrorBanner.style.display = "block";
    formErrorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderCurrentQuestion() {
    const q = QUESTIONS[surveyState.currentIndex];
    if (!q) return;

    // Actualizar Progreso
    const total = QUESTIONS.length;
    const currentStep = surveyState.currentIndex + 1;
    const pct = Math.round((currentStep / total) * 100);

    if (progressStepText) progressStepText.textContent = `Pregunta ${currentStep} de ${total}`;
    if (progressPctText) progressPctText.textContent = `${pct}%`;
    if (progressFill) progressFill.style.width = `${pct}%`;

    // Botones Nav
    if (prevQuestionBtn) {
      prevQuestionBtn.style.visibility = surveyState.currentIndex === 0 ? "hidden" : "visible";
    }

    if (nextQuestionBtn) {
      if (surveyState.currentIndex === total - 1) {
        nextQuestionBtn.innerHTML = `Finalizar Encuesta <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      } else {
        nextQuestionBtn.innerHTML = `Siguiente <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      }
    }

    // Renderizado según tipo
    const currentAnswer = surveyState.answers[q.id] || "";
    let html = `
      <span class="q-category-tag">${escapeHtml(q.category)}</span>
      <h3 class="q-title">${escapeHtml(q.title)}</h3>
      <p class="q-desc">${escapeHtml(q.desc)}</p>
    `;

    if (q.type === "single") {
      html += `<div class="options-grid">`;
      q.options.forEach((opt) => {
        const isSelected = currentAnswer === opt.val;
        html += `
          <div class="option-card ${isSelected ? "selected" : ""}" data-val="${escapeHtml(opt.val)}">
            <div class="option-indicator"></div>
            <div class="option-text-wrap">
              <span class="option-main-text">${escapeHtml(opt.label)}</span>
              ${opt.sub ? `<span class="option-sub-text">${escapeHtml(opt.sub)}</span>` : ""}
            </div>
          </div>
        `;
      });
      html += `</div>`;
    } else if (q.type === "rating") {
      const selectedRating = parseInt(currentAnswer, 10) || 0;
      html += `
        <div class="rating-stars-wrap">
          <div class="stars-row" id="starsRow">
            ${[1, 2, 3, 4, 5].map((star) => `
              <button type="button" class="star-btn ${star <= selectedRating ? "active" : ""}" data-star="${star}" aria-label="${star} estrellas">★</button>
            `).join("")}
          </div>
          <div class="star-label-badge" id="starLabelBadge">
            ${selectedRating > 0 ? (q.labels[selectedRating] || "") : "Selecciona tu calificación"}
          </div>
        </div>
      `;
    } else if (q.type === "text") {
      html += `
        <div class="form-group" style="margin-top: 10px;">
          <textarea id="feedbackTextarea" class="survey-textarea" rows="4" placeholder="${escapeHtml(q.placeholder)}" maxlength="500">${escapeHtml(currentAnswer)}</textarea>
        </div>
      `;
    }

    questionContainer.innerHTML = html;

    // Vincular Eventos de selección
    if (q.type === "single") {
      const cards = questionContainer.querySelectorAll(".option-card");
      cards.forEach((card) => {
        card.addEventListener("click", () => {
          const val = card.getAttribute("data-val");
          cards.forEach((c) => c.classList.remove("selected"));
          card.classList.add("selected");
          saveAnswer(q.id, q.title, val);

          // Auto-avance suave después de 300ms
          setTimeout(() => {
            if (surveyState.currentIndex < QUESTIONS.length - 1) {
              surveyState.currentIndex++;
              renderCurrentQuestion();
            }
          }, 320);
        });
      });
    } else if (q.type === "rating") {
      const starBtns = questionContainer.querySelectorAll(".star-btn");
      const labelBadge = document.getElementById("starLabelBadge");

      starBtns.forEach((btn) => {
        const starVal = parseInt(btn.getAttribute("data-star"), 10);

        btn.addEventListener("mouseenter", () => {
          starBtns.forEach((b) => {
            const bVal = parseInt(b.getAttribute("data-star"), 10);
            b.classList.toggle("hover", bVal <= starVal);
          });
          if (labelBadge && q.labels[starVal]) {
            labelBadge.textContent = q.labels[starVal];
          }
        });

        btn.addEventListener("mouseleave", () => {
          starBtns.forEach((b) => b.classList.remove("hover"));
          const current = parseInt(surveyState.answers[q.id], 10) || 0;
          if (labelBadge) {
            labelBadge.textContent = current > 0 ? q.labels[current] : "Selecciona tu calificación";
          }
        });

        btn.addEventListener("click", () => {
          starBtns.forEach((b) => {
            const bVal = parseInt(b.getAttribute("data-star"), 10);
            b.classList.toggle("active", bVal <= starVal);
          });
          saveAnswer(q.id, q.title, String(starVal));
          if (labelBadge && q.labels[starVal]) {
            labelBadge.textContent = q.labels[starVal];
          }

          setTimeout(() => {
            if (surveyState.currentIndex < QUESTIONS.length - 1) {
              surveyState.currentIndex++;
              renderCurrentQuestion();
            }
          }, 350);
        });
      });
    } else if (q.type === "text") {
      const tx = document.getElementById("feedbackTextarea");
      tx?.addEventListener("input", () => {
        surveyState.answers[q.id] = tx.value;
      });
    }
  }

  async function saveAnswer(question_id, question_text, answer) {
    surveyState.answers[question_id] = answer;
    if (!surveyState.token) return;

    try {
      await fetch("/api/survey/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: surveyState.token,
          question_id,
          question_text,
          answer
        })
      });
    } catch (e) {
      console.warn("No se pudo persistir respuesta en backend:", e);
    }
  }

  async function handleNextOrFinish() {
    const q = QUESTIONS[surveyState.currentIndex];
    if (q.type === "text") {
      const tx = document.getElementById("feedbackTextarea");
      const val = tx?.value.trim() || "";
      await saveAnswer(q.id, q.title, val);
    }

    // Validar si la pregunta obligatoria fue respondida
    if (q.type !== "text" && !surveyState.answers[q.id]) {
      if (typeof window.senairAlert === "function") {
        window.senairAlert({
          type: "info",
          title: "Pregunta pendiente",
          message: "Por favor selecciona una respuesta para continuar."
        });
      } else {
        alert("Por favor selecciona una respuesta para continuar.");
      }
      return;
    }

    if (surveyState.currentIndex < QUESTIONS.length - 1) {
      surveyState.currentIndex++;
      renderCurrentQuestion();
    } else {
      await completeSurvey();
    }
  }

  async function completeSurvey() {
    if (nextQuestionBtn) {
      nextQuestionBtn.disabled = true;
      nextQuestionBtn.textContent = "Procesando resultados...";
    }

    // Calcular Perfil de Viajero
    const answers = surveyState.answers;
    let profile = "Viajero Visionario Digital";
    let icon = "🚀";
    let desc = "Valoras la agilidad tecnológica, el diseño interactivo y la facilidad de reservar desde cualquier dispositivo.";

    if (answers.q6_cabin === "Primera Clase" || answers.q1_frequency === "Varias veces al mes") {
      profile = "Viajero Ejecutivo Premier";
      icon = "👑";
      desc = "Buscas excelencia a bordo, comodidad sin límites y una experiencia de alto nivel en cada trayecto.";
    } else if (answers.q2_destination === "Playas y Caribe") {
      profile = "Explorador de Playas & Paraísos";
      icon = "🏖️";
      desc = "Disfrutas el sol, el descanso en la costa y desconectar de la rutina en los mejores destinos del Caribe.";
    } else if (answers.q2_destination === "Aventura y Naturaleza" || answers.q2_destination === "Cultura y Gastronomía") {
      profile = "Nómada de Cultura & Aventura";
      icon = "🧭";
      desc = "Te apasiona descubrir paisajes naturales impresionantes, tradiciones locales y gastronomía inolvidable.";
    }

    try {
      const res = await fetch("/api/survey/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: surveyState.token,
          traveler_profile: profile
        })
      });
      const data = await res.json();
      surveyState.isCompleted = true;

      renderResults({
        name: surveyState.participantName,
        traveler_profile: profile,
        profile_icon: icon,
        profile_desc: desc
      });

      showScreen("result");
    } catch (e) {
      console.error("Error al completar encuesta:", e);
      renderResults({
        name: surveyState.participantName,
        traveler_profile: profile,
        profile_icon: icon,
        profile_desc: desc
      });
      showScreen("result");
    }
  }

  function renderResults(info) {
    const pName = document.getElementById("bpPassengerName");
    const pTitle = document.getElementById("bpProfileTitle");
    const pDesc = document.getElementById("bpProfileDesc");
    const pIcon = document.getElementById("bpProfileIcon");
    const bpDate = document.getElementById("bpDate");
    const bpCode = document.getElementById("bpCode");

    if (pName) pName.textContent = info.name || surveyState.participantName || "Visitante SENAIR";
    if (pTitle) pTitle.textContent = info.traveler_profile || "Viajero Visionario Digital";

    if (pIcon) {
      if (info.traveler_profile?.includes("Ejecutivo")) pIcon.textContent = "👑";
      else if (info.traveler_profile?.includes("Playas")) pIcon.textContent = "🏖️";
      else if (info.traveler_profile?.includes("Cultura") || info.traveler_profile?.includes("Aventura")) pIcon.textContent = "🧭";
      else pIcon.textContent = "🚀";
    }

    if (pDesc) {
      if (info.traveler_profile?.includes("Ejecutivo")) {
        pDesc.textContent = "Buscas excelencia a bordo, comodidad sin límites y una experiencia de alto nivel en cada trayecto.";
      } else if (info.traveler_profile?.includes("Playas")) {
        pDesc.textContent = "Disfrutas el sol, el descanso en la costa y desconectar de la rutina en los mejores destinos del Caribe.";
      } else if (info.traveler_profile?.includes("Cultura") || info.traveler_profile?.includes("Aventura")) {
        pDesc.textContent = "Te apasiona descubrir paisajes naturales impresionantes, tradiciones locales y gastronomía inolvidable.";
      } else {
        pDesc.textContent = "Valoras la agilidad tecnológica, el diseño interactivo y la facilidad de reservar desde cualquier dispositivo.";
      }
    }

    const now = new Date();
    const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    if (bpDate) bpDate.textContent = formattedDate;

    if (bpCode) {
      const codeNum = Math.floor(1000 + Math.random() * 9000);
      bpCode.textContent = `SEN-${codeNum}-OK`;
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

