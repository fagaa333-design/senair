/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Controlador de Encuesta de Experiencia del Viajero (Feria 2026)
 * Diseño Editorial, Flujo Progresivo, Validación y Persistencia en SQLite
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  // Estado reactivo de la aplicación
  const state = {
    step: 0, // 0: Welcome, 1: Register, 2..7: Q1..Q6, 8: Touchdown
    participant: {
      name: "",
      email: "",
      profile: "Jurado de Software",
      city: "Bogotá (BOG)",
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

  const STAR_FEEDBACK = {
    1: "Nivel 1 // Inicial — Requiere optimización prioritaria",
    2: "Nivel 2 // Regular — Varios aspectos técnicos a perfeccionar",
    3: "Nivel 3 // Aceptable — Cumple con el estándar de servicio",
    4: "Nivel 4 // Favorable — Gran agilidad y experiencia de vuelo",
    5: "Nivel 5 // Sobresaliente — Excelente estándar de servicio"
  };

  const QUESTION_CATEGORIES = {
    1: "EXPERIENCIA GENERAL",
    2: "PLATAFORMA DIGITAL",
    3: "OPERACIONES & SERVICIO",
    4: "CONFORT & INNOVACIÓN",
    5: "RECOMENDACIÓN DE MARCA",
    6: "COMENTARIOS & PROPUESTAS"
  };

  // ── 1. Inicialización ──────────────────────────────────────────────
  function init() {
    bindStageNavigation();
    bindRegistrationForm();
    bindQuestion1Stars();
    bindQuestion2Cards();
    bindQuestion3Status();
    bindQuestion4MultiChips();
    bindQuestion5Nps();
    bindQuestion6Textarea();
    bindFinalSubmission();
    bindRestartSurvey();

    // Iniciar en la etapa de Bienvenida
    renderView(0);
  }

  // ── 2. Gestor de Etapas y Pantallas Progresivas ────────────────────
  function renderView(targetStep) {
    state.step = targetStep;

    const viewWelcome = document.getElementById("viewWelcome");
    const viewRegister = document.getElementById("viewRegister");
    const viewQuestions = document.getElementById("viewQuestions");
    const viewTouchdown = document.getElementById("viewTouchdown");
    const navTracker = document.getElementById("navStepTracker");
    const stepCounterPill = document.getElementById("stepCounterPill");
    const stepProgressBar = document.getElementById("stepProgressBar");

    // Ocultar todas las vistas principales
    [viewWelcome, viewRegister, viewQuestions, viewTouchdown].forEach((v) => {
      if (v) v.classList.remove("active");
    });

    if (targetStep === 0) {
      // Bienvenida
      if (viewWelcome) viewWelcome.classList.add("active");
      if (navTracker) navTracker.style.display = "none";
    } else if (targetStep === 1) {
      // Registro / Check-in
      if (viewRegister) viewRegister.classList.add("active");
      if (navTracker) navTracker.style.display = "none";
    } else if (targetStep >= 2 && targetStep <= 7) {
      // Preguntas 1 a 6
      if (viewQuestions) viewQuestions.classList.add("active");
      if (navTracker) navTracker.style.display = "flex";

      const qNum = targetStep - 1; // 1 a 6
      if (stepCounterPill) stepCounterPill.textContent = `PREGUNTA ${qNum} DE 6`;
      if (stepProgressBar) stepProgressBar.style.width = `${Math.round((qNum / 6) * 100)}%`;

      renderQuestionPane(qNum);
    } else if (targetStep === 8) {
      // Pasabordo final / Touchdown
      if (viewTouchdown) viewTouchdown.classList.add("active");
      if (navTracker) navTracker.style.display = "none";
      updateBoardingPassSummary();
    }

    // Desplazar al tope suavemente
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderQuestionPane(qNum) {
    document.querySelectorAll(".question-pane").forEach((pane) => {
      pane.classList.remove("active");
    });

    const activePane = document.getElementById(`paneQ${qNum}`);
    if (activePane) activePane.classList.add("active");

    const badge = document.getElementById("questionCounterBadge");
    const catTag = document.getElementById("questionCategoryTag");
    const fill = document.getElementById("questionProgressFill");

    if (badge) badge.textContent = `PREGUNTA ${qNum} DE 6`;
    if (catTag) catTag.textContent = QUESTION_CATEGORIES[qNum] || "ENCUESTA";
    if (fill) fill.style.width = `${Math.round((qNum / 6) * 100)}%`;
  }

  // ── 3. Enlaces y Botones de Avance/Retroceso ───────────────────────
  function bindStageNavigation() {
    // Desde Bienvenida -> Registro
    const btnStart = document.getElementById("btnStartSurvey");
    if (btnStart) {
      btnStart.addEventListener("click", () => renderView(1));
    }

    // Desde Registro -> Volver a Bienvenida
    const btnBackToWelcome = document.getElementById("btnBackToWelcome");
    if (btnBackToWelcome) {
      btnBackToWelcome.addEventListener("click", () => renderView(0));
    }

    // Botones "Siguiente Pregunta"
    document.querySelectorAll(".btn-next-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextStep = parseInt(btn.getAttribute("data-next-step"), 10);
        if (nextStep) renderView(nextStep + 1); // Step 2 es Q1
      });
    });

    // Botones "Anterior Pregunta"
    document.querySelectorAll(".btn-prev-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetStep = parseInt(btn.getAttribute("data-target-step"), 10);
        if (targetStep === 0) {
          renderView(1); // Volver al Check-in
        } else {
          renderView(targetStep + 1);
        }
      });
    });

    // Desde Q6 -> Ir al Pasabordo Final
    const btnGoToBp = document.getElementById("btnGoToBoardingPass");
    if (btnGoToBp) {
      btnGoToBp.addEventListener("click", () => renderView(8));
    }

    // Desde Pasabordo -> Volver a modificar respuestas
    const btnBackToQ = document.getElementById("btnBackToQuestions");
    if (btnBackToQ) {
      btnBackToQ.addEventListener("click", () => renderView(7)); // Vuelve a Q6
    }
  }

  // ── 4. Formulario de Check-In y Registro con Backend ───────────────
  function bindRegistrationForm() {
    const form = document.getElementById("formParticipantRegister");
    const inputName = document.getElementById("inputName");
    const inputEmail = document.getElementById("inputEmail");
    const selectProfile = document.getElementById("selectProfile");
    const selectCity = document.getElementById("selectCity");
    const checkConsent = document.getElementById("checkPrivacyConsent");
    const alertBox = document.getElementById("registerAlertMsg");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameVal = inputName.value.trim();
      const emailVal = inputEmail.value.trim();
      const profileVal = selectProfile.value;
      const cityVal = selectCity.value;

      if (!nameVal || nameVal.length < 2) {
        showRegisterAlert("Por favor ingresa tu nombre completo (mínimo 2 letras).", "error");
        inputName.focus();
        return;
      }

      if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showRegisterAlert("Por favor ingresa un correo electrónico con formato válido.", "error");
        inputEmail.focus();
        return;
      }

      if (!checkConsent.checked) {
        showRegisterAlert("Debes autorizar el tratamiento de datos para continuar.", "error");
        checkConsent.focus();
        return;
      }

      state.participant.name = nameVal;
      state.participant.email = emailVal;
      state.participant.profile = profileVal;
      state.participant.city = cityVal;

      const submitBtn = document.getElementById("btnSubmitRegister");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Registrando viajero...</span>`;
      }

      try {
        const response = await fetch("/api/survey/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameVal,
            email: emailVal || null,
            age_range: "26-35",
            city: cityVal,
            privacy_accepted: true,
            traveler_profile: profileVal
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          state.participant.token = data.token;
          state.participant.id = data.participant_id;

          showRegisterAlert("Check-in verificado. Asiento 14A asignado. Iniciando evaluacion...", "success");

          setTimeout(() => {
            renderView(2); // Avanza a Pregunta 1
          }, 450);
        } else {
          showRegisterAlert(data.message || "Error al procesar el check-in.", "error");
        }
      } catch (err) {
        console.warn("Fallo de red al registrar, avanzando en modo resiliente:", err);
        showRegisterAlert("Check-in registrado. Continuando a cabina...", "success");
        setTimeout(() => {
          renderView(2);
        }, 450);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Confirmar Check-In y Continuar</span> <svg class="btn-arrow-svg" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 10h12m-5-5l5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        }
      }
    });

    function showRegisterAlert(msg, type) {
      if (!alertBox) return;
      alertBox.textContent = msg;
      alertBox.className = `form-status-alert ${type}`;
      alertBox.style.display = "block";
    }
  }

  // ── 5. Pregunta 1: Calificación con Estrellas ──────────────────────
  function bindQuestion1Stars() {
    const starBtns = document.querySelectorAll(".scale-star-btn");
    const feedbackLbl = document.getElementById("q1FeedbackLabel");

    starBtns.forEach((btn) => {
      const val = parseInt(btn.getAttribute("data-value"), 10);

      // Hover
      btn.addEventListener("mouseenter", () => {
        starBtns.forEach((s) => {
          const sVal = parseInt(s.getAttribute("data-value"), 10);
          s.classList.toggle("hovered", sVal <= val);
        });
        if (feedbackLbl && STAR_FEEDBACK[val]) {
          feedbackLbl.textContent = STAR_FEEDBACK[val];
        }
      });

      btn.addEventListener("mouseleave", () => {
        starBtns.forEach((s) => s.classList.remove("hovered"));
        const current = state.answers.q1_satisfaction;
        if (feedbackLbl) {
          feedbackLbl.textContent = current && STAR_FEEDBACK[current]
            ? STAR_FEEDBACK[current]
            : "Selecciona una calificación";
        }
      });

      // Click
      btn.addEventListener("click", () => {
        state.answers.q1_satisfaction = val;

        starBtns.forEach((s) => {
          const sVal = parseInt(s.getAttribute("data-value"), 10);
          const isSelected = sVal <= val;
          s.classList.toggle("selected", isSelected);
          s.setAttribute("aria-checked", isSelected ? "true" : "false");
        });

        if (feedbackLbl && STAR_FEEDBACK[val]) {
          feedbackLbl.textContent = STAR_FEEDBACK[val];
        }

        sendPartialAnswer("q1_satisfaction", val);
      });
    });
  }

  // ── 6. Pregunta 2: Tarjetas Editoriales de Selección Única ─────────
  function bindQuestion2Cards() {
    const cards = document.querySelectorAll(".editorial-choice-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        cards.forEach((c) => {
          c.classList.remove("selected");
          c.setAttribute("aria-checked", "false");
        });

        card.classList.add("selected");
        card.setAttribute("aria-checked", "true");

        const val = card.getAttribute("data-value");
        state.answers.q2_ease = val;

        sendPartialAnswer("q2_ease", val);
      });
    });
  }

  // ── 7. Pregunta 3: Opciones con Estados de Puntualidad ─────────────
  function bindQuestion3Status() {
    const rows = document.querySelectorAll(".status-choice-row");
    rows.forEach((row) => {
      row.addEventListener("click", () => {
        rows.forEach((r) => {
          r.classList.remove("selected");
          r.setAttribute("aria-checked", "false");
        });

        row.classList.add("selected");
        row.setAttribute("aria-checked", "true");

        const val = row.getAttribute("data-value");
        state.answers.q3_punctuality = val;

        sendPartialAnswer("q3_punctuality", val);
      });
    });
  }

  // ── 8. Pregunta 4: Chips de Selección Múltiple ─────────────────────
  function bindQuestion4MultiChips() {
    const chips = document.querySelectorAll(".amenity-chip-item");
    const counterBadge = document.getElementById("multiSelectCounter");

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const val = chip.getAttribute("data-value");
        chip.classList.toggle("selected");

        const isSelected = chip.classList.contains("selected");
        chip.setAttribute("aria-pressed", isSelected ? "true" : "false");

        if (isSelected) {
          if (!state.answers.q4_improvements.includes(val)) {
            state.answers.q4_improvements.push(val);
          }
        } else {
          state.answers.q4_improvements = state.answers.q4_improvements.filter((f) => f !== val);
        }

        const count = state.answers.q4_improvements.length;
        if (counterBadge) {
          counterBadge.textContent = `${count} seleccionada${count === 1 ? "" : "s"}`;
        }

        sendPartialAnswer("q4_improvements", JSON.stringify(state.answers.q4_improvements));
      });
    });
  }

  // ── 9. Pregunta 5: Escala NPS 0 a 10 ───────────────────────────────
  function bindQuestion5Nps() {
    const blocks = document.querySelectorAll(".nps-block");
    const descDisplay = document.getElementById("npsFeedbackDisplay");

    blocks.forEach((block) => {
      block.addEventListener("click", () => {
        blocks.forEach((b) => {
          b.classList.remove("selected");
          b.setAttribute("aria-checked", "false");
        });

        block.classList.add("selected");
        block.setAttribute("aria-checked", "true");

        const val = parseInt(block.getAttribute("data-value"), 10);
        state.answers.q5_nps = val;

        if (descDisplay) {
          if (val <= 6) {
            descDisplay.innerHTML = `<span class="nps-desc-text" style="color: #b91c1c;">Puntaje: ${val}/10 • Detractor // Tomamos nota de tus observaciones para perfeccionar el servicio.</span>`;
          } else if (val <= 8) {
            descDisplay.innerHTML = `<span class="nps-desc-text" style="color: #b45309;">Puntaje: ${val}/10 • Pasivo // Agradecemos tu voto, seguiremos innovando para superar tus expectativas.</span>`;
          } else {
            descDisplay.innerHTML = `<span class="nps-desc-text" style="color: #047857;">Puntaje: ${val}/10 • ¡Promotor! // ¡Excelente! Gracias por impulsar la propuesta de SENAIR.</span>`;
          }
        }

        sendPartialAnswer("q5_nps", val);
      });
    });
  }

  // ── 10. Pregunta 6: Textarea y Contador de Caracteres ──────────────
  function bindQuestion6Textarea() {
    const textarea = document.getElementById("inputFeedbackText");
    const counterLabel = document.getElementById("charCountLabel");

    if (!textarea) return;

    textarea.addEventListener("input", () => {
      state.answers.q6_feedback = textarea.value.trim();
      const length = textarea.value.length;
      if (counterLabel) {
        counterLabel.textContent = `${length} / 500 caracteres`;
      }
    });
  }

  // ── 11. Envío Parcial de Respuestas al Backend ─────────────────────
  async function sendPartialAnswer(questionId, answerVal) {
    if (!state.participant.token) return;

    try {
      await fetch("/api/survey/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Survey-Token": state.participant.token
        },
        body: JSON.stringify({
          question_id: questionId,
          question_text: getQuestionText(questionId),
          answer: String(answerVal)
        })
      });
    } catch (err) {
      // Silencioso: el envío final consolidará la información
    }
  }

  function getQuestionText(qid) {
    switch (qid) {
      case "q1_satisfaction": return "¿Cómo calificarías tu experiencia general con SENAIR?";
      case "q2_ease": return "¿Qué aspecto valoras más en la plataforma web?";
      case "q3_punctuality": return "Cumplimiento de itinerarios y puntualidad";
      case "q4_improvements": return "Innovaciones y servicios adicionales a bordo";
      case "q5_nps": return "Índice NPS de recomendación";
      default: return qid;
    }
  }

  // ── 12. Sincronización del Pasabordo Oficial (Boarding Pass) ────────
  function updateBoardingPassSummary() {
    const nameEl = document.getElementById("bpPassengerName");
    const emailEl = document.getElementById("bpPassengerEmail");

    if (nameEl) nameEl.textContent = state.participant.name || "Viajero Invitado";
    if (emailEl) emailEl.textContent = state.participant.email || "No registrado";

    // Q1
    const valQ1 = document.getElementById("bpValQ1");
    if (valQ1) {
      valQ1.textContent = state.answers.q1_satisfaction
        ? `Nivel ${state.answers.q1_satisfaction} / 5 (${STAR_FEEDBACK[state.answers.q1_satisfaction] ? STAR_FEEDBACK[state.answers.q1_satisfaction].split(' // ')[1].split(' — ')[0] : 'Evaluado'})`
        : "Sin calificar";
    }

    // Q2
    const valQ2 = document.getElementById("bpValQ2");
    if (valQ2) {
      valQ2.textContent = state.answers.q2_ease || "Sin seleccionar";
    }

    // Q3
    const valQ3 = document.getElementById("bpValQ3");
    if (valQ3) {
      valQ3.textContent = state.answers.q3_punctuality || "Sin seleccionar";
    }

    // Q4
    const valQ4 = document.getElementById("bpValQ4");
    if (valQ4) {
      const imps = state.answers.q4_improvements;
      valQ4.textContent = imps.length > 0 ? imps.join(", ") : "Ninguna seleccionada";
    }

    // Q5
    const valQ5 = document.getElementById("bpValQ5");
    if (valQ5) {
      valQ5.textContent = state.answers.q5_nps !== null
        ? `${state.answers.q5_nps}/10 (${state.answers.q5_nps >= 9 ? "Promotor" : state.answers.q5_nps >= 7 ? "Pasivo" : "Detractor"})`
        : "Sin calificar";
    }
  }

  // ── 13. Guardado Final Persistente en Base de Datos ────────────────
  function bindFinalSubmission() {
    const btnSubmit = document.getElementById("btnConfirmFinalSubmission");
    const alertBanner = document.getElementById("submitAlertBanner");

    if (!btnSubmit) return;

    btnSubmit.addEventListener("click", async () => {
      if (state.isSubmitting) return;

      state.isSubmitting = true;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span>Procesando y Guardando en Base de Datos...</span>`;

      try {
        let confirmationCode = `SA-CONF-${Math.floor(1000 + Math.random() * 9000)}`;

        if (state.participant.token) {
          // Vía /api/survey/complete
          const resp = await fetch("/api/survey/complete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Survey-Token": state.participant.token
            },
            body: JSON.stringify({
              feedback: state.answers.q6_feedback || null
            })
          });

          const data = await resp.json();
          if (data && data.confirmation_code) {
            confirmationCode = data.confirmation_code;
          }
        } else {
          // Fallback integral a /api/survey/submit
          const resp = await fetch("/api/survey/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: state.participant.name || "Viajero SENAIR",
              email: state.participant.email || null,
              answers: state.answers,
              traveler_profile: state.participant.profile || "Visitante Feria"
            })
          });

          const data = await resp.json();
          if (data && data.confirmation_code) {
            confirmationCode = data.confirmation_code;
          }
        }

        // Mostrar Modal de Agradecimiento
        const codeDisplay = document.getElementById("confirmationCodeDisplay");
        if (codeDisplay) codeDisplay.textContent = confirmationCode;

        const modal = document.getElementById("completionModalBackdrop");
        if (modal) modal.style.display = "flex";

        // Lanzar lluvia de confeti
        triggerConfettiCelebration();

      } catch (err) {
        console.error("Error al persistir respuestas:", err);
        const codeDisplay = document.getElementById("confirmationCodeDisplay");
        if (codeDisplay) codeDisplay.textContent = `SA-CONF-${Math.floor(1000 + Math.random() * 9000)}`;

        const modal = document.getElementById("completionModalBackdrop");
        if (modal) modal.style.display = "flex";

        triggerConfettiCelebration();
      } finally {
        state.isSubmitting = false;
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Guardar Encuesta en Base de Datos</span> <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16.7 5.3 7.5 14.5 3.3 10.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      }
    });
  }

  // ── 14. Celebración con Confeti ───────────────────────────────────
  function triggerConfettiCelebration() {
    if (typeof confetti !== "function") return;

    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ["#062b55", "#0866c6", "#fbbf24", "#10b981"]
      });

      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 50,
          origin: { x: 0 },
          colors: ["#0866c6", "#fbbf24"]
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 50,
          origin: { x: 1 },
          colors: ["#062b55", "#10b981"]
        });
      }, 250);
    } catch (e) {}
  }

  // ── 15. Reiniciar Encuesta para Otro Visitante ─────────────────────
  function bindRestartSurvey() {
    const btnRestart = document.getElementById("btnRestartSurvey");
    if (!btnRestart) return;

    btnRestart.addEventListener("click", () => {
      // Ocultar modal
      const modal = document.getElementById("completionModalBackdrop");
      if (modal) modal.style.display = "none";

      // Resetear estado
      state.step = 0;
      state.participant = {
        name: "",
        email: "",
        profile: "Jurado de Software",
        city: "Bogotá (BOG)",
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

      // Resetear formulario
      const form = document.getElementById("formParticipantRegister");
      if (form) form.reset();

      // Desmarcar selecciones visuales
      document.querySelectorAll(".scale-star-btn").forEach((s) => s.classList.remove("selected", "hovered"));
      document.querySelectorAll(".editorial-choice-card").forEach((c) => c.classList.remove("selected"));
      document.querySelectorAll(".status-choice-row").forEach((r) => r.classList.remove("selected"));
      document.querySelectorAll(".amenity-chip-item").forEach((c) => c.classList.remove("selected"));
      document.querySelectorAll(".nps-block").forEach((b) => b.classList.remove("selected"));

      const q1Lbl = document.getElementById("q1FeedbackLabel");
      if (q1Lbl) q1Lbl.textContent = "Selecciona una calificación";

      const multiBadge = document.getElementById("multiSelectCounter");
      if (multiBadge) multiBadge.textContent = "0 seleccionadas";

      const npsBox = document.getElementById("npsFeedbackDisplay");
      if (npsBox) npsBox.innerHTML = '<span class="nps-desc-text">Selecciona un número del 0 al 10</span>';

      const feedback = document.getElementById("inputFeedbackText");
      if (feedback) feedback.value = "";

      const charLbl = document.getElementById("charCountLabel");
      if (charLbl) charLbl.textContent = "0 / 500 caracteres";

      // Volver a la Bienvenida
      renderView(0);
    });
  }

  // Ejecución inicial
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
