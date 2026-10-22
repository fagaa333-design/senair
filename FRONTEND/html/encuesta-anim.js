/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Controlador de Animaciones Scrollytelling
 * 11 Escenas de Campaña Premium con Lenis + GSAP 3 + ScrollTrigger
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Registrar plugins de GSAP
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  let lenisInstance = null;

  // Objeto global exportado para control de navegación y scroll
  window.FlightScroller = {
    lenis: null,

    init() {
      this.initSmoothScroll();

      if (prefersReducedMotion || typeof gsap === "undefined") {
        console.info("[SENAIR] Modo de movimiento reducido o GSAP no disponible.");
        this.initFallbackNav();
        return;
      }

      this.initScene1WindowShutter();
      this.initScene2MarqueeScale();
      this.initScene3DoodleWipe();
      this.initScene4ManifestoReveal();
      this.initScene5CollageParallax();
      this.initScene6PixelGrid();
      this.initScene7SplitTitleAndQuestions();
      this.initScene8ClipPathExpand();
      this.initScene9QuestionsPart2();
      this.initScene10SummaryHUD();
      this.initScene11Landing();
      this.initHUDProgressBar();
    },

    // ── 0. Smooth Scroll con Lenis ───────────────────────────────────
    initSmoothScroll() {
      if (typeof Lenis !== "undefined" && !prefersReducedMotion) {
        try {
          lenisInstance = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.8
          });

          this.lenis = lenisInstance;

          lenisInstance.on("scroll", ScrollTrigger.update);

          gsap.ticker.add((time) => {
            lenisInstance.raf(time * 1000);
          });

          gsap.ticker.lagSmoothing(0);
        } catch (e) {
          console.warn("[SENAIR] No se pudo inicializar Lenis:", e);
        }
      }
    },

    scrollToElement(selector, offset = 0) {
      const target = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!target) return;

      if (this.lenis) {
        this.lenis.scrollTo(target, { offset, duration: 1.3 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    },

    scrollToScene(sceneId) {
      this.scrollToElement(`#${sceneId}`);
    },

    initFallbackNav() {
      const scrollIndicator = document.getElementById("scrollIndicator");
      scrollIndicator?.addEventListener("click", () => {
        this.scrollToScene("scene-2");
      });
    },

    // ── Escena 1: HERO CLARO & Ventanilla que se abre con Scroll ─────
    initScene1WindowShutter() {
      const scene1 = document.getElementById("scene-1");
      const shutter = document.getElementById("windowShutter");
      const heroWindow = document.getElementById("heroAirplaneWindow");
      const scrollIndicator = document.getElementById("scrollIndicator");

      scrollIndicator?.addEventListener("click", () => {
        this.scrollToElement("#scene-2");
      });

      if (!scene1 || !shutter) return;

      // Cortinilla se abre deslizando hacia arriba en función del scroll
      gsap.to(shutter, {
        yPercent: -100,
        ease: "none",
        scrollTrigger: {
          trigger: scene1,
          start: "top top",
          end: "bottom top",
          scrub: 1.1
        }
      });

      // Suave inclinación 3D de la ventanilla con el mouse
      if (heroWindow && window.innerWidth > 992) {
        heroWindow.addEventListener("mousemove", (e) => {
          const rect = heroWindow.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(heroWindow, {
            rotationY: x * 12,
            rotationX: -y * 12,
            transformPerspective: 900,
            duration: 0.5,
            ease: "power2.out"
          });
        });

        heroWindow.addEventListener("mouseleave", () => {
          gsap.to(heroWindow, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.8,
            ease: "power2.out"
          });
        });
      }
    },

    // ── Escena 2: ENCOGER MARCO + MARQUEE DOBLE ──────────────────────
    initScene2MarqueeScale() {
      const scene2 = document.getElementById("scene-2");
      const anchor = document.getElementById("scaledWindowAnchor");
      const track1 = document.getElementById("marqueeTrack1");
      const track2 = document.getElementById("marqueeTrack2");

      if (!scene2) return;

      // Reducción del marco centrado
      if (anchor) {
        gsap.fromTo(
          anchor,
          { scale: 1.1, opacity: 0.8 },
          {
            scale: 0.82,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: scene2,
              start: "top bottom",
              end: "center center",
              scrub: 1
            }
          }
        );
      }

      // Marquee en direcciones contrarias
      if (track1 && track2) {
        gsap.to(track1, {
          xPercent: -25,
          ease: "none",
          scrollTrigger: {
            trigger: scene2,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8
          }
        });

        gsap.to(track2, {
          xPercent: 25,
          ease: "none",
          scrollTrigger: {
            trigger: scene2,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8
          }
        });
      }
    },

    // ── Escena 3: GARABATO SVG + BARRIDO DE BARRAS ────────────────────
    initScene3DoodleWipe() {
      const scene3 = document.getElementById("scene-3");
      const path = document.getElementById("flightDoodlePath");
      const marker = document.getElementById("doodlePlaneMarker");
      const wipeBars = document.querySelectorAll(".wipe-bars-curtain .wipe-bar");

      if (!scene3) return;

      // Animación del trazo dibujado a mano
      if (path) {
        const pathLength = 1400;
        gsap.fromTo(
          path,
          { strokeDashoffset: pathLength },
          {
            strokeDashoffset: 0,
            ease: "power1.inOut",
            scrollTrigger: {
              trigger: scene3,
              start: "top 70%",
              end: "center center",
              scrub: 1.2
            }
          }
        );
      }

      if (marker) {
        gsap.fromTo(
          marker,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: scene3,
              start: "top 60%",
              end: "center center",
              scrub: 1
            }
          }
        );
      }

      // Barras que barren la pantalla de abajo hacia arriba
      if (wipeBars.length > 0) {
        gsap.fromTo(
          wipeBars,
          { yPercent: 100 },
          {
            yPercent: -100,
            stagger: 0.08,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: scene3,
              start: "center center",
              end: "bottom top",
              scrub: 1
            }
          }
        );
      }
    },

    // ── Escena 4: MANIFIESTO (Palabra por Palabra) ───────────────────
    initScene4ManifestoReveal() {
      const scene4 = document.getElementById("scene-4");
      const words = document.querySelectorAll("#manifestoWords .word");

      if (!scene4 || words.length === 0) return;

      // Revelación progresiva palabra por palabra
      gsap.fromTo(
        words,
        { opacity: 0.12, y: 15 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: scene4,
            start: "top 65%",
            end: "bottom 80%",
            scrub: 1
          }
        }
      );
    },

    // ── Escena 5: COLLAGE FLOTANTE (Parallax + B&W a Color) ───────────
    initScene5CollageParallax() {
      const scene5 = document.getElementById("scene-5");
      const items = document.querySelectorAll(".collage-item");

      if (!scene5 || items.length === 0) return;

      items.forEach((item) => {
        const speed = parseFloat(item.getAttribute("data-parallax") || "0.3");
        const visual = item.querySelector(".collage-visual");

        // Parallax vertical a diferente velocidad
        gsap.to(item, {
          yPercent: -60 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: scene5,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });

        // Transición de blanco y negro a color pleno al entrar en foco
        if (visual) {
          gsap.fromTo(
            visual,
            { filter: "grayscale(100%) brightness(0.85)" },
            {
              filter: "grayscale(0%) brightness(1)",
              ease: "power1.out",
              scrollTrigger: {
                trigger: item,
                start: "top 75%",
                end: "center 45%",
                scrub: 0.8
              }
            }
          );
        }
      });
    },

    // ── Escena 6: TRANSICIÓN DE BLOQUES (Pixel Mosaic Grid) ───────────
    initScene6PixelGrid() {
      const scene6 = document.getElementById("scene-6");
      const blocks = document.querySelectorAll(".pixel-mosaic-grid .pixel-block");

      if (!scene6 || blocks.length === 0) return;

      // Efecto mosaico estocástico / stagger
      gsap.fromTo(
        blocks,
        { opacity: 0, scale: 0.3 },
        {
          opacity: 1,
          scale: 1,
          stagger: {
            amount: 1.2,
            from: "random"
          },
          ease: "power3.out",
          scrollTrigger: {
            trigger: scene6,
            start: "top 70%",
            end: "center center",
            scrub: 0.8
          }
        }
      );
    },

    // ── Escena 7: PREGUNTAS PARTE 1 (Split Title + Pinned Stages) ─────
    initScene7SplitTitleAndQuestions() {
      const splitBanner = document.getElementById("splitTitlePart1");
      const splitLeft = document.getElementById("splitLeftWord");
      const splitRight = document.getElementById("splitRightWord");

      if (splitBanner && splitLeft && splitRight) {
        gsap.fromTo(
          splitLeft,
          { xPercent: -100, opacity: 0 },
          {
            xPercent: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: splitBanner,
              start: "top 80%",
              end: "center 50%",
              scrub: 0.8
            }
          }
        );

        gsap.fromTo(
          splitRight,
          { xPercent: 100, opacity: 0 },
          {
            xPercent: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: splitBanner,
              start: "top 80%",
              end: "center 50%",
              scrub: 0.8
            }
          }
        );
      }

      // Preguntas pineadas Q1, Q2, Q3
      const stagesPart1 = ["#stage-q1", "#stage-q2", "#stage-q3"];
      stagesPart1.forEach((stageSel) => {
        const stageEl = document.querySelector(stageSel);
        if (!stageEl) return;

        const card = stageEl.querySelector(".pinned-question-card");

        ScrollTrigger.create({
          trigger: stageEl,
          start: "top top",
          end: "+=60%",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1
        });

        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0.2, scale: 0.94, y: 30 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: {
                trigger: stageEl,
                start: "top 80%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });
    },

    // ── Escena 8: EXPANSIÓN A PANTALLA COMPLETA (Clip-Path) ────────────
    initScene8ClipPathExpand() {
      const scene8 = document.getElementById("scene-8");
      const card = document.getElementById("expandCard");

      if (!scene8 || !card) return;

      // El card se expande desde una caja central redondeada hasta ocupar toda la pantalla
      gsap.fromTo(
        card,
        {
          clipPath: "inset(18% 22% round 32px)",
          scale: 0.92
        },
        {
          clipPath: "inset(0% 0% round 0px)",
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: scene8,
            start: "top 70%",
            end: "center center",
            scrub: 1
          }
        }
      );
    },

    // ── Escena 9: PREGUNTAS PARTE 2 (Pinned Stages Q4 y Q5) ───────────
    initScene9QuestionsPart2() {
      const stagesPart2 = ["#stage-q4", "#stage-q5"];

      stagesPart2.forEach((stageSel) => {
        const stageEl = document.querySelector(stageSel);
        if (!stageEl) return;

        const card = stageEl.querySelector(".pinned-question-card");

        ScrollTrigger.create({
          trigger: stageEl,
          start: "top top",
          end: "+=60%",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1
        });

        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0.2, scale: 0.94, y: 30 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: {
                trigger: stageEl,
                start: "top 80%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });
    },

    // ── Escena 10: RESUMEN "BOARDING PASS" (HUD Metrics) ──────────────
    initScene10SummaryHUD() {
      const scene10 = document.getElementById("scene-10");
      const metricCards = document.querySelectorAll(".hud-metric-card");

      if (!scene10 || metricCards.length === 0) return;

      gsap.fromTo(
        metricCards,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: scene10,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      );
    },

    // ── Escena 11: FINAL (Animación de Aterrizaje) ─────────────────────
    initScene11Landing() {
      const scene11 = document.getElementById("scene-11");
      const plane = document.querySelector(".landing-plane-svg");

      if (!scene11 || !plane) return;

      gsap.fromTo(
        plane,
        { y: -70, scale: 0.7, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: scene11,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    },

    // ── Barra de Progreso HUD en el Header ────────────────────────────
    initHUDProgressBar() {
      const trackFill = document.getElementById("hudTrackFill");
      const phaseIndicator = document.getElementById("hudFlightPhase");

      if (!trackFill) return;

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const pct = Math.round(self.progress * 100);
          trackFill.style.width = `${pct}%`;

          if (phaseIndicator) {
            if (pct < 15) {
              phaseIndicator.textContent = "CHECK-IN";
            } else if (pct < 35) {
              phaseIndicator.textContent = "DESPEGUE & CRUCERO";
            } else if (pct < 70) {
              phaseIndicator.textContent = "EVALUACIÓN A BORDO";
            } else if (pct < 90) {
              phaseIndicator.textContent = "DESCENSO & RESUMEN";
            } else {
              phaseIndicator.textContent = "ATERRIZAJE FINAL";
            }
          }
        }
      });
    }
  };

  // Inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.FlightScroller.init();
    });
  } else {
    window.FlightScroller.init();
  }
})();
