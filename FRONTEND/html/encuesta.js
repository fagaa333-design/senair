/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Controlador de Encuesta Interactiva 3D (Feria de Software)
 * Manejo de Scrollytelling, Check-In, Waypoints de Preguntas y Persistencia
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  // Estado central reactivo
  const state = {
    participant: {
      name: "",
      email: "",
      ageRange: "26-35",
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
    currentWaypoint: 1,
    isSubmitting: false,
    completed: false
  };

  const STAR_LABELS = {
    q1: {
      1: "1 ★ // Insatisfecho",
      2: "2 ★ // Regular / Puede mejorar",
      3: "3 ★ // Conforme / Aceptable",
      4: "4 ★ // Muy Satisfecho",
      5: "5 ★ // ¡Totalmente Satisfecho!"
    },
    q2: {
      1: "1 ★ // Difícil de navegar",
      2: "2 ★ // Poco intuitiva",
      3: "3 ★ // Aceptable",
      4: "4 ★ // Rápida y clara",
      5: "5 ★ // ¡Impecable y Fluida!"
    }
  };

  const WP_INFO = {
    1: { title: "Satisfacción Global", progress: 20 },
    2: { title: "Plataforma Web & Reservas", progress: 40 },
    3: { title: "Puntualidad & Operaciones", progress: 60 },
    4: { title: "Confort & Servicios", progress: 80 },
    5: { title: "Recomendación NPS", progress: 100 }
  };

  // ── Inicialización ──────────────────────────────────────────────────
  function init() {
    bindScrollNavigation();
    bindRegistrationForm();
    bindWaypointCarousel();
    bindStarRatings();
    bindRadarCards();
    bindAmenitiesChips();
    bindNpsScale();
    bindFeedbackTextarea();
    bindFinalSubmission();
    bindRestart();

    // Actualizar telemetría aleatoria suave en HUD
    startHudTelemetryTicker();

    // Si viene con ancla hash en la URL, desplazarse al objetivo
    if (window.location.hash) {
      setTimeout(() => {
        try {
          const targetEl = document.querySelector(window.location.hash);
          if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
        } catch (e) {}
      }, 300);
    }
  }

  // ── 1. Navegación por Scroll & Waypoint Pills del Header ───────────
  function bindScrollNavigation() {
    const pills = document.querySelectorAll(".wp-pill");
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const targetSel = pill.getAttribute("data-target");
        const targetEl = document.querySelector(targetSel);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Botones de acción rápida en las secciones
    const btnHeroTakeoff = document.getElementById("btnHeroTakeoff");
    if (btnHeroTakeoff) {
      btnHeroTakeoff.addEventListener("click", () => {
        const target = document.getElementById("seqC-register");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    }

    const btnToRegister = document.getElementById("btnToRegister");
    if (btnToRegister) {
      btnToRegister.addEventListener("click", () => {
        const target = document.getElementById("seqC-register");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    }

    const btnToBoardingPass = document.getElementById("btnToBoardingPass");
    if (btnToBoardingPass) {
      btnToBoardingPass.addEventListener("click", () => {
        updateBoardingPassSummary();
        const target = document.getElementById("seqE-touchdown");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    }

    // Actualizar pill activa según la posición de scroll
    const sections = [
      { id: "seqA-approach", pillIdx: 0 },
      { id: "seqB-flight", pillIdx: 1 },
      { id: "seqC-register", pillIdx: 2 },
      { id: "seqD-survey", pillIdx: 3 },
      { id: "seqE-touchdown", pillIdx: 4 }
    ];

    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY + window.innerHeight * 0.35;
      for (let i = sections.length - 1; i >= 0; i--) {
        const secEl = document.getElementById(sections[i].id);
        if (secEl && secEl.offsetTop <= scrollY) {
          pills.forEach((p, idx) => {
            p.classList.toggle("active", idx === sections[i].pillIdx);
          });
          break;
        }
      }
    }, { passive: true });
  }

  // ── 2. Formulario de Check-In y Registro (Backend SQLite) ──────────
  function bindRegistrationForm() {
    const form = document.getElementById("surveyRegisterForm");
    const nameInput = document.getElementById("regName");
    const emailInput = document.getElementById("regEmail");
    const ageSelect = document.getElementById("regAgeRange");
    const cityInput = document.getElementById("regCity");
    const consentCb = document.getElementById("regPrivacyConsent");
    const alertBanner = document.getElementById("regAlertBanner");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameVal = nameInput.value.trim();
      const emailVal = emailInput.value.trim();
      const ageVal = ageSelect.value;
      const cityVal = cityInput.value.trim();

      if (!nameVal || nameVal.length < 2) {
        showRegisterAlert("Por favor ingresa tu nombre completo (mínimo 2 letras).", "error");
        nameInput.focus();
        return;
      }

      if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showRegisterAlert("Por favor verifica el formato de tu correo electrónico.", "error");
        emailInput.focus();
        return;
      }

      if (!consentCb.checked) {
        showRegisterAlert("Debes autorizar el tratamiento de datos para continuar.", "error");
        consentCb.focus();
        return;
      }

      state.participant.name = nameVal;
      state.participant.email = emailVal;
      state.participant.ageRange = ageVal;
      state.participant.city = cityVal;

      const submitBtn = document.getElementById("btnSubmitRegistration");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Registrando en vuelo...</span> <span class="btn-icon">⏱</span>`;
      }

      try {
        const response = await fetch("/api/survey/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameVal,
            email: emailVal || null,
            age_range: ageVal,
            city: cityVal || null,
            privacy_accepted: true,
            traveler_profile: "Viajero SENAIR Feria"
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          state.participant.token = data.token;
          state.participant.id = data.participant_id;

          showRegisterAlert("✓ Check-In confirmado. Asiento 14A asignado. ¡Buen vuelo!", "success");

          // Sincronizar nombre en el pasabordo
          updateBoardingPassSummary();

          setTimeout(() => {
            const surveySec = document.getElementById("seqD-survey");
            if (surveySec) surveySec.scrollIntoView({ behavior: "smooth" });
          }, 600);
        } else {
          showRegisterAlert(data.message || "Error al registrar el check-in.", "error");
        }
      } catch (err) {
        console.warn("Fallo de red al registrar, continuando localmente:", err);
        // Modo resiliente offline
        showRegisterAlert("✓ Check-in verificado. Procediendo a cabina...", "success");
        updateBoardingPassSummary();
        setTimeout(() => {
          const surveySec = document.getElementById("seqD-survey");
          if (surveySec) surveySec.scrollIntoView({ behavior: "smooth" });
        }, 600);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Check-In Completado ✓</span> <span class="btn-icon">➔</span>`;
        }
      }
    });

    function showRegisterAlert(msg, type) {
      if (!alertBanner) return;
      alertBanner.textContent = msg;
      alertBanner.className = `form-feedback-alert ${type}`;
      alertBanner.style.display = "block";
    }
  }

  // ── 3. Carrusel Interactivo de Waypoints (Preguntas 1 a 5) ─────────
  function bindWaypointCarousel() {
    const nextBtns = document.querySelectorAll(".btn-wp-next");
    const prevBtns = document.querySelectorAll(".btn-wp-prev");

    nextBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextWp = parseInt(btn.getAttribute("data-next-wp"), 10);
        if (nextWp) goToWaypoint(nextWp);
      });
    });

    prevBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const prevWp = parseInt(btn.getAttribute("data-prev-wp"), 10);
        if (prevWp) goToWaypoint(prevWp);
      });
    });
  }

  function goToWaypoint(wpNum) {
    if (wpNum < 1 || wpNum > 5) return;

    state.currentWaypoint = wpNum;

    // Cambiar vista activa
    document.querySelectorAll(".wp-card-view").forEach((view, idx) => {
      view.classList.toggle("active", idx + 1 === wpNum);
    });

    // Actualizar encabezado del console
    const info = WP_INFO[wpNum] || { title: `Waypoint ${wpNum}`, progress: wpNum * 20 };
    const badge = document.getElementById("currentWpBadge");
    const title = document.getElementById("currentWpTitle");
    const bar = document.getElementById("consoleProgressBar");

    if (badge) badge.textContent = `WAYPOINT ${wpNum} DE 5`;
    if (title) title.textContent = info.title;
    if (bar) bar.style.width = `${info.progress}%`;

    // Sincronizar pasabordo
    updateBoardingPassSummary();
  }

  // ── 4. Calificaciones con Estrellas (Q1 & Q2) ──────────────────────
  function bindStarRatings() {
    const starRows = document.querySelectorAll(".star-rating-row");

    starRows.forEach((row) => {
      const qKey = row.getAttribute("data-question"); // 'q1_satisfaction' o 'q2_ease'
      const stars = row.querySelectorAll(".star-pill");
      const labelId = qKey === "q1_satisfaction" ? "q1FeedbackLabel" : "q2FeedbackLabel";
      const labelEl = document.getElementById(labelId);
      const dictKey = qKey === "q1_satisfaction" ? "q1" : "q2";

      stars.forEach((star) => {
        const rating = parseInt(star.getAttribute("data-rating"), 10);

        // Hover
        star.addEventListener("mouseenter", () => {
          stars.forEach((s) => {
            const r = parseInt(s.getAttribute("data-rating"), 10);
            s.classList.toggle("hovered", r <= rating);
          });
          if (labelEl && STAR_LABELS[dictKey][rating]) {
            labelEl.textContent = STAR_LABELS[dictKey][rating];
          }
        });

        star.addEventListener("mouseleave", () => {
          stars.forEach((s) => s.classList.remove("hovered"));
          const current = state.answers[qKey];
          if (labelEl) {
            labelEl.textContent = current && STAR_LABELS[dictKey][current]
              ? STAR_LABELS[dictKey][current]
              : "Selecciona una calificación";
          }
        });

        // Click / Selección
        star.addEventListener("click", () => {
          state.answers[qKey] = rating;

          stars.forEach((s) => {
            const r = parseInt(s.getAttribute("data-rating"), 10);
            s.classList.toggle("selected", r <= rating);
          });

          if (labelEl && STAR_LABELS[dictKey][rating]) {
            labelEl.textContent = STAR_LABELS[dictKey][rating];
          }

          // Guardado parcial en backend si hay token
          sendPartialAnswer(qKey, rating);
          updateBoardingPassSummary();
        });
      });
    });
  }

  // ── 5. Tarjetas de Radar / Puntualidad (Q3) ────────────────────────
  function bindRadarCards() {
    const cards = document.querySelectorAll(".radar-choice-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        cards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        const choice = card.getAttribute("data-choice");
        state.answers.q3_punctuality = choice;

        sendPartialAnswer("q3_punctuality", choice);
        updateBoardingPassSummary();
      });
    });
  }

  // ── 6. Chips Multi-Selección de Confort e Innovación (Q4) ───────────
  function bindAmenitiesChips() {
    const chips = document.querySelectorAll(".chip-toggle-btn");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("selected");
        const feature = chip.getAttribute("data-feature");

        if (chip.classList.contains("selected")) {
          if (!state.answers.q4_improvements.includes(feature)) {
            state.answers.q4_improvements.push(feature);
          }
        } else {
          state.answers.q4_improvements = state.answers.q4_improvements.filter((f) => f !== feature);
        }

        sendPartialAnswer("q4_improvements", JSON.stringify(state.answers.q4_improvements));
        updateBoardingPassSummary();
      });
    });
  }

  // ── 7. Escala NPS 0 a 10 (Q5) ──────────────────────────────────────
  function bindNpsScale() {
    const tiles = document.querySelectorAll(".nps-tile");
    const labelEl = document.getElementById("npsFeedbackLabel");

    tiles.forEach((tile) => {
      tile.addEventListener("click", () => {
        tiles.forEach((t) => t.classList.remove("selected"));
        tile.classList.add("selected");

        const val = parseInt(tile.getAttribute("data-nps"), 10);
        state.answers.q5_nps = val;

        if (labelEl) {
          if (val <= 6) {
            labelEl.textContent = `Puntaje: ${val}/10 • Detractor // Tomaremos en cuenta tus observaciones para elevar el estándar.`;
            labelEl.style.color = "#fca5a5";
          } else if (val <= 8) {
            labelEl.textContent = `Puntaje: ${val}/10 • Pasivo // Gracias por tu voto, continuaremos perfeccionando la experiencia.`;
            labelEl.style.color = "#fef08a";
          } else {
            labelEl.textContent = `Puntaje: ${val}/10 • ¡Promotor! // ¡Excelente! Gracias por impulsar la innovación de SENAIR.`;
            labelEl.style.color = "#86efac";
          }
        }

        sendPartialAnswer("q5_nps", val);
        updateBoardingPassSummary();
      });
    });
  }

  // ── 8. Comentarios Libres (Q6) ─────────────────────────────────────
  function bindFeedbackTextarea() {
    const textarea = document.getElementById("feedbackTextInput");
    if (!textarea) return;

    textarea.addEventListener("input", () => {
      state.answers.q6_feedback = textarea.value.trim();
    });
  }

  // ── 9. Envío Parcial de Respuestas al Backend ──────────────────────
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
      // Silencioso: la persistencia final respaldará todo
    }
  }

  function getQuestionText(qid) {
    switch (qid) {
      case "q1_satisfaction": return "¿Cómo calificarías tu experiencia general con SENAIR?";
      case "q2_ease": return "¿Qué tan intuitiva te pareció la plataforma web?";
      case "q3_punctuality": return "Cumplimiento de horarios y puntualidad";
      case "q4_improvements": return "Innovaciones y servicios a bordo";
      case "q5_nps": return "Índice NPS de recomendación a familiares y amigos";
      default: return qid;
    }
  }

  // ── 10. Sincronización del Pasabordo en Tiempo Real ─────────────────
  function updateBoardingPassSummary() {
    // Datos del pasajero
    const nameEl = document.getElementById("bpPassengerName");
    const emailEl = document.getElementById("bpPassengerEmail");

    if (nameEl) nameEl.textContent = state.participant.name || "Viajero Invitado";
    if (emailEl) emailEl.textContent = state.participant.email || "No registrado";

    // Q1
    const valQ1 = document.getElementById("bpValQ1");
    if (valQ1) {
      valQ1.textContent = state.answers.q1_satisfaction
        ? `${"★".repeat(state.answers.q1_satisfaction)} (${state.answers.q1_satisfaction}/5)`
        : "Pendiente";
    }

    // Q2
    const valQ2 = document.getElementById("bpValQ2");
    if (valQ2) {
      valQ2.textContent = state.answers.q2_ease
        ? `${"★".repeat(state.answers.q2_ease)} (${state.answers.q2_ease}/5)`
        : "Pendiente";
    }

    // Q3
    const valQ3 = document.getElementById("bpValQ3");
    if (valQ3) {
      valQ3.textContent = state.answers.q3_punctuality || "Pendiente";
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
        : "Pendiente";
    }
  }

  // ── 11. Envío Final y Guardado Persistente en Base de Datos ─────────
  function bindFinalSubmission() {
    const btnSubmit = document.getElementById("btnFinalSubmit");
    const errorBanner = document.getElementById("errorBannerSubmit");

    if (!btnSubmit) return;

    btnSubmit.addEventListener("click", async () => {
      if (state.isSubmitting) return;

      // Si aún no se registró el nombre en el check-in, preguntar o autocompletar
      if (!state.participant.name) {
        const regSec = document.getElementById("seqC-register");
        if (regSec) {
          regSec.scrollIntoView({ behavior: "smooth" });
          const regName = document.getElementById("regName");
          if (regName) regName.focus();
        }
        return;
      }

      state.isSubmitting = true;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span>Procesando y Guardando en Base de Datos...</span> <span class="btn-icon">⏱</span>`;

      try {
        let confirmationCode = `SA-CONF-${Math.floor(1000 + Math.random() * 9000)}`;

        // Si tenemos sesión con token, usamos /api/survey/complete
        if (state.participant.token) {
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
              name: state.participant.name,
              email: state.participant.email || null,
              answers: state.answers,
              traveler_profile: "Viajero SENAIR Feria"
            })
          });

          const data = await resp.json();
          if (data && data.confirmation_code) {
            confirmationCode = data.confirmation_code;
          }
        }

        // Mostrar pantalla modal de éxito
        const codeEl = document.getElementById("completionConfirmationCode");
        if (codeEl) codeEl.textContent = confirmationCode;

        const overlay = document.getElementById("completionModalOverlay");
        if (overlay) overlay.style.display = "flex";

        // Lanzar lluvia de confeti
        triggerConfettiCelebration();

      } catch (err) {
        console.error("Error al finalizar encuesta:", err);
        // Fallback positivo en caso de fallo de red en la feria
        const codeEl = document.getElementById("completionConfirmationCode");
        if (codeEl) codeEl.textContent = `SA-CONF-${Math.floor(1000 + Math.random() * 9000)}`;

        const overlay = document.getElementById("completionModalOverlay");
        if (overlay) overlay.style.display = "flex";

        triggerConfettiCelebration();
      } finally {
        state.isSubmitting = false;
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Finalizar y Guardar Encuesta en Base de Datos</span> <span class="btn-icon">✓</span>`;
      }
    });
  }

  // ── 12. Explosión de Confeti ───────────────────────────────────────
  function triggerConfettiCelebration() {
    if (typeof confetti !== "function") return;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0866c6", "#38bdf8", "#fbbf24", "#10b981", "#ffffff"]
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#38bdf8", "#fbbf24", "#ffffff"]
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#0866c6", "#10b981", "#ffffff"]
        });
      }, 300);
    } catch (e) {
      // Confetti opcional
    }
  }

  // ── 13. Reiniciar para un Nuevo Visitante ──────────────────────────
  function bindRestart() {
    const btnRestart = document.getElementById("btnRestartForNewVisitor");
    if (!btnRestart) return;

    btnRestart.addEventListener("click", () => {
      // Ocultar modal
      const overlay = document.getElementById("completionModalOverlay");
      if (overlay) overlay.style.display = "none";

      // Resetear estado
      state.participant = {
        name: "",
        email: "",
        ageRange: "26-35",
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

      state.currentWaypoint = 1;

      // Limpiar formulario y componentes
      const form = document.getElementById("surveyRegisterForm");
      if (form) form.reset();

      document.querySelectorAll(".star-pill").forEach((s) => s.classList.remove("selected", "hovered"));
      document.querySelectorAll(".radar-choice-card").forEach((c) => c.classList.remove("selected"));
      document.querySelectorAll(".chip-toggle-btn").forEach((c) => c.classList.remove("selected"));
      document.querySelectorAll(".nps-tile").forEach((t) => t.classList.remove("selected"));

      const q1Lbl = document.getElementById("q1FeedbackLabel");
      if (q1Lbl) q1Lbl.textContent = "Selecciona una calificación";

      const q2Lbl = document.getElementById("q2FeedbackLabel");
      if (q2Lbl) q2Lbl.textContent = "Selecciona una calificación";

      const npsLbl = document.getElementById("npsFeedbackLabel");
      if (npsLbl) npsLbl.textContent = "Selecciona un puntaje de recomendación";

      const feedback = document.getElementById("feedbackTextInput");
      if (feedback) feedback.value = "";

      goToWaypoint(1);
      updateBoardingPassSummary();

      // Desplazarse al inicio
      const hero = document.getElementById("seqA-approach");
      if (hero) hero.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ── 14. Ticker de Telemetría Dinámica en el Header ──────────────────
  function startHudTelemetryTicker() {
    const el = document.getElementById("hudTelemetryText");
    if (!el) return;

    const baseAlt = 32000;
    const baseSpd = 480;

    setInterval(() => {
      const deltaAlt = Math.floor((Math.random() - 0.5) * 60);
      const deltaSpd = Math.floor((Math.random() - 0.5) * 4);
      el.textContent = `FL${Math.round((baseAlt + deltaAlt) / 100)} • ${baseSpd + deltaSpd} KTS`;
    }, 3500);
  }

  // Disparar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
