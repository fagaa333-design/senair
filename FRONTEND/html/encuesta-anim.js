/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Controlador de Animaciones Scrollytelling
 * Motor GSAP 3 + ScrollTrigger + Parallax de Capas + Avión SVG en Ruta
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Registrar plugins de GSAP
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof MotionPathPlugin !== "undefined") {
      gsap.registerPlugin(MotionPathPlugin);
    }
  }

  const FlightAnimator = {
    airplane: null,
    hudTrackFill: null,
    hudAltitudePill: null,
    skyLayers: [],
    stages: [],

    init() {
      if (typeof gsap === "undefined" || prefersReducedMotion) {
        console.log("Modo estático o movimiento reducido activado.");
        this.initStaticMode();
        return;
      }

      this.cacheElements();
      this.setupAirplaneTimeline();
      this.setupStageTransitions();
      this.setupParallaxLayers();
      this.setupMagneticButtons();
    },

    cacheElements() {
      this.airplane = document.getElementById("flightPlane");
      this.hudTrackFill = document.getElementById("hudTrackFill");
      this.hudAltitudePill = document.getElementById("hudAltitudePill");
      this.skyLayers = document.querySelectorAll(".sky-gradient-layer");
      this.stages = document.querySelectorAll(".flight-stage");
    },

    // ── 1. Trayectoria Curva del Avión ─────────────────────────────
    setupAirplaneTimeline() {
      if (!this.airplane) return;

      const windowW = window.innerWidth;
      const windowH = window.innerHeight;

      // Puntos clave de vuelo sincronizados con el scroll general
      const planeTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".flight-scrolly-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          onUpdate: (self) => {
            const progressPct = Math.round(self.progress * 100);
            if (this.hudTrackFill) {
              this.hudTrackFill.style.width = `${progressPct}%`;
            }
          }
        }
      });

      // Movimiento coordinado por etapas del viaje
      planeTimeline
        // Stage 0 -> 1: Despegue (elevación con ángulo positivo)
        .fromTo(
          this.airplane,
          { x: windowW * 0.1, y: windowH * 0.75, rotation: 10, scale: 0.8 },
          { x: windowW * 0.28, y: windowH * 0.45, rotation: 22, scale: 0.95, ease: "power1.inOut" },
          0
        )
        // Stage 1 -> 2: Ascenso cruzando nubes
        .to(
          this.airplane,
          { x: windowW * 0.65, y: windowH * 0.28, rotation: 12, scale: 1.05, ease: "power1.inOut" },
          0.2
        )
        // Stage 2 -> 3: Vuelo Crucero Nivel 1 (altitud máxima, vuelo horizontal)
        .to(
          this.airplane,
          { x: windowW * 0.42, y: windowH * 0.2, rotation: -2, scale: 1.0, ease: "sine.inOut" },
          0.4
        )
        // Stage 3 -> 4: Crucero Nivel 2 (suave ondulación)
        .to(
          this.airplane,
          { x: windowW * 0.72, y: windowH * 0.24, rotation: 4, scale: 1.0, ease: "sine.inOut" },
          0.6
        )
        // Stage 4 -> 5: Descenso y aproximación (inclinación negativa hacia la pista)
        .to(
          this.airplane,
          { x: windowW * 0.35, y: windowH * 0.52, rotation: -16, scale: 0.95, ease: "power1.inOut" },
          0.78
        )
        // Stage 5 -> 6: Aterrizaje suave en destino
        .to(
          this.airplane,
          { x: windowW * 0.5 - 40, y: windowH * 0.68, rotation: 0, scale: 0.88, ease: "power2.out" },
          0.92
        );
    },

    // ── 2. Transición de Secciones y Cielo ─────────────────────────
    setupStageTransitions() {
      const stagesConfig = window.SURVEY_CONFIG?.STAGES || [];

      this.stages.forEach((stageEl, index) => {
        const stageConfig = stagesConfig[index] || {};
        const card = stageEl.querySelector(".stage-card");
        const options = stageEl.querySelectorAll(
          ".choice-card-item, .multi-tag-card, .star-interactive-btn, .nps-tile-btn, .closure-textarea, .takeoff-btn, .magnetic-submit-btn"
        );

        // Animación de entrada de la tarjeta
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 50, scale: 0.94 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: {
                trigger: stageEl,
                start: "top 75%",
                end: "top 25%",
                toggleActions: "play reverse play reverse",
                onEnter: () => this.updateFlightHUD(stageConfig),
                onEnterBack: () => this.updateFlightHUD(stageConfig)
              }
            }
          );
        }

        // Animación escalonada de las opciones (Stagger)
        if (options.length > 0) {
          gsap.fromTo(
            options,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.06,
              ease: "power2.out",
              scrollTrigger: {
                trigger: stageEl,
                start: "top 65%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });
    },

    // ── 3. Parallax de Capas de Fondo ─────────────────────────────
    setupParallaxLayers() {
      const cloudsNear = document.querySelector(".layer-clouds-near");
      const cloudsFar = document.querySelector(".layer-clouds-far");
      const mountains = document.querySelector(".layer-mountains");
      const stars = document.querySelector(".layer-stars");

      if (cloudsNear) {
        gsap.to(cloudsNear, {
          y: -280,
          ease: "none",
          scrollTrigger: {
            trigger: ".flight-scrolly-container",
            start: "top top",
            end: "bottom bottom",
            scrub: true
          }
        });
      }

      if (cloudsFar) {
        gsap.to(cloudsFar, {
          y: -140,
          ease: "none",
          scrollTrigger: {
            trigger: ".flight-scrolly-container",
            start: "top top",
            end: "bottom bottom",
            scrub: true
          }
        });
      }

      if (mountains) {
        gsap.to(mountains, {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: ".flight-scrolly-container",
            start: "top top",
            end: "bottom bottom",
            scrub: true
          }
        });
      }

      if (stars) {
        // En noche y amanecer brillan más
        gsap.to(stars, {
          opacity: 0.6,
          ease: "none",
          scrollTrigger: {
            trigger: ".flight-scrolly-container",
            start: "70% top",
            end: "bottom bottom",
            scrub: true
          }
        });
      }
    },

    // ── 4. Actualización del HUD y Gradiente de Cielo ───────────────
    updateFlightHUD(stageConfig) {
      if (this.hudAltitudePill && stageConfig.altitude) {
        this.hudAltitudePill.textContent = `${stageConfig.altitude}`;
      }

      // Activar capa de gradiente de cielo correspondiente
      if (stageConfig.skyClass) {
        this.skyLayers.forEach((layer) => {
          if (layer.classList.contains(stageConfig.skyClass)) {
            gsap.to(layer, { opacity: 1, duration: 0.8, ease: "power1.inOut" });
          } else {
            gsap.to(layer, { opacity: 0, duration: 0.8, ease: "power1.inOut" });
          }
        });
      }
    },

    // ── 5. Efecto Magnético en Botones Principales ────────────────
    setupMagneticButtons() {
      const magneticBtns = document.querySelectorAll(".takeoff-btn, .magnetic-submit-btn");
      magneticBtns.forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: "power2.out" });
        });

        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
        });
      });
    },

    // ── 6. Navegación Suave Entre Etapas ──────────────────────────
    scrollToStage(index) {
      const target = document.getElementById(`stage-${index}`);
      if (target) {
        const topPos = target.getBoundingClientRect().top + window.pageYOffset - 20;
        window.scrollTo({ top: topPos, behavior: "smooth" });
      }
    },

    initStaticMode() {
      // Activar cielo de día estándar y mostrar todo estático
      const daySky = document.querySelector(".sky-day");
      if (daySky) daySky.style.opacity = "1";
    }
  };

  window.FlightAnimator = FlightAnimator;
})();
