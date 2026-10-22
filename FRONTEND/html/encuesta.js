/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Controlador de Cabina 3D & Sistema de Waypoints de Vuelo
 * Transiciones 3D a 60 FPS • Soporte Gestual Táctil • Envío Persistente
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  // Estado reactivo central de la encuesta
  const surveyState = {
    currentStep: 0,
    maxStep: 7,
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

  const STAR_LABELS = {
    q1: {
      1: "1 ★ // Muy Deficiente",
      2: "2 ★ // Servicio Regular",
      3: "3 ★ // Conforme / Aceptable",
      4: "4 ★ // Muy Buen Servicio",
      5: "5 ★ // ¡Servicio Excepcional!"
    },
    q2: {
      1: "1 ★ // Plataforma Compleja",
      2: "2 ★ // Proceso Difícil",
      3: "3 ★ // Aceptable",
      4: "4 ★ // Rápida e Intuitiva",
      5: "5 ★ // ¡Impecable y Fluida!"
    }
  };

  // ── 1. Controlador del Deck 3D y Navegación de Waypoints ──────────
  const FlightDeck = {
    cards: [],
    dots: [],
    hudPhaseName: null,
    hudAltitudeVal: null,
    hudProgressVal: null,
    hudProgressLine: null,

    init() {
      this.cards = Array.from(document.querySelectorAll(".waypoint-card"));
      this.dots = Array.from(document.querySelectorAll(".waypoint-dot"));
      this.hudPhaseName = document.getElementById("hudPhaseName");
      this.hudAltitudeVal = document.getElementById("hudAltitudeVal");
      this.hudProgressVal = document.getElementById("hudProgressVal");
      this.hudProgressLine = document.getElementById("hudProgressLine");

      this.bindWaypointNav();
      this.bindButtons();
      this.bindTouchGestures();
      this.bindParallaxGyro();
      this.updateHUD(0);
    },

    goToStep(targetStep) {
      if (targetStep < 0 || targetStep >= this.cards.length) return;

      const prevStep = surveyState.currentStep;
      surveyState.currentStep = targetStep;

      // Actualizar clases de tarjetas 3D
      this.cards.forEach((card, idx) => {
        card.classList.remove("active", "past");
        if (idx === targetStep) {
          card.classList.add("active");
        } else if (idx < targetStep) {
          card.classList.add("past");
        }
      });

      // Actualizar dots en el HUD
      this.dots.forEach((dot, idx) => {
        dot.classList.remove("active");
        if (idx === targetStep) {
          dot.classList.add("active");
        }
        if (idx < targetStep) {
          dot.classList.add("completed");
        } else {
          dot.classList.remove("completed");
        }
      });

      this.updateHUD(targetStep);

      // Desplazamiento al tope si la pantalla tiene scroll
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    next() {
      if (surveyState.currentStep < this.cards.length - 1) {
        this.goToStep(surveyState.currentStep + 1);
      }
    },

    prev() {
      if (surveyState.currentStep > 0) {
        this.goToStep(surveyState.currentStep - 1);
      }
    },

    updateHUD(step) {
      const activeCard = this.cards[step];
      if (!activeCard) return;

      const phase = activeCard.getAttribute("data-phase") || `WAYPOINT 0${step}`;
      const altitude = activeCard.getAttribute("data-altitude") || "FL 240";
      const pct = Math.round((step / (this.cards.length - 1)) * 100);

      if (this.hudPhaseName) this.hudPhaseName.textContent = phase;
      if (this.hudAltitudeVal) this.hudAltitudeVal.textContent = altitude;
      if (this.hudProgressVal) this.hudProgressVal.textContent = `${pct}%`;
      if (this.hudProgressLine) this.hudProgressLine.style.width = `${pct}%`;

      updateBoardingPass();
    },

    bindWaypointNav() {
      this.dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const step = parseInt(dot.getAttribute("data-step"), 10);
          this.goToStep(step);
        });
      });
    },

    bindButtons() {
      // Botón de despegue inicial
      document.getElementById("btnStartFlight")?.addEventListener("click", () => {
        this.goToStep(1);
      });

      // Botones generales "next" y "prev"
      document.querySelectorAll("[data-action='next']").forEach((btn) => {
        btn.addEventListener("click", () => this.next());
      });

      document.querySelectorAll("[data-action='prev']").forEach((btn) => {
        btn.addEventListener("click", () => this.prev());
      });
    },

    // ── Gestos táctiles Swipe en móviles ──
    bindTouchGestures() {
      let touchStartX = 0;
      let touchStartY = 0;
      const stage = document.getElementById("cockpitStageWrapper");
      if (!stage) return;

      stage.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      stage.addEventListener("touchend", (e) => {
        if (e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;

          // Si el movimiento horizontal es predominante y mayor a 60px
          if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
            if (deltaX < 0) {
              // Deslizar izquierda -> siguiente
              this.next();
            } else {
              // Deslizar derecha -> anterior
              this.prev();
            }
          }
        }
      }, { passive: true });
    },

    // ── Efecto Giroscópico 3D con el cursor (Desktop) ──
    bindParallaxGyro() {
      if (window.innerWidth < 992) return;
      const deck = document.getElementById("flightDeck3D");
      if (!deck) return;

      window.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        deck.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
    }
  };

  // ── 2. Interacciones de Preguntas ─────────────────────────────────
  function bindQuestions() {
    // P1: Satisfacción
    setupStarRating("deckStarsQ1", "feedbackQ1", "q1_satisfaction", "q1", 2);

    // P2: Facilidad Web
    setupStarRating("deckStarsQ2", "feedbackQ2", "q2_ease", "q2", 3);

    // P3: Radar de Puntualidad
    setupPunctualityRadar();

    // P4: Upgrades de Cabina
    setupAmenitiesGrid();

    // P5: Tacómetro NPS
    setupNpsThrust();

    // Textarea y Correo
    setupTextInputs();

    // Envío y Reinicio
    setupSubmission();
    setupRestart();
  }

  function setupStarRating(deckId, feedbackId, stateKey, labelKey, nextStep) {
    const deck = document.getElementById(deckId);
    const feedback = document.getElementById(feedbackId);
    if (!deck) return;

    const btns = deck.querySelectorAll(".star-beacon-btn");

    btns.forEach((btn) => {
      const val = parseInt(btn.getAttribute("data-val"), 10);

      btn.addEventListener("mouseenter", () => {
        highlightStars(btns, val);
        if (feedback) feedback.textContent = STAR_LABELS[labelKey][val];
      });

      btn.addEventListener("mouseleave", () => {
        const current = surveyState.answers[stateKey];
        highlightStars(btns, current || 0);
        if (feedback) {
          feedback.textContent = current
            ? STAR_LABELS[labelKey][current]
            : "Toca una estrella para registrar tu calificación";
        }
      });

      btn.addEventListener("click", () => {
        surveyState.answers[stateKey] = val;
        highlightStars(btns, val);
        if (feedback) feedback.textContent = STAR_LABELS[labelKey][val];
        updateBoardingPass();

        // Auto-avance suave tras 380ms
        setTimeout(() => {
          FlightDeck.goToStep(nextStep);
        }, 380);
      });
    });
  }

  function highlightStars(btnsList, count) {
    btnsList.forEach((btn) => {
      const v = parseInt(btn.getAttribute("data-val"), 10);
      btn.classList.toggle("active", v <= count);
    });
  }

  function setupPunctualityRadar() {
    const cards = document.querySelectorAll(".radar-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const val = card.getAttribute("data-val");
        cards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        surveyState.answers.q3_punctuality = val;
        updateBoardingPass();

        setTimeout(() => {
          FlightDeck.goToStep(4);
        }, 380);
      });
    });
  }

  function setupAmenitiesGrid() {
    const chips = document.querySelectorAll(".amenity-chip-card");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const val = chip.getAttribute("data-val");
        chip.classList.toggle("selected");
        const isSelected = chip.classList.contains("selected");

        const list = surveyState.answers.q4_improvements;
        const idx = list.indexOf(val);
        if (isSelected && idx === -1) {
          list.push(val);
        } else if (!isSelected && idx !== -1) {
          list.splice(idx, 1);
        }
        updateBoardingPass();
      });
    });
  }

  function setupNpsThrust() {
    const btns = document.querySelectorAll(".thrust-btn");
    const machVal = document.getElementById("npsMachVal");
    const categoryTag = document.getElementById("npsCategoryTag");

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseInt(btn.getAttribute("data-nps"), 10);
        btns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        surveyState.answers.q5_nps = val;

        let machStr = (val / 10).toFixed(1);
        let catStr = "PASIVO";
        if (val >= 9) catStr = "¡PROMOTOR TOTAL!";
        else if (val <= 6) catStr = "DETRACTOR";

        if (machVal) machVal.textContent = `MACH ${machStr}`;
        if (categoryTag) categoryTag.textContent = catStr;

        updateBoardingPass();

        // Auto-avance hacia el Boarding Pass (Paso 6)
        setTimeout(() => {
          FlightDeck.goToStep(6);
        }, 400);
      });
    });
  }

  function setupTextInputs() {
    const feedback = document.getElementById("feedbackTextarea");
    const email = document.getElementById("contactEmailInput");

    feedback?.addEventListener("input", (e) => {
      surveyState.answers.q6_feedback = e.target.value.trim();
    });

    email?.addEventListener("input", (e) => {
      surveyState.email = e.target.value.trim();
    });
  }

  // ── 3. Actualización de Boarding Pass ─────────────────────────────
  function updateBoardingPass() {
    const q1El = document.getElementById("summaryValQ1");
    const q2El = document.getElementById("summaryValQ2");
    const q3El = document.getElementById("summaryValQ3");
    const q4El = document.getElementById("summaryValQ4");
    const q5El = document.getElementById("summaryValQ5");

    const { q1_satisfaction, q2_ease, q3_punctuality, q4_improvements, q5_nps } = surveyState.answers;

    if (q1El) {
      q1El.textContent = q1_satisfaction ? `${q1_satisfaction} ★ (${STAR_LABELS.q1[q1_satisfaction].split("//")[1].trim()})` : "Pendiente";
    }
    if (q2El) {
      q2El.textContent = q2_ease ? `${q2_ease} ★ (${STAR_LABELS.q2[q2_ease].split("//")[1].trim()})` : "Pendiente";
    }
    if (q3El) {
      q3El.textContent = q3_punctuality ? `Vuelo ${q3_punctuality}` : "Pendiente";
    }
    if (q4El) {
      q4El.textContent = q4_improvements.length > 0 ? q4_improvements.join(" • ") : "Ninguno marcado (Servicio óptimo)";
    }
    if (q5El) {
      if (q5_nps !== null && q5_nps !== undefined) {
        let cat = q5_nps >= 9 ? "Promotor" : (q5_nps <= 6 ? "Detractor" : "Pasivo");
        q5El.textContent = `${q5_nps} / 10 (${cat})`;
      } else {
        q5El.textContent = "Pendiente";
      }
    }
  }

  // ── 4. Validación y Envío de la Encuesta ──────────────────────────
  function setupSubmission() {
    const submitBtn = document.getElementById("btnTransmitFlight");
    const errorBanner = document.getElementById("errorBanner");
    if (!submitBtn) return;

    submitBtn.addEventListener("click", async () => {
      if (surveyState.isSubmitting) return;

      const missing = [];
      let jumpStep = null;

      if (!surveyState.answers.q1_satisfaction) {
        missing.push("Fase 01 (Satisfacción general)");
        if (jumpStep === null) jumpStep = 1;
      }
      if (!surveyState.answers.q2_ease) {
        missing.push("Fase 02 (Facilidad web)");
        if (jumpStep === null) jumpStep = 2;
      }
      if (!surveyState.answers.q3_punctuality) {
        missing.push("Fase 03 (Puntualidad de vuelo)");
        if (jumpStep === null) jumpStep = 3;
      }
      if (surveyState.answers.q5_nps === null || surveyState.answers.q5_nps === undefined) {
        missing.push("Fase 05 (Tacómetro NPS)");
        if (jumpStep === null) jumpStep = 5;
      }

      if (missing.length > 0) {
        if (errorBanner) {
          errorBanner.innerHTML = `<strong>⚠️ Telemetría Incompleta:</strong> Por favor responde: ${missing.join(", ")}.`;
          errorBanner.style.display = "block";
        }
        if (jumpStep !== null) {
          FlightDeck.goToStep(jumpStep);
        }
        return;
      }

      if (errorBanner) errorBanner.style.display = "none";

      const payload = {
        fullName: "Visitante de Feria de Software",
        email: surveyState.email || "visitante@feria.senair.com",
        phone: "",
        answers: surveyState.answers
      };

      surveyState.isSubmitting = true;
      submitBtn.classList.add("is-loading");
      const btnText = submitBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = "Transmitiendo datos a torre de control...";

      try {
        const endpoint = (typeof SURVEY_DATA !== "undefined" && SURVEY_DATA.ENDPOINT)
          ? SURVEY_DATA.ENDPOINT
          : "/api/survey/submit";

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok && data.success) {
          handleSuccess();
        } else {
          throw new Error(data.message || "Error al registrar");
        }
      } catch (err) {
        console.warn("[SENAIR] Error en red remota. Guardando respaldo offline:", err);
        saveOfflineBackup(payload);
        handleSuccess();
      } finally {
        surveyState.isSubmitting = false;
        submitBtn.classList.remove("is-loading");
        if (btnText) btnText.textContent = "Transmitir Bitácora a Torre de Control";
      }
    });
  }

  function handleSuccess() {
    surveyState.completed = true;

    // Confetti de celebración
    if (typeof confetti === "function") {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#38bdf8", "#0866c6", "#ffffff", "#fbbf24"]
        });
      } catch (e) {
        console.log("Confetti trigger:", e);
      }
    }

    // Navegar al Waypoint 7 (Aterrizaje)
    FlightDeck.goToStep(7);
  }

  function saveOfflineBackup(payload) {
    try {
      const stored = JSON.parse(localStorage.getItem("senair_offline_surveys") || "[]");
      stored.push({ ...payload, savedAt: new Date().toISOString() });
      localStorage.setItem("senair_offline_surveys", JSON.stringify(stored));
    } catch (e) {
      console.error("[SENAIR] Fallo al guardar en localStorage:", e);
    }
  }

  function setupRestart() {
    document.getElementById("btnRestartExperience")?.addEventListener("click", () => {
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

      // Limpiar UI
      document.querySelectorAll(".star-beacon-btn").forEach((s) => s.classList.remove("active"));
      document.querySelectorAll(".radar-card").forEach((r) => r.classList.remove("selected"));
      document.querySelectorAll(".amenity-chip-card").forEach((a) => a.classList.remove("selected"));
      document.querySelectorAll(".thrust-btn").forEach((t) => t.classList.remove("selected"));

      const feedback = document.getElementById("feedbackTextarea");
      const email = document.getElementById("contactEmailInput");
      const machVal = document.getElementById("npsMachVal");
      const categoryTag = document.getElementById("npsCategoryTag");

      if (feedback) feedback.value = "";
      if (email) email.value = "";
      if (machVal) machVal.textContent = "--";
      if (categoryTag) categoryTag.textContent = "CALIBRA EL EMPUJE";

      updateBoardingPass();
      FlightDeck.goToStep(0);
    });
  }

  // ── Inicialización ───────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    FlightDeck.init();
    bindQuestions();
  });
})();
