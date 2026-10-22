/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Motor WebGL 3D Real & Scrollytelling Cinematográfico
 * Three.js + GSAP ScrollTrigger • Avión 3D Real, Iluminación, Nubes & Cámara
 * ═════════════════════════════════════════════════════════════════════════
 */

(() => {
  "use strict";

  if (typeof THREE === "undefined") {
    console.error("[SENAIR 3D] Three.js no está disponible.");
    return;
  }

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  const Flight3DApp = {
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    airplane: null,
    runwayGroup: null,
    clouds: [],
    strobes: [],
    lights: {},
    masterTimeline: null,
    clock: new THREE.Clock(),
    isMobile: window.innerWidth < 768,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },

    init() {
      this.canvas = document.getElementById("webglCanvas");
      if (!this.canvas) return;

      this.initScene();
      this.createAirliner();
      this.createCloudEnvironment();
      this.createRunway();
      this.createLighting();
      this.setupScrollAnimation();
      this.setupInteractionListeners();
      this.animate();

      console.info("[SENAIR 3D] Escena WebGL 3D iniciada exitosamente.");
    },

    // ── 1. Inicialización de Escena, Cámara y Renderer ──────────────
    initScene() {
      this.scene = new THREE.Scene();
      // Fondo y niebla aeroespacial azul ultramar SENAIR
      this.scene.background = new THREE.Color(0x04132b);
      this.scene.fog = new THREE.FogExp2(0x061b3d, 0.004);

      const aspect = window.innerWidth / window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1500);
      this.camera.position.set(-2.0, 1.5, 16);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: false, // Fondo sólido nítido para máximo contraste
        antialias: true,
        powerPreference: "high-performance"
      });

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.25;
    },

    // ── 2. Creación del Avión Comercial 3D (SENAIR Airliner) ────────
    createAirliner() {
      const airplaneGroup = new THREE.Group();

      // Materiales aeroespaciales
      const liveryBodyMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.22,
        metalness: 0.18,
        side: THREE.DoubleSide
      });

      const navyAccentMat = new THREE.MeshStandardMaterial({
        color: 0x0866c6,
        roughness: 0.28,
        metalness: 0.25,
        side: THREE.DoubleSide
      });

      const goldStripeMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.2,
        metalness: 0.75,
        side: THREE.DoubleSide
      });

      const cockpitGlassMat = new THREE.MeshStandardMaterial({
        color: 0x051329,
        roughness: 0.08,
        metalness: 0.95
      });

      const engineChromeMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.25,
        metalness: 0.85
      });

      const engineGlowMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8
      });

      // A. FUSELAJE CENTRAL (Aerodynamic fuselage - 100% Cerrado)
      const fuselageGeo = new THREE.CylinderGeometry(1.22, 1.22, 14, 32, 1, false);
      fuselageGeo.rotateX(Math.PI / 2);
      const fuselage = new THREE.Mesh(fuselageGeo, liveryBodyMat);
      fuselage.castShadow = true;
      fuselage.receiveShadow = true;
      airplaneGroup.add(fuselage);

      // Nariz aerodinámica curvada (Esfera sólida presurizada)
      const noseGeo = new THREE.SphereGeometry(1.22, 32, 24);
      const nose = new THREE.Mesh(noseGeo, liveryBodyMat);
      nose.position.set(0, 0, 6.2);
      nose.scale.set(1.0, 0.95, 2.2);
      nose.castShadow = true;
      airplaneGroup.add(nose);

      // Franja inferior azul marino SENAIR en la panza
      const bellyStripeGeo = new THREE.CylinderGeometry(1.23, 1.23, 11, 32, 1, false, 0, Math.PI);
      bellyStripeGeo.rotateX(Math.PI / 2);
      bellyStripeGeo.rotateZ(Math.PI);
      const belly = new THREE.Mesh(bellyStripeGeo, navyAccentMat);
      belly.position.set(0, -0.02, 0);
      airplaneGroup.add(belly);

      // Cheatline dorado de distinción
      const cheatlineGeo = new THREE.CylinderGeometry(1.24, 1.24, 13, 32, 1, true);
      cheatlineGeo.rotateX(Math.PI / 2);
      const cheatline = new THREE.Mesh(cheatlineGeo, goldStripeMat);
      cheatline.scale.set(1.01, 0.05, 1);
      cheatline.position.set(0, 0.12, 0);
      airplaneGroup.add(cheatline);

      // Cono de cola aerodinámico cerrado (apunta hacia -Z)
      const tailConeGeo = new THREE.ConeGeometry(1.22, 5.5, 32, 1, false);
      tailConeGeo.rotateX(-Math.PI / 2);
      const tailCone = new THREE.Mesh(tailConeGeo, navyAccentMat);
      tailCone.position.set(0, 0.15, -8.5);
      tailCone.castShadow = true;
      airplaneGroup.add(tailCone);

      // B. CABINA / PARABRISAS (Cockpit windshield)
      const windshieldGeo = new THREE.SphereGeometry(1.18, 24, 16, 0, Math.PI, 0, Math.PI * 0.45);
      windshieldGeo.rotateX(-Math.PI * 0.35);
      const windshield = new THREE.Mesh(windshieldGeo, cockpitGlassMat);
      windshield.position.set(0, 0.48, 7.3);
      windshield.scale.set(0.85, 0.55, 1.2);
      airplaneGroup.add(windshield);

      // C. ALAS PRINCIPALES (Swept-back wings con diedro positivo)
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.lineTo(11.5, -4.0);
      wingShape.lineTo(10.6, -4.8);
      wingShape.lineTo(0, -2.6);
      wingShape.closePath();

      const wingExtrudeSettings = { depth: 0.18, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
      const rightWingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
      rightWingGeo.rotateX(Math.PI / 2);
      rightWingGeo.rotateZ(-0.045);

      const rightWing = new THREE.Mesh(rightWingGeo, liveryBodyMat);
      rightWing.position.set(0.65, -0.22, 1.3);
      rightWing.castShadow = true;
      airplaneGroup.add(rightWing);

      const leftWingGeo = rightWingGeo.clone();
      leftWingGeo.scale(-1, 1, 1);
      const leftWing = new THREE.Mesh(leftWingGeo, liveryBodyMat);
      leftWing.position.set(-0.65, -0.22, 1.3);
      leftWing.castShadow = true;
      airplaneGroup.add(leftWing);

      // Winglets en puntas de ala dorados
      const wingletGeo = new THREE.ConeGeometry(0.22, 1.3, 4);
      wingletGeo.rotateX(Math.PI);
      const rightWinglet = new THREE.Mesh(wingletGeo, goldStripeMat);
      rightWinglet.position.set(11.6, 0.45, -3.0);
      rightWinglet.rotation.z = -0.32;
      airplaneGroup.add(rightWinglet);

      const leftWinglet = rightWinglet.clone();
      leftWinglet.position.set(-11.6, 0.45, -3.0);
      leftWinglet.rotation.z = 0.32;
      airplaneGroup.add(leftWinglet);

      // D. MOTORES TURBOFAN (Turbofans con tobera incandescente)
      const createEngine = (xPos) => {
        const engineGroup = new THREE.Group();

        // Góndola del motor
        const nacelleGeo = new THREE.CylinderGeometry(0.74, 0.66, 3.5, 24);
        nacelleGeo.rotateX(Math.PI / 2);
        const nacelle = new THREE.Mesh(nacelleGeo, engineChromeMat);
        nacelle.castShadow = true;
        engineGroup.add(nacelle);

        // Anillo frontal dorado
        const ringGeo = new THREE.TorusGeometry(0.72, 0.08, 16, 24);
        const ring = new THREE.Mesh(ringGeo, goldStripeMat);
        ring.position.set(0, 0, 1.75);
        engineGroup.add(ring);

        // Cono central del fan
        const spinnerGeo = new THREE.ConeGeometry(0.22, 0.6, 16);
        spinnerGeo.rotateX(-Math.PI / 2);
        const spinner = new THREE.Mesh(spinnerGeo, engineChromeMat);
        spinner.position.set(0, 0, 1.6);
        engineGroup.add(spinner);

        // Tobera y resplandor de escape (Glow)
        const exhaustGeo = new THREE.CylinderGeometry(0.56, 0.46, 0.7, 24);
        exhaustGeo.rotateX(Math.PI / 2);
        const exhaust = new THREE.Mesh(exhaustGeo, engineGlowMat);
        exhaust.position.set(0, 0, -1.85);
        engineGroup.add(exhaust);

        // Soporte de ala (Pylon)
        const pylonGeo = new THREE.BoxGeometry(0.14, 0.65, 1.5);
        const pylon = new THREE.Mesh(pylonGeo, engineChromeMat);
        pylon.position.set(0, 0.6, 0);
        engineGroup.add(pylon);

        engineGroup.position.set(xPos, -0.95, 0.3);
        return engineGroup;
      };

      airplaneGroup.add(createEngine(4.0));
      airplaneGroup.add(createEngine(-4.0));

      // E. EMPENAJE DE COLA (Vertical Fin & Stabilizers)
      const finShape = new THREE.Shape();
      finShape.moveTo(0, 0);
      finShape.lineTo(0.35, 4.6);
      finShape.lineTo(1.7, 4.3);
      finShape.lineTo(3.4, 0);
      finShape.closePath();

      const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.15, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.03, bevelThickness: 0.03 });
      finGeo.rotateY(Math.PI / 2);
      const verticalFin = new THREE.Mesh(finGeo, navyAccentMat);
      verticalFin.position.set(0.075, 0.85, -10.8);
      verticalFin.castShadow = true;
      airplaneGroup.add(verticalFin);

      // Estabilizadores horizontales
      const hStabShape = new THREE.Shape();
      hStabShape.moveTo(0, 0);
      hStabShape.lineTo(4.4, -1.6);
      hStabShape.lineTo(3.9, -2.2);
      hStabShape.lineTo(0, -1.3);
      hStabShape.closePath();

      const hStabGeo = new THREE.ExtrudeGeometry(hStabShape, { depth: 0.11, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.02, bevelThickness: 0.02 });
      hStabGeo.rotateX(Math.PI / 2);

      const rightHStab = new THREE.Mesh(hStabGeo, liveryBodyMat);
      rightHStab.position.set(0.32, 0.65, -9.8);
      airplaneGroup.add(rightHStab);

      const leftHStabGeo = hStabGeo.clone();
      leftHStabGeo.scale(-1, 1, 1);
      const leftHStab = new THREE.Mesh(leftHStabGeo, liveryBodyMat);
      leftHStab.position.set(-0.32, 0.65, -9.8);
      airplaneGroup.add(leftHStab);

      // F. LUCES ESTROBOSCÓPICAS DE NAVEGACIÓN (Blinking Strobes)
      const createStrobe = (colorHex, x, y, z) => {
        const mat = new THREE.MeshBasicMaterial({ color: colorHex });
        const geo = new THREE.SphereGeometry(0.16, 8, 8);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        airplaneGroup.add(mesh);
        this.strobes.push({ mesh, mat, colorHex, flashSpeed: 2.0 });
        return mesh;
      };

      createStrobe(0xff0033, -11.6, 0.45, -3.0); // Babor roja
      createStrobe(0x00ff66, 11.6, 0.45, -3.0);  // Estribor verde
      createStrobe(0xffffff, 0, 5.4, -10.5);     // Cola blanca

      // Encuadre responsivo (Móvil centrado en la bóveda celeste / PC en cuadrante derecho)
      if (this.isMobile) {
        airplaneGroup.scale.set(0.68, 0.68, 0.68);
        airplaneGroup.position.set(0.2, 3.2, -4);
        airplaneGroup.rotation.set(0.12, -0.45, -0.1);
        if (this.camera) {
          this.camera.position.set(0, 1.2, 22);
          this.camera.lookAt(0.2, 2.2, -4);
        }
      } else {
        airplaneGroup.scale.set(0.85, 0.85, 0.85);
        airplaneGroup.position.set(6.0, 0.5, -2.5);
        airplaneGroup.rotation.set(0.08, -0.65, -0.12);
        if (this.camera) {
          this.camera.position.set(-1.0, 0.8, 20);
          this.camera.lookAt(1.5, 0.5, -2.5);
        }
      }

      this.airplane = airplaneGroup;
      this.scene.add(airplaneGroup);
    },

    // ── 3. Nubes Tridimensionales y Entorno Atmosférico ───────────────
    createCloudEnvironment() {
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.92,
        metalness: 0.04,
        transparent: true,
        opacity: 0.58,
        depthWrite: false
      });

      const createSingleCloud = (scaleBase) => {
        const cloudGroup = new THREE.Group();
        const puffCount = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < puffCount; i++) {
          const radius = scaleBase * (0.85 + Math.random() * 0.95);
          const geo = new THREE.SphereGeometry(radius, 16, 14);
          const puff = new THREE.Mesh(geo, cloudMat);
          puff.position.set(
            (Math.random() - 0.5) * scaleBase * 2.8,
            (Math.random() - 0.5) * scaleBase * 0.9,
            (Math.random() - 0.5) * scaleBase * 2.2
          );
          cloudGroup.add(puff);
        }
        return cloudGroup;
      };

      for (let i = 0; i < 30; i++) {
        const scale = 2.4 + Math.random() * 3.5;
        const cloud = createSingleCloud(scale);

        const x = (Math.random() - 0.5) * 95;
        const y = -17.5 - Math.random() * 8; // Manto de nubes por debajo de la cota de vuelo
        const z = 15 - Math.random() * 260;

        cloud.position.set(x, y, z);
        this.clouds.push({
          mesh: cloud,
          initZ: z,
          speed: 0.1 + Math.random() * 0.14
        });
        this.scene.add(cloud);
      }
    },

    // ── 4. Pista de Aterrizaje Iluminada (Para Secuencia E) ───────────
    createRunway() {
      const runwayGroup = new THREE.Group();

      // Franja de asfalto
      const asphaltMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.85,
        metalness: 0.1
      });
      const asphaltGeo = new THREE.PlaneGeometry(16, 260);
      asphaltGeo.rotateX(-Math.PI / 2);
      const asphalt = new THREE.Mesh(asphaltGeo, asphaltMat);
      asphalt.receiveShadow = true;
      runwayGroup.add(asphalt);

      // Balizas de pista (Runway Edge Lights)
      const lightGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const warmLightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const greenThreshMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

      for (let z = -120; z < 130; z += 12) {
        const mat = z > 100 ? greenThreshMat : warmLightMat;
        const lightLeft = new THREE.Mesh(lightGeo, mat);
        lightLeft.position.set(-8.2, 0.15, z);
        runwayGroup.add(lightLeft);

        const lightRight = new THREE.Mesh(lightGeo, mat);
        lightRight.position.set(8.2, 0.15, z);
        runwayGroup.add(lightRight);
      }

      runwayGroup.position.set(0, -9.5, -40);
      runwayGroup.visible = false; // Se hace visible en Secuencia E
      this.runwayGroup = runwayGroup;
      this.scene.add(runwayGroup);
    },

    // ── 5. Iluminación Cinematográfica Dinámica ──────────────────────
    createLighting() {
      const ambientLight = new THREE.AmbientLight(0xbad7f5, 0.95);
      this.scene.add(ambientLight);
      this.lights.ambient = ambientLight;

      // Sol dorado principal
      const sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
      sunLight.position.set(28, 45, 32);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      this.scene.add(sunLight);
      this.lights.sun = sunLight;

      // Luz de relleno azulada desde abajo (Atmosphere bounce)
      const fillLight = new THREE.DirectionalLight(0x0d3b66, 0.9);
      fillLight.position.set(-20, -30, -10);
      this.scene.add(fillLight);
      this.lights.fill = fillLight;
    },

    // ── 6. Coordinación de la Escena 3D con GSAP ScrollTrigger ────────
    setupScrollAnimation() {
      if (!this.airplane || typeof ScrollTrigger === "undefined") return;

      const flightState = {
        planeX: 6.0,
        planeY: 0.5,
        planeZ: -2.5,
        rotX: 0.08,
        rotY: -0.65,
        rotZ: -0.12,
        camX: -2.0,
        camY: 0.8,
        camZ: 20,
        sunIntensity: 2.2,
        runwayVis: 0
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".scrolly-scroll-track",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          onUpdate: () => {
            if (!this.airplane) return;
            this.airplane.position.set(flightState.planeX, flightState.planeY, flightState.planeZ);
            this.airplane.rotation.set(flightState.rotX, flightState.rotY, flightState.rotZ);

            this.camera.position.set(flightState.camX, flightState.camY, flightState.camZ);
            this.camera.lookAt(flightState.planeX * 0.35, flightState.planeY, flightState.planeZ);

            if (this.lights.sun) {
              this.lights.sun.intensity = flightState.sunIntensity;
            }

            if (this.runwayGroup) {
              this.runwayGroup.visible = flightState.runwayVis > 0.4;
            }
          }
        }
      });

      this.masterTimeline = tl;

      // ── SECUENCIA A: APROXIMACIÓN (0% -> 20%) ──
      // Vuelo inicial majestuoso frente al usuario
      tl.to(flightState, {
        planeX: 0.8,
        planeY: 0.6,
        planeZ: 1.5,
        rotX: 0.05,
        rotY: 0.15,
        rotZ: 0.08,
        camX: -2.0,
        camY: 2.0,
        camZ: 16.5,
        sunIntensity: 2.1,
        ease: "power1.inOut",
        duration: 2
      });

      // ── SECUENCIA B: VUELO & ASCENSO (20% -> 40%) ──
      // Alabeo a estribor y ascenso hacia 32,000 pies con reflejos solares
      tl.to(flightState, {
        planeX: -3.2,
        planeY: 3.8,
        planeZ: 3.0,
        rotX: 0.22,
        rotY: -0.42,
        rotZ: -0.38,
        camX: 8.5,
        camY: 4.8,
        camZ: 17.0,
        sunIntensity: 2.5,
        ease: "power2.inOut",
        duration: 2.5
      });

      // ── SECUENCIA C: CHECK-IN / REGISTRO (40% -> 60%) ──
      // Vuelo recto y nivelado a la derecha, dejando libre el centro/izquierda para el formulario
      tl.to(flightState, {
        planeX: 4.2,
        planeY: 0.5,
        planeZ: -3.0,
        rotX: 0.01,
        rotY: 0.06,
        rotZ: 0.04,
        camX: -5.0,
        camY: 1.8,
        camZ: 18.0,
        sunIntensity: 1.95,
        ease: "power1.inOut",
        duration: 2.5
      });

      // ── SECUENCIA D: ENCUESTA EN VUELO (60% -> 85%) ──
      // Suaves virajes coordinados con la navegación de preguntas
      tl.to(flightState, {
        planeX: -1.5,
        planeY: -1.2,
        planeZ: 2.5,
        rotX: -0.08,
        rotY: 0.28,
        rotZ: -0.20,
        camX: 4.8,
        camY: 1.2,
        camZ: 16.0,
        sunIntensity: 2.2,
        ease: "power2.inOut",
        duration: 3
      });

      // ── SECUENCIA E: DESTINO & ATERRIZAJE (85% -> 100%) ──
      // Descenso final sobre pista iluminada, alas niveladas
      tl.to(flightState, {
        planeX: 0,
        planeY: -4.5,
        planeZ: -10,
        rotX: 0.18,
        rotY: 0,
        rotZ: 0,
        camX: 0,
        camY: 0.2,
        camZ: 16.0,
        sunIntensity: 1.4,
        runwayVis: 1.0,
        ease: "power2.out",
        duration: 2
      });
    },

    // ── 7. Loop de Renderizado a 60 FPS ───────────────────────────────
    animate() {
      requestAnimationFrame(() => this.animate());

      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      // Interpolación suave del cursor del mouse para micro-paralaje
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      // Turbulencia sutil y respuesta orgánica al cursor
      if (this.airplane) {
        this.airplane.position.y += Math.sin(time * 2.2) * 0.0035;
        this.airplane.rotation.z += Math.sin(time * 1.8) * 0.0018;

        this.airplane.rotation.y += this.mouse.x * 0.03;
        this.airplane.rotation.x += this.mouse.y * 0.02;
      }

      // Parpadeo de luces estroboscópicas de navegación
      this.strobes.forEach((strobe, idx) => {
        const isWhite = idx === 2;
        const blink = isWhite
          ? (Math.floor(time * 4) % 2 === 0 ? 1 : 0.1)
          : (Math.sin(time * 3 + idx) > 0.5 ? 1 : 0.2);
        strobe.mat.opacity = blink;
      });

      // Desplazamiento continuo de nubes en profundidad
      this.clouds.forEach((cloudObj) => {
        cloudObj.mesh.position.z += cloudObj.speed;
        if (cloudObj.mesh.position.z > 30) {
          cloudObj.mesh.position.z = -250;
          cloudObj.mesh.position.x = (Math.random() - 0.5) * 95;
          cloudObj.mesh.position.y = -14.5 - Math.random() * 8;
        }
      });

      this.renderer.render(this.scene, this.camera);
    },

    // ── 8. Manejo de Redimensionamiento y Cursor ──────────────────────
    setupInteractionListeners() {
      window.addEventListener("resize", () => {
        if (!this.camera || !this.renderer) return;

        this.isMobile = window.innerWidth < 768;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.refresh();
        }
      });

      window.addEventListener("mousemove", (e) => {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        this.mouse.targetX = (e.clientX - halfW) / halfW;
        this.mouse.targetY = (e.clientY - halfH) / halfH;
      });
    }
  };

  window.Flight3DApp = Flight3DApp;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Flight3DApp.init());
  } else {
    Flight3DApp.init();
  }
})();
