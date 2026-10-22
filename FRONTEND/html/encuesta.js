/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Controlador de Encuesta Interactiva (Feria de Software)
 * Flujo Conversacional por Pasos, Registro Persistente y Validación Backend
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  // Estado reactivo central
  const state = {
    currentStageIndex: 0,
    participant: {
      name: "",
      email: "",
      ageRange: "21-30",
      city: "",
      token: null,
      id: null
    },
    answers: {
      q1_satisfaction: null,
      q2_ease: null,
      q3_punctuality: null,
      q4_improvements: [],
      q5_nps: null,
      q6_feedback: ""
    },
    isSubmitting: false,
    completed: false
  };

  // Secuencia lineal de etapas
  const STAGES = [
    "stageWelcome",   // 0
    "stageRegister",  // 1
    "stageQ1",        // 2
    "stageQ2",        // 3
    "stageQ3",        // 4
    "stageQ4",        // 5
    "stageQ5",        // 6
    "stageQ6",        // 7 (Resumen Boarding Pass & Comentarios)
    "stageCompletion" // 8 (Agradecimiento final)
  ];

  const STAR_LABELS = {
    q1: {
      1: "1 ★ // Muy Insatisfecho",
      2: "2 ★ // Insatisfecho / Regular",
      3: "3 ★ // Aceptable / Conforme",
      4: "4 ★ // Muy Satisfecho",
      5: "5 ★ // ¡Totalmente Satisfecho!"
    },
    q2: {
      1: "1 ★ // Muy Compleja",
      2: "2 ★ // Difícil de Usar",
      3: "3 ★ // Aceptable",
      4: "4 ★ // Rápida e Intuitiva",
      5: "5 ★ // ¡Impecable y Fluida!"
    }
  };

  // ── 1. Inicialización ──────────────────────────────────────────────
  function init() {
    bindStageNavigation();
    bindRegistrationForm();
    bindStarRatings();
    bindPunctualityCards();
    bindAmenitiesGrid();
    bindNpsTiles();
    bindTextInputs();
    bindFinalSubmission();
    bindRestart();

    // Iniciar en Welcome
    goToStage(0);
  }

  // ── 2. Gestor de Navegación entre Etapas ───────────────────────────
  function goToStage(index) {
    if (index < 0 || index >= STAGES.length) return;

    state.currentStageIndex = index;
    const stageId = STAGES[index];

    // Alternar visibilidad de secciones
    document.querySelectorAll(".stage-section").forEach((sec) => {
      sec.classList.remove("active");
    });

    const activeSec = document.getElementById(stageId);
    if (activeSec) {
      activeSec.classList.add("active");
    }

    // Desplazarse al tope con suavidad
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Actualizar Stepper del Header (Solo visible en preguntas Q1..Q6)
    const stepper = document.getElementById("stepperIndicator");
    const counterLabel = document.getElementById("stepCounterLabel");
    const progressFill = document.getElementById("miniProgressFill");

    if (index >= 2 && index <= 7) {
      if (stepper) stepper.style.display = "flex";
      const qNum = index - 1; // 1 a 6
      if (counterLabel) counterLabel.textContent = `PASO ${qNum} DE 6`;
      if (progressFill) progressFill.style.width = `${Math.round((qNum / 6) * 100)}%`;
    } else {
      if (stepper) stepper.style.display = "none";
    }

    // Si llegamos al resumen (Stage 7), actualizar el pasabordo
    if (index === 7) {
      updateBoardingPassSummary();
    }
  }

  function bindStageNavigation() {
    // Botón de inicio en Welcome
    document.getElementById("btnStartExperience")?.addEventListener("click", () => {
      goToStage(1); // Ir a Registro
    });

    // Botón volver de Registro a Welcome
    document.getElementById("btnBackToWelcome")?.addEventListener("click", () => {
      goToStage(0);
    });

    // Botones con data-action="prev"
    document.querySelectorAll("[data-action='prev']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.currentStageIndex > 2) {
          goToStage(state.currentStageIndex - 1);
        } else if (state.currentStageIndex === 2) {
          goToStage(1); // Volver al registro
        }
      });
    });

    // Botones Siguiente de preguntas
    document.getElementById("btnNextQ1")?.addEventListener("click", () => {
      if (!validateCurrentQuestion("q1_satisfaction", "Por favor selecciona una calificación de 1 a 5 estrellas.")) return;
      goToStage(3);
    });

    document.getElementById("btnNextQ2")?.addEventListener("click", () => {
      if (!validateCurrentQuestion("q2_ease", "Por favor califica la agilidad de la web.")) return;
      goToStage(4);
    });

    document.getElementById("btnNextQ3")?.addEventListener("click", () => {
      if (!validateCurrentQuestion("q3_punctuality", "Por favor selecciona una opción de puntualidad.")) return;
      goToStage(5);
    });

    document.getElementById("btnNextQ4")?.addEventListener("click", () => {
      // Q4 es opcional o selección múltiple
      goToStage(6);
    });

    document.getElementById("btnNextQ5")?.addEventListener("click", () => {
      if (state.answers.q5_nps === null || state.answers.q5_nps === undefined) {
        alert("Por favor selecciona tu probabilidad de recomendación en la escala NPS.");
        return;
      }
      goToStage(7);
    });
  }

  function validateCurrentQuestion(key, errorMsg) {
    if (!state.answers[key]) {
      alert(errorMsg);
      return false;
    }
    return true;
  }

  // ── 3. Registro de Participantes (Etapa 2 con Persistencia Real) ───
  function bindRegistrationForm() {
    const form = document.getElementById("participantRegisterForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("regFullName");
      const emailInput = document.getElementById("regEmail");
      const ageSelect = document.getElementById("regAgeRange");
      const cityInput = document.getElementById("regCity");
      const privacyCheck = document.getElementById("regPrivacyConsent");

      const errName = document.getElementById("errFullName");
      const errEmail = document.getElementById("errEmail");
      const errPrivacy = document.getElementById("errPrivacy");

      if (errName) errName.textContent = "";
      if (errEmail) errEmail.textContent = "";
      if (errPrivacy) errPrivacy.textContent = "";

      const fullName = (nameInput?.value || "").trim();
      const email = (emailInput?.value || "").trim().toLowerCase();
      const ageRange = ageSelect?.value || "21-30";
      const city = (cityInput?.value || "").trim();
      const privacyAccepted = Boolean(privacyCheck?.checked);

      let hasError = false;

      if (!fullName || fullName.length < 3) {
        if (errName) errName.textContent = "Por favor ingresa tu nombre completo.";
        hasError = true;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        if (errEmail) errEmail.textContent = "Ingresa un correo electrónico válido.";
        hasError = true;
      }

      if (!privacyAccepted) {
        if (errPrivacy) errPrivacy.textContent = "Debes autorizar el tratamiento de datos para continuar.";
        hasError = true;
      }

      if (hasError) return;

      const submitBtn = document.getElementById("btnSubmitRegister");
      const btnText = submitBtn?.querySelector(".btn-text");
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = "Registrando en base de datos...";

      try {
        const res = await fetch("/api/survey/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            email,
            age_range: ageRange,
            city,
            privacy_accepted: true
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          state.participant.name = fullName;
          state.participant.email = email;
          state.participant.ageRange = ageRange;
          state.participant.city = city;
          state.participant.token = data.token;
          state.participant.id = data.participantId;

          // Guardar token en sessionStorage
          sessionStorage.setItem("senair_survey_token", data.token);

          // Avanzar a la primera pregunta (Q1)
          goToStage(2);
        } else {
          throw new Error(data.message || "Error al registrar participante.");
        }
      } catch (err) {
        console.warn("[SENAIR] Error conectando con backend. Guardando en modo local seguro:", err);
        // Fallback local seguro para que la feria no se detenga
        state.participant.name = fullName;
        state.participant.email = email;
        state.participant.token = "offline_" + Date.now();
        goToStage(2);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = "Confirmar Registro y Despegar";
      }
    });
  }

  // ── 4. Controladores de Preguntas (Estrellas, Opciones, NPS) ────────
  function bindStarRatings() {
    setupStarRow("starsRowQ1", "badgeQ1", "q1_satisfaction", "q1", 3);
    setupStarRow("starsRowQ2", "badgeQ2", "q2_ease", "q2", 4);
  }

  function setupStarRow(rowId, badgeId, stateKey, labelKey, nextStageIdx) {
    const row = document.getElementById(rowId);
    const badge = document.getElementById(badgeId);
    if (!row) return;

    const btns = row.querySelectorAll(".star-interactive-btn");

    btns.forEach((btn) => {
      const val = parseInt(btn.getAttribute("data-val"), 10);

      btn.addEventListener("mouseenter", () => {
        highlightStars(btns, val);
        if (badge) badge.textContent = STAR_LABELS[labelKey][val];
      });

      btn.addEventListener("mouseleave", () => {
        const cur = state.answers[stateKey];
        highlightStars(btns, cur || 0);
        if (badge) {
          badge.textContent = cur
            ? STAR_LABELS[labelKey][cur]
            : "Selecciona una calificación para continuar";
        }
      });

      btn.addEventListener("click", () => {
        state.answers[stateKey] = val;
        highlightStars(btns, val);
        if (badge) badge.textContent = STAR_LABELS[labelKey][val];

        // Guardar respuesta en backend
        saveAnswer(stateKey, "Satisfacción", val);

        // Auto avance suave tras 380ms
        setTimeout(() => {
          goToStage(nextStageIdx);
        }, 380);
      });
    });
  }

  function highlightStars(btns, count) {
    btns.forEach((b) => {
      const v = parseInt(b.getAttribute("data-val"), 10);
      b.classList.toggle("active", v <= count);
    });
  }

  function bindPunctualityCards() {
    const cards = document.querySelectorAll(".tech-choice-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const val = card.getAttribute("data-val");
        cards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        state.answers.q3_punctuality = val;

        saveAnswer("q3_punctuality", "Puntualidad del vuelo", val);

        setTimeout(() => {
          goToStage(5);
        }, 380);
      });
    });
  }

  function bindAmenitiesGrid() {
    const chips = document.querySelectorAll(".amenity-chip-item");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const val = chip.getAttribute("data-val");
        chip.classList.toggle("selected");
        const isSelected = chip.classList.contains("selected");

        const list = state.answers.q4_improvements;
        const idx = list.indexOf(val);
        if (isSelected && idx === -1) {
          list.push(val);
        } else if (!isSelected && idx !== -1) {
          list.splice(idx, 1);
        }

        saveAnswer("q4_improvements", "Aspectos por potenciar", list.join(", "));
      });
    });
  }

  function bindNpsTiles() {
    const btns = document.querySelectorAll(".nps-tile-button");
    const displayScore = document.getElementById("npsDisplayScore");
    const displayCategory = document.getElementById("npsDisplayCategory");

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseInt(btn.getAttribute("data-val"), 10);
        btns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        state.answers.q5_nps = val;

        let cat = "PASIVO";
        if (val >= 9) cat = "¡PROMOTOR TOTAL!";
        else if (val <= 6) cat = "DETRACTOR";

        if (displayScore) displayScore.textContent = `${val} / 10`;
        if (displayCategory) displayCategory.textContent = cat;

        saveAnswer("q5_nps", "Recomendación NPS", val);

        setTimeout(() => {
          goToStage(7); // Ir a Resumen
        }, 400);
      });
    });
  }

  function bindTextInputs() {
    const feedback = document.getElementById("feedbackTextInput");
    feedback?.addEventListener("input", (e) => {
      state.answers.q6_feedback = e.target.value.trim();
    });
  }

  // ── 5. Guardado de Respuestas en Servidor ──────────────────────────
  async function saveAnswer(questionId, questionText, answerVal) {
    const token = state.participant.token;
    if (!token) return;

    try {
      await fetch("/api/survey/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-survey-token": token
        },
        body: JSON.stringify({
          token,
          question_id: questionId,
          question_text: questionText,
          answer: String(answerVal)
        })
      });
    } catch (e) {
      console.warn("[SENAIR] Guardado de paso diferido:", e);
    }
  }

  // ── 6. Actualización del Boarding Pass en Tiempo Real ─────────────
  function updateBoardingPassSummary() {
    const pName = document.getElementById("bpPassengerName");
    const pEmail = document.getElementById("bpPassengerEmail");
    const valQ1 = document.getElementById("bpValQ1");
    const valQ2 = document.getElementById("bpValQ2");
    const valQ3 = document.getElementById("bpValQ3");
    const valQ4 = document.getElementById("bpValQ4");
    const valQ5 = document.getElementById("bpValQ5");

    if (pName) pName.textContent = state.participant.name || "Viajero SENAIR";
    if (pEmail) pEmail.textContent = state.participant.email || "Anonimizado";

    const { q1_satisfaction, q2_ease, q3_punctuality, q4_improvements, q5_nps } = state.answers;

    if (valQ1) {
      valQ1.textContent = q1_satisfaction ? `${q1_satisfaction} ★ (${STAR_LABELS.q1[q1_satisfaction].split("//")[1].trim()})` : "Pendiente";
    }
    if (valQ2) {
      valQ2.textContent = q2_ease ? `${q2_ease} ★ (${STAR_LABELS.q2[q2_ease].split("//")[1].trim()})` : "Pendiente";
    }
    if (valQ3) {
      valQ3.textContent = q3_punctuality ? `Vuelo ${q3_punctuality}` : "Pendiente";
    }
    if (valQ4) {
      valQ4.textContent = q4_improvements.length > 0 ? q4_improvements.join(" • ") : "Ninguno marcado (Servicio óptimo)";
    }
    if (valQ5) {
      if (q5_nps !== null && q5_nps !== undefined) {
        let cat = q5_nps >= 9 ? "Promotor" : (q5_nps <= 6 ? "Detractor" : "Pasivo");
        valQ5.textContent = `${q5_nps} / 10 (${cat})`;
      } else {
        valQ5.textContent = "Pendiente";
      }
    }
  }

  // ── 7. Finalización & Envío Completo ──────────────────────────────
  function bindFinalSubmission() {
    const submitBtn = document.getElementById("btnFinalSubmit");
    const errorBanner = document.getElementById("errorBannerSubmit");
    if (!submitBtn) return;

    submitBtn.addEventListener("click", async () => {
      if (state.isSubmitting) return;

      const missing = [];
      if (!state.answers.q1_satisfaction) missing.push("Pregunta 1");
      if (!state.answers.q2_ease) missing.push("Pregunta 2");
      if (!state.answers.q3_punctuality) missing.push("Pregunta 3");
      if (state.answers.q5_nps === null || state.answers.q5_nps === undefined) missing.push("Pregunta 5");

      if (missing.length > 0) {
        if (errorBanner) {
          errorBanner.innerHTML = `<strong>⚠️ Faltan respuestas obligatorias:</strong> Por favor responde: ${missing.join(", ")}.`;
          errorBanner.style.display = "block";
        }
        return;
      }

      if (errorBanner) errorBanner.style.display = "none";

      state.isSubmitting = true;
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = "Guardando en base de datos...";

      // Guardar comentario si existe
      if (state.answers.q6_feedback) {
        await saveAnswer("q6_feedback", "Comentarios libres", state.answers.q6_feedback);
      }

      const token = state.participant.token;

      try {
        // Enviar finalización oficial
        const res = await fetch("/api/survey/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-survey-token": token || ""
          },
          body: JSON.stringify({ token })
        });

        const data = await res.json();
        handleCompletionSuccess(data);
      } catch (err) {
        console.warn("[SENAIR] Completado offline:", err);
        // Fallback vía /api/survey/submit por lote
        try {
          await fetch("/api/survey/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: state.participant.name,
              email: state.participant.email,
              answers: state.answers
            })
          });
        } catch (e2) {
          saveLocalBackup();
        }
        handleCompletionSuccess({});
      } finally {
        state.isSubmitting = false;
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = "Finalizar y Guardar Encuesta";
      }
    });
  }

  function handleCompletionSuccess(data) {
    state.completed = true;

    // Generar código de confirmación
    const confCode = document.getElementById("completionConfirmationCode");
    const randomCode = "SA-" + Math.floor(1000 + Math.random() * 9000);
    if (confCode) confCode.textContent = randomCode;

    // Disparar confeti sutil de celebración
    if (typeof confetti === "function") {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#0866c6", "#38bdf8", "#fbbf24", "#ffffff"]
        });
      } catch (e) {
        console.log("Confetti trigger:", e);
      }
    }

    // Pasar a la etapa final de agradecimiento
    goToStage(8);
  }

  function saveLocalBackup() {
    try {
      const stored = JSON.parse(localStorage.getItem("senair_surveys_backup") || "[]");
      stored.push({
        participant: state.participant,
        answers: state.answers,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem("senair_surveys_backup", JSON.stringify(stored));
    } catch (e) {
      console.error("[SENAIR] No se pudo guardar respaldo offline:", e);
    }
  }

  // ── 8. Reiniciar Encuesta para Otro Visitante ──────────────────────
  function bindRestart() {
    document.getElementById("btnRestartForNewVisitor")?.addEventListener("click", () => {
      state.currentStageIndex = 0;
      state.participant = {
        name: "",
        email: "",
        ageRange: "21-30",
        city: "",
        token: null,
        id: null
      };
      state.answers = {
        q1_satisfaction: null,
        q2_ease: null,
        q3_punctuality: null,
        q4_improvements: [],
        q5_nps: null,
        q6_feedback: ""
      };
      state.completed = false;

      // Limpiar formulario de registro
      const form = document.getElementById("participantRegisterForm");
      if (form) form.reset();

      // Limpiar clases interactivas
      document.querySelectorAll(".star-interactive-btn").forEach((s) => s.classList.remove("active"));
      document.querySelectorAll(".tech-choice-card").forEach((c) => c.classList.remove("selected"));
      document.querySelectorAll(".amenity-chip-item").forEach((a) => a.classList.remove("selected"));
      document.querySelectorAll(".nps-tile-button").forEach((n) => n.classList.remove("selected"));

      const badgeQ1 = document.getElementById("badgeQ1");
      const badgeQ2 = document.getElementById("badgeQ2");
      const npsScore = document.getElementById("npsDisplayScore");
      const npsCat = document.getElementById("npsDisplayCategory");
      const feedback = document.getElementById("feedbackTextInput");

      if (badgeQ1) badgeQ1.textContent = "Selecciona una calificación para continuar";
      if (badgeQ2) badgeQ2.textContent = "Selecciona una calificación para continuar";
      if (npsScore) npsScore.textContent = "--";
      if (npsCat) npsCat.textContent = "SELECCIONA UN VALOR";
      if (feedback) feedback.value = "";

      // Regresar a la pantalla de bienvenida
      goToStage(0);
    });
  }

  // Inicializar al cargar el DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
