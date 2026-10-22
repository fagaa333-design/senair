/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Controlador de Estado, Validación y Envío de la Encuesta
 * Gestión de Respuestas, Interacción de Controles y Comunicación con API
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  // Estado reactivo de la encuesta
  const surveyState = {
    answers: {
      q1_satisfaction: null,
      q2_ease: null,
      q3_punctuality: null,
      q4_improvements: [],
      q5_nps: null,
      q6_feedback: ""
    },
    userEmail: "",
    isSubmitting: false,
    isCompleted: false
  };

  // Inicialización
  function init() {
    bindInteractiveControls();
    setupSubmissionFlow();

    // Inicializar animaciones de GSAP si están disponibles
    if (window.FlightAnimator) {
      window.FlightAnimator.init();
    }
  }

  // ── 1. Vinculación de Controles Interactivos ───────────────────────
  function bindInteractiveControls() {
    // Botón de despegue en el Hero
    const takeoffBtn = document.getElementById("takeoffBtn");
    takeoffBtn?.addEventListener("click", () => {
      window.FlightAnimator?.scrollToStage(1);
    });

    // Q1 & Q2: Estrellas de Calificación
    setupStarRating("q1_satisfaction", "starsRowQ1", "starBadgeQ1", 2);
    setupStarRating("q2_ease", "starsRowQ2", "starBadgeQ2", 3);

    // Q3: Opción Única (Puntualidad)
    const q3Cards = document.querySelectorAll('.choice-card-item[data-qid="q3_punctuality"]');
    q3Cards.forEach((card) => {
      card.addEventListener("click", () => {
        const val = card.getAttribute("data-val");
        q3Cards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        surveyState.answers.q3_punctuality = val;

        // Auto-avance suave hacia la siguiente etapa
        setTimeout(() => {
          window.FlightAnimator?.scrollToStage(4);
        }, 360);
      });
    });

    // Q4: Selección Múltiple (Mejoras)
    const q4Cards = document.querySelectorAll('.multi-tag-card[data-qid="q4_improvements"]');
    q4Cards.forEach((card) => {
      card.addEventListener("click", () => {
        const val = card.getAttribute("data-val");
        card.classList.toggle("selected");

        const index = surveyState.answers.q4_improvements.indexOf(val);
        if (index > -1) {
          surveyState.answers.q4_improvements.splice(index, 1);
        } else {
          surveyState.answers.q4_improvements.push(val);
        }
      });
    });

    // Q5: Escala NPS 0 a 10
    const npsBtns = document.querySelectorAll(".nps-tile-btn");
    npsBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseInt(btn.getAttribute("data-nps"), 10);
        npsBtns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        surveyState.answers.q5_nps = val;

        // Auto-avance suave hacia el aterrizaje
        setTimeout(() => {
          window.FlightAnimator?.scrollToStage(6);
        }, 400);
      });
    });

    // Q6: Textarea y Correo
    const feedbackTextarea = document.getElementById("feedbackTextarea");
    feedbackTextarea?.addEventListener("input", (e) => {
      surveyState.answers.q6_feedback = e.target.value;
    });

    const contactEmailInput = document.getElementById("contactEmailInput");
    contactEmailInput?.addEventListener("input", (e) => {
      surveyState.userEmail = e.target.value.trim();
    });

    // Botón reiniciar encuesta para otro visitante
    const restartSurveyBtn = document.getElementById("restartSurveyBtn");
    restartSurveyBtn?.addEventListener("click", resetSurveyExperience);
  }

  // Helper para Calificación de Estrellas
  function setupStarRating(qid, rowId, badgeId, nextStageIndex) {
    const row = document.getElementById(rowId);
    const badge = document.getElementById(badgeId);
    if (!row) return;

    const qConfig = window.SURVEY_CONFIG?.QUESTIONS.find((q) => q.id === qid);
    const buttons = row.querySelectorAll(".star-interactive-btn");

    buttons.forEach((btn) => {
      const val = parseInt(btn.getAttribute("data-star"), 10);

      btn.addEventListener("mouseenter", () => {
        buttons.forEach((b) => {
          const bVal = parseInt(b.getAttribute("data-star"), 10);
          b.classList.toggle("hover", bVal <= val);
        });
        if (badge && qConfig?.labels[val]) {
          badge.textContent = qConfig.labels[val];
        }
      });

      btn.addEventListener("mouseleave", () => {
        buttons.forEach((b) => b.classList.remove("hover"));
        const current = surveyState.answers[qid];
        if (badge) {
          badge.textContent = current ? qConfig?.labels[current] : "Toca una estrella para calificar";
        }
      });

      btn.addEventListener("click", () => {
        surveyState.answers[qid] = val;
        buttons.forEach((b) => {
          const bVal = parseInt(b.getAttribute("data-star"), 10);
          b.classList.toggle("active", bVal <= val);
        });
        if (badge && qConfig?.labels[val]) {
          badge.textContent = qConfig.labels[val];
        }

        // Auto-avance suave
        setTimeout(() => {
          window.FlightAnimator?.scrollToStage(nextStageIndex);
        }, 380);
      });
    });
  }

  // ── 2. Validación y Envío de la Encuesta ──────────────────────────
  function setupSubmissionFlow() {
    const submitBtn = document.getElementById("submitFlightSurveyBtn");
    const toastBox = document.getElementById("validationToast");

    submitBtn?.addEventListener("click", async () => {
      if (surveyState.isSubmitting) return;

      // Validación de preguntas obligatorias
      const validation = validateRequiredAnswers();
      if (!validation.valid) {
        showValidationMessage(validation.message, toastBox);
        window.FlightAnimator?.scrollToStage(validation.missingStageIndex);
        highlightMissingCard(validation.missingStageIndex);
        return;
      }

      if (toastBox) toastBox.style.display = "none";
      surveyState.isSubmitting = true;

      // Estado de carga en el botón
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
        </svg>
        Aterrizando y registrando respuestas...
      `;

      // Calcular Perfil de Viajero
      const profile = calculateTravelerProfile(surveyState.answers);

      // Payload JSON a enviar
      const payload = {
        name: "Viajero SENAIR",
        email: surveyState.userEmail || null,
        answers: surveyState.answers,
        traveler_profile: profile.badge
      };

      try {
        const endpoint = window.SURVEY_CONFIG?.SURVEY_ENDPOINT || "/api/survey/submit";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok && !data.success) {
          throw new Error(data.message || "Error al registrar");
        }
      } catch (err) {
        console.warn("Conexión con servidor no disponible, guardando en persistencia local:", err);
        // Fallback local seguro (Stub solicitado)
        try {
          const stored = JSON.parse(localStorage.getItem("senair_survey_offline") || "[]");
          stored.push({ timestamp: new Date().toISOString(), payload });
          localStorage.setItem("senair_survey_offline", JSON.stringify(stored));
        } catch (_) {}
      } finally {
        surveyState.isSubmitting = false;
        surveyState.isCompleted = true;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Renderizar Boarding Pass Final
        renderFinalBoardingPass(profile);

        // Desplazar suavemente a la etapa de agradecimiento
        window.FlightAnimator?.scrollToStage(7);

        // Disparar confeti sutil de aterrizaje
        triggerLandingConfetti();
      }
    });
  }

  // Validación de respuestas requeridas
  function validateRequiredAnswers() {
    const a = surveyState.answers;

    if (!a.q1_satisfaction) {
      return { valid: false, message: "Por favor califica tu experiencia en la etapa de Despegue (Pregunta 1).", missingStageIndex: 1 };
    }
    if (!a.q2_ease) {
      return { valid: false, message: "Por favor indica qué tan fácil fue comprar tu reserva en Ascenso (Pregunta 2).", missingStageIndex: 2 };
    }
    if (!a.q3_punctuality) {
      return { valid: false, message: "Por favor califica la puntualidad de los vuelos en Crucero (Pregunta 3).", missingStageIndex: 3 };
    }
    if (!a.q4_improvements || a.q4_improvements.length === 0) {
      return { valid: false, message: "Por favor selecciona al menos un aspecto a mejorar en Crucero (Pregunta 4).", missingStageIndex: 4 };
    }
    if (a.q5_nps === null || a.q5_nps === undefined) {
      return { valid: false, message: "Por favor califica tu probabilidad de recomendación en Descenso (Pregunta 5).", missingStageIndex: 5 };
    }

    return { valid: true };
  }

  function showValidationMessage(msg, toastEl) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = "block";
    toastEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function highlightMissingCard(stageIndex) {
    const stage = document.getElementById(`stage-${stageIndex}`);
    const card = stage?.querySelector(".stage-card");
    if (!card) return;
    card.style.borderColor = "#e87562";
    card.style.boxShadow = "0 0 0 4px rgba(232, 117, 98, 0.25)";
    setTimeout(() => {
      card.style.borderColor = "";
      card.style.boxShadow = "";
    }, 2000);
  }

  // ── 3. Lógica del Perfil de Viajero SENAIR ─────────────────────────
  function calculateTravelerProfile(answers) {
    const q1 = Number(answers.q1_satisfaction || 0);
    const nps = Number(answers.q5_nps || 0);
    const punctuality = answers.q3_punctuality;
    const improvements = answers.q4_improvements || [];

    if (q1 === 5 && nps >= 9) {
      return {
        badge: "Viajero Embajador SENAIR",
        icon: "🌟",
        desc: "Tu confianza e ilusión por volar con nosotros nos inspira a mantener la más alta excelencia en cada despegue."
      };
    }

    if (punctuality === "Excelente" || q1 >= 4) {
      return {
        badge: "Viajero Confort & Puntualidad",
        icon: "👑",
        desc: "Valoras el cumplimiento riguroso de los tiempos, la comodidad a bordo y una atención de primer nivel."
      };
    }

    if (improvements.some((item) => item.includes("Check-in") || item.includes("app") || item.includes("Precios"))) {
      return {
        badge: "Viajero Visionario Digital",
        icon: "🚀",
        desc: "Aprovechas la innovación tecnológica, el mapa interactivo 3D y la rapidez de autogestión en línea."
      };
    }

    return {
      badge: "Explorador Frecuente",
      icon: "✈️",
      desc: "Volar es para ti una oportunidad de conectar con nuevos horizontes, culturas y personas inolvidables."
    };
  }

  // ── 4. Renderizado del Pase de Abordar Final ───────────────────────
  function renderFinalBoardingPass(profile) {
    const profileNameEl = document.getElementById("ticketProfileName");
    const profileDescEl = document.getElementById("ticketProfileDesc");
    const profileIconEl = document.getElementById("ticketProfileIcon");
    const ticketDateEl = document.getElementById("ticketDate");
    const ticketCodeEl = document.getElementById("ticketCode");

    if (profileNameEl) profileNameEl.textContent = profile.badge;
    if (profileDescEl) profileDescEl.textContent = profile.desc;
    if (profileIconEl) profileIconEl.textContent = profile.icon;

    const now = new Date();
    const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    if (ticketDateEl) {
      ticketDateEl.textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    if (ticketCodeEl) {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      ticketCodeEl.textContent = `SEN-VUELO-${randomCode}`;
    }
  }

  // Confeti sutil con canvas-confetti
  function triggerLandingConfetti() {
    if (typeof confetti === "function") {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#0866c6", "#38bdf8", "#fbbf24", "#10b981", "#ffffff"]
        });
      } catch (_) {}
    }
  }

  // Reiniciar experiencia en limpio
  function resetSurveyExperience() {
    surveyState.answers = {
      q1_satisfaction: null,
      q2_ease: null,
      q3_punctuality: null,
      q4_improvements: [],
      q5_nps: null,
      q6_feedback: ""
    };
    surveyState.userEmail = "";
    surveyState.isCompleted = false;

    // Resetear clases visuales
    document.querySelectorAll(".star-interactive-btn").forEach((b) => b.classList.remove("active", "hover"));
    document.querySelectorAll(".choice-card-item").forEach((b) => b.classList.remove("selected"));
    document.querySelectorAll(".multi-tag-card").forEach((b) => b.classList.remove("selected"));
    document.querySelectorAll(".nps-tile-btn").forEach((b) => b.classList.remove("selected"));

    const fb = document.getElementById("feedbackTextarea");
    if (fb) fb.value = "";
    const em = document.getElementById("contactEmailInput");
    if (em) em.value = "";

    window.FlightAnimator?.scrollToStage(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
