/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Controlador Interactivo de Encuesta
 * Validación, Resumen HUD Boarding Pass en Tiempo Real y Envío al Backend
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  // Estado reactivo central de la encuesta
  const surveyState = {
    answers: {
      q1_satisfaction: null,
      q2_ease: null,
      q3_punctuality: null,
      q4_improvements: [],
      q5_nps: null,
      q6_feedback: ""
    },
    email: "",
    isSubmitting: false,
    completed: false
  };

  // Etiquetas verbales para calificaciones
  const STAR_LABELS = {
    q1: {
      1: "1 ★ — Muy Deficiente",
      2: "2 ★ — Regular",
      3: "3 ★ — Aceptable",
      4: "4 ★ — Muy Buena",
      5: "5 ★ — ¡Excelente Servicio!"
    },
    q2: {
      1: "1 ★ — Muy Compleja",
      2: "2 ★ — Difícil de Usar",
      3: "3 ★ — Aceptable",
      4: "4 ★ — Rápida e Intuitiva",
      5: "5 ★ — ¡Impecable y Fluida!"
    }
  };

  function init() {
    bindStarRatings();
    bindPunctualityCards();
    bindMultiSelectPills();
    bindNpsTiles();
    bindTextInputHandlers();
    bindSubmission();
    bindRestartButton();
    updateBoardingPassHUD();
  }

  // ── 1. Preguntas 1 y 2: Calificación con Estrellas ────────────────
  function bindStarRatings() {
    setupStarRow("starsRowQ1", "starBadgeQ1", "q1_satisfaction", "q1", "#stage-q2");
    setupStarRow("starsRowQ2", "starBadgeQ2", "q2_ease", "q2", "#stage-q3");
  }

  function setupStarRow(rowId, badgeId, stateKey, labelKey, nextTargetSelector) {
    const row = document.getElementById(rowId);
    const badge = document.getElementById(badgeId);
    if (!row) return;

    const stars = row.querySelectorAll(".star-touch-btn");

    stars.forEach((btn) => {
      const starVal = parseInt(btn.getAttribute("data-star"), 10);

      // Hover visual
      btn.addEventListener("mouseenter", () => {
        highlightStars(stars, starVal);
        if (badge) badge.textContent = STAR_LABELS[labelKey][starVal];
      });

      // Salir del hover restaura la selección guardada
      btn.addEventListener("mouseleave", () => {
        const currentVal = surveyState.answers[stateKey];
        highlightStars(stars, currentVal || 0);
        if (badge) {
          badge.textContent = currentVal
            ? STAR_LABELS[labelKey][currentVal]
            : "Toca una estrella para calificar";
        }
      });

      // Selección con click
      btn.addEventListener("click", () => {
        surveyState.answers[stateKey] = starVal;
        highlightStars(stars, starVal);
        if (badge) {
          badge.textContent = STAR_LABELS[labelKey][starVal];
          badge.classList.add("active");
        }
        updateBoardingPassHUD();

        // Avance suave a la siguiente pregunta tras breve feedback
        if (nextTargetSelector && window.FlightScroller) {
          setTimeout(() => {
            window.FlightScroller.scrollToElement(nextTargetSelector);
          }, 380);
        }
      });
    });
  }

  function highlightStars(starsList, activeCount) {
    starsList.forEach((star) => {
      const val = parseInt(star.getAttribute("data-star"), 10);
      if (val <= activeCount) {
        star.classList.add("active");
      } else {
        star.classList.remove("active");
      }
    });
  }

  // ── 2. Pregunta 3: Opción Única de Puntualidad ────────────────────
  function bindPunctualityCards() {
    const cards = document.querySelectorAll('.hud-choice-card[data-qid="q3_punctuality"]');

    cards.forEach((card) => {
      const selectAction = () => {
        const val = card.getAttribute("data-val");
        cards.forEach((c) => {
          c.classList.remove("selected");
          c.setAttribute("aria-checked", "false");
        });
        card.classList.add("selected");
        card.setAttribute("aria-checked", "true");
        surveyState.answers.q3_punctuality = val;
        updateBoardingPassHUD();

        // Avance automático a la siguiente sección (Escena 8 / Transición)
        if (window.FlightScroller) {
          setTimeout(() => {
            window.FlightScroller.scrollToElement("#scene-8");
          }, 380);
        }
      };

      card.addEventListener("click", selectAction);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectAction();
        }
      });
    });
  }

  // ── 3. Pregunta 4: Selección Múltiple de Mejoras ──────────────────
  function bindMultiSelectPills() {
    const pills = document.querySelectorAll('.multi-pill-card[data-qid="q4_improvements"]');

    pills.forEach((pill) => {
      const toggleAction = () => {
        const val = pill.getAttribute("data-val");
        pill.classList.toggle("selected");
        const isSelected = pill.classList.contains("selected");
        pill.setAttribute("aria-checked", isSelected ? "true" : "false");

        const list = surveyState.answers.q4_improvements;
        const index = list.indexOf(val);
        if (isSelected && index === -1) {
          list.push(val);
        } else if (!isSelected && index !== -1) {
          list.splice(index, 1);
        }
        updateBoardingPassHUD();
      };

      pill.addEventListener("click", toggleAction);
      pill.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleAction();
        }
      });
    });
  }

  // ── 4. Pregunta 5: Escala NPS 0 a 10 ─────────────────────────────
  function bindNpsTiles() {
    const tiles = document.querySelectorAll(".nps-tile");

    tiles.forEach((tile) => {
      tile.addEventListener("click", () => {
        const val = parseInt(tile.getAttribute("data-nps"), 10);
        tiles.forEach((t) => t.classList.remove("selected"));
        tile.classList.add("selected");
        surveyState.answers.q5_nps = val;
        updateBoardingPassHUD();

        // Avance suave hacia la escena 10 (Resumen Boarding Pass)
        if (window.FlightScroller) {
          setTimeout(() => {
            window.FlightScroller.scrollToElement("#scene-10");
          }, 380);
        }
      });
    });
  }

  // ── 5. Pregunta 6 & Correo Opcional ──────────────────────────────
  function bindTextInputHandlers() {
    const feedbackText = document.getElementById("feedbackTextarea");
    const emailInput = document.getElementById("contactEmailInput");

    feedbackText?.addEventListener("input", (e) => {
      surveyState.answers.q6_feedback = e.target.value.trim();
    });

    emailInput?.addEventListener("input", (e) => {
      surveyState.email = e.target.value.trim();
    });
  }

  // ── 6. Actualización en Tiempo Real del HUD Boarding Pass ────────
  function updateBoardingPassHUD() {
    const q1ValEl = document.getElementById("summaryValQ1");
    const q2ValEl = document.getElementById("summaryValQ2");
    const q3ValEl = document.getElementById("summaryValQ3");
    const q4ValEl = document.getElementById("summaryValQ4");
    const q5ValEl = document.getElementById("summaryValQ5");

    // Q1
    if (q1ValEl) {
      const q1 = surveyState.answers.q1_satisfaction;
      q1ValEl.textContent = q1 ? `${q1} ★ (${STAR_LABELS.q1[q1].split("—")[1].trim()})` : "Pendiente";
      q1ValEl.classList.toggle("is-filled", Boolean(q1));
    }

    // Q2
    if (q2ValEl) {
      const q2 = surveyState.answers.q2_ease;
      q2ValEl.textContent = q2 ? `${q2} ★ (${STAR_LABELS.q2[q2].split("—")[1].trim()})` : "Pendiente";
      q2ValEl.classList.toggle("is-filled", Boolean(q2));
    }

    // Q3
    if (q3ValEl) {
      const q3 = surveyState.answers.q3_punctuality;
      q3ValEl.textContent = q3 ? `Vuelo ${q3}` : "Pendiente";
      q3ValEl.classList.toggle("is-filled", Boolean(q3));
    }

    // Q4
    if (q4ValEl) {
      const q4 = surveyState.answers.q4_improvements;
      if (q4 && q4.length > 0) {
        q4ValEl.textContent = q4.join(" • ");
        q4ValEl.classList.add("is-filled");
      } else {
        q4ValEl.textContent = "Ningún aspecto marcado (Servicio óptimo)";
        q4ValEl.classList.remove("is-filled");
      }
    }

    // Q5
    if (q5ValEl) {
      const q5 = surveyState.answers.q5_nps;
      if (q5 !== null && q5 !== undefined) {
        let cat = "Pasivo";
        if (q5 >= 9) cat = "Promotor ¡Excelente!";
        else if (q5 <= 6) cat = "Detractor";
        q5ValEl.textContent = `${q5} / 10 — ${cat}`;
        q5ValEl.classList.add("is-filled");
      } else {
        q5ValEl.textContent = "Pendiente";
        q5ValEl.classList.remove("is-filled");
      }
    }
  }

  // ── 7. Validación y Envío de la Encuesta ──────────────────────────
  function bindSubmission() {
    const submitBtn = document.getElementById("submitSurveyBtn");
    const errorBanner = document.getElementById("errorBanner");

    if (!submitBtn) return;

    submitBtn.addEventListener("click", async () => {
      if (surveyState.isSubmitting) return;

      // Validación de campos obligatorios
      const missing = [];
      let firstMissingStage = null;

      if (!surveyState.answers.q1_satisfaction) {
        missing.push("Pregunta 1 (Satisfacción general)");
        if (!firstMissingStage) firstMissingStage = "#stage-q1";
      }
      if (!surveyState.answers.q2_ease) {
        missing.push("Pregunta 2 (Facilidad digital)");
        if (!firstMissingStage) firstMissingStage = "#stage-q2";
      }
      if (!surveyState.answers.q3_punctuality) {
        missing.push("Pregunta 3 (Puntualidad de vuelo)");
        if (!firstMissingStage) firstMissingStage = "#stage-q3";
      }
      if (surveyState.answers.q5_nps === null || surveyState.answers.q5_nps === undefined) {
        missing.push("Pregunta 5 (Índice de recomendación NPS)");
        if (!firstMissingStage) firstMissingStage = "#stage-q5";
      }

      if (missing.length > 0) {
        if (errorBanner) {
          errorBanner.innerHTML = `<strong>⚠️ Faltan respuestas requeridas:</strong> Por favor responde: ${missing.join(", ")}.`;
          errorBanner.style.display = "block";
        }

        // Desplazamiento automático inteligente hacia la primera pregunta pendiente
        if (firstMissingStage && window.FlightScroller) {
          window.FlightScroller.scrollToElement(firstMissingStage);
        }
        return;
      }

      if (errorBanner) {
        errorBanner.style.display = "none";
      }

      // Preparar payload de envío
      const payload = {
        fullName: "Visitante de Feria de Software",
        email: surveyState.email || "anonimo@feria.senair.com",
        phone: "",
        answers: surveyState.answers
      };

      surveyState.isSubmitting = true;
      submitBtn.classList.add("is-loading");
      const btnText = submitBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = "Transmitiendo datos a la torre de control...";

      try {
        const endpoint = (typeof SURVEY_DATA !== "undefined" && SURVEY_DATA.ENDPOINT)
          ? SURVEY_DATA.ENDPOINT
          : "/api/survey/submit";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
          handleSuccess();
        } else {
          throw new Error(resData.message || "Error al registrar encuesta en el servidor");
        }
      } catch (err) {
        console.warn("[SENAIR] Error en conexión remota. Activando respaldo local offline:", err);
        saveOfflineBackup(payload);
        handleSuccess();
      } finally {
        surveyState.isSubmitting = false;
        submitBtn.classList.remove("is-loading");
        if (btnText) btnText.textContent = "Transmitir y Enviar Encuesta";
      }
    });
  }

  function handleSuccess() {
    surveyState.completed = true;

    // Disparar confeti sutil de celebración
    if (typeof confetti === "function") {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#0866c6", "#042c54", "#ffffff", "#ffd700"]
        });
      } catch (e) {
        console.log("Confetti final:", e);
      }
    }

    // Navegar suavemente al final (Escena 11)
    if (window.FlightScroller) {
      window.FlightScroller.scrollToScene("scene-11");
    } else {
      document.getElementById("scene-11")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function saveOfflineBackup(payload) {
    try {
      const stored = JSON.parse(localStorage.getItem("senair_offline_surveys") || "[]");
      stored.push({
        ...payload,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem("senair_offline_surveys", JSON.stringify(stored));
      console.info("[SENAIR] Encuesta guardada localmente en navegador con éxito.");
    } catch (e) {
      console.error("[SENAIR] No se pudo guardar respaldo offline:", e);
    }
  }

  // ── 8. Botón Reiniciar para otro visitante de la feria ───────────
  function bindRestartButton() {
    const restartBtn = document.getElementById("btnRestartExperience");
    if (!restartBtn) return;

    restartBtn.addEventListener("click", () => {
      // Reiniciar estado
      surveyState.answers = {
        q1_satisfaction: null,
        q2_ease: null,
        q3_punctuality: null,
        q4_improvements: [],
        q5_nps: null,
        q6_feedback: ""
      };
      surveyState.email = "";
      surveyState.completed = false;

      // Limpiar clases y controles en el DOM
      document.querySelectorAll(".star-touch-btn").forEach((s) => s.classList.remove("active"));
      document.querySelectorAll(".star-verbal-badge").forEach((b) => {
        b.textContent = "Toca una estrella para calificar";
        b.classList.remove("active");
      });
      document.querySelectorAll(".hud-choice-card").forEach((c) => c.classList.remove("selected"));
      document.querySelectorAll(".multi-pill-card").forEach((p) => p.classList.remove("selected"));
      document.querySelectorAll(".nps-tile").forEach((t) => t.classList.remove("selected"));

      const feedback = document.getElementById("feedbackTextarea");
      const email = document.getElementById("contactEmailInput");
      const errorBanner = document.getElementById("errorBanner");
      if (feedback) feedback.value = "";
      if (email) email.value = "";
      if (errorBanner) errorBanner.style.display = "none";

      updateBoardingPassHUD();

      // Desplazarse suavemente de vuelta a la portada
      if (window.FlightScroller) {
        window.FlightScroller.scrollToScene("scene-1");
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Inicializar al cargar el script
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
