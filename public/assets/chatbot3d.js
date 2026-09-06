/**
 * 3D PORTFOLIO COMPANION MASCOT — "CHIBI GUIDE"
 * Interactive 3D Cartoon Boy Mascot for Shivansh Srivastava's Portfolio
 * 
 * Design Features:
 * - Stylized 3D cartoon boy (Chibi proportions) with fluffy dark hair, round glasses & dark hoodie
 * - Casually seated on a dark lunar rock with an open glowing miniature laptop
 * - 5 Interactive States:
 *   1. Idle State: Breathing physics & glowing laptop screen reflections
 *   2. Cursor Tracking: Smooth head, gaze & spectacles tracking towards cursor
 *   3. Hover State: Hand wave gesture & glowing orbital halo with "Hey! 👋" speech bubble
 *   4. Click / Open: Starburst particle explosion & elastic scale reaction
 *   5. Chat Companion: Actively assists user during conversation
 */

(function () {
  'use strict';

  class MascotCompanion {
    constructor() {
      this.container = document.getElementById('mascot-canvas-container');
      this.tooltip = document.getElementById('mascot-tooltip');
      this.tooltipText = this.tooltip ? this.tooltip.querySelector('.tooltip-text') : null;
      this.chatDrawer = document.getElementById('ai-chat-drawer');

      if (!this.container) return;

      this.width = 120;
      this.height = 120;
      this.isHovered = false;
      this.isChatOpen = false;

      this.mouse = { x: 0, y: 0, screenX: 0, screenY: 0 };
      this.targetHeadRot = { x: 0, y: 0, z: 0 };
      this.currentHeadRot = { x: 0, y: 0, z: 0 };
      this.waveProgress = 0;
      this.proximity = 0;

      this.particles = [];
      this.clock = null;

      this.initThree();
      this.createScene();
      this.bindEvents();
      this.animate();
    }

    initThree() {
      if (typeof THREE === 'undefined') {
        setTimeout(() => this.initThree(), 150);
        return;
      }

      this.clock = new THREE.Clock();

      // Scene & Camera
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 100);
      this.camera.position.set(0, 0.22, 4.25);
      this.camera.lookAt(0, -0.05, 0);

      // WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.2;
      this.container.appendChild(this.renderer.domElement);

      // Lighting Setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
      this.scene.add(ambientLight);

      // Key Directional Light (Warm White)
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
      keyLight.position.set(3.5, 4.5, 4);
      this.scene.add(keyLight);

      // Back Rim Light (Crisp White Silhouette)
      const rimLight = new THREE.DirectionalLight(0xffffff, 2.6);
      rimLight.position.set(-3, 3.5, -3.5);
      this.scene.add(rimLight);

      // Soft Blue Fill
      const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
      fillLight.position.set(0, -2, 3);
      this.scene.add(fillLight);
    }

    createScene() {
      if (!this.scene) return;

      this.masterGroup = new THREE.Group();
      this.scene.add(this.masterGroup);

      // ==================== MATERIALS ====================
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0xffd8be,
        roughness: 0.42,
        metalness: 0.05
      });

      const darkHairMat = new THREE.MeshStandardMaterial({
        color: 0x11141a,
        roughness: 0.8,
        metalness: 0.1
      });

      const hoodieMat = new THREE.MeshStandardMaterial({
        color: 0x151922,
        roughness: 0.55,
        metalness: 0.1
      });

      const pantsMat = new THREE.MeshStandardMaterial({
        color: 0x0f131c,
        roughness: 0.7,
        metalness: 0.05
      });

      const sneakerMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.25,
        metalness: 0.1
      });

      const sneakerSoleMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.6
      });

      const glassesMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.15,
        metalness: 0.95
      });

      const eyePupilMat = new THREE.MeshStandardMaterial({
        color: 0x06090e,
        roughness: 0.05,
        metalness: 0.95
      });

      const eyeHighlightMat = new THREE.MeshBasicMaterial({
        color: 0xffffff
      });

      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x1e2738,
        roughness: 0.85,
        metalness: 0.25,
        flatShading: true
      });

      const laptopBodyMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.2,
        metalness: 0.85
      });

      const laptopScreenMat = new THREE.MeshBasicMaterial({
        color: 0xf0f9ff
      });

      // ==================== 1. CRAGGY LUNAR ROCK BASE ====================
      const rockGeo = new THREE.DodecahedronGeometry(1.3, 1);
      this.rockMesh = new THREE.Mesh(rockGeo, rockMat);
      this.rockMesh.scale.set(1.45, 0.75, 1.25);
      this.rockMesh.position.set(0, -1.35, -0.05);
      this.rockMesh.rotation.set(0.28, 0.4, 0.12);
      this.masterGroup.add(this.rockMesh);

      // Sub-crags for organic shape
      const subRockGeo = new THREE.DodecahedronGeometry(0.55, 0);
      const subRock1 = new THREE.Mesh(subRockGeo, rockMat);
      subRock1.scale.set(1.1, 0.6, 0.9);
      subRock1.position.set(-0.95, -1.4, 0.3);
      this.masterGroup.add(subRock1);

      const subRock2 = new THREE.Mesh(subRockGeo, rockMat);
      subRock2.scale.set(0.9, 0.5, 0.8);
      subRock2.position.set(0.95, -1.45, 0.2);
      this.masterGroup.add(subRock2);

      // ==================== 2. SEATED LEGS & SNEAKERS ====================
      this.legsGroup = new THREE.Group();
      this.masterGroup.add(this.legsGroup);

      // Left Thigh
      const thighGeo = new THREE.CylinderGeometry(0.22, 0.19, 0.65, 12);
      const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
      leftThigh.position.set(-0.36, -0.78, 0.25);
      leftThigh.rotation.set(Math.PI * 0.42, 0.2, -0.25);
      this.legsGroup.add(leftThigh);

      // Right Thigh
      const rightThigh = leftThigh.clone();
      rightThigh.position.set(0.36, -0.78, 0.25);
      rightThigh.rotation.set(Math.PI * 0.42, -0.2, 0.25);
      this.legsGroup.add(rightThigh);

      // Left Shin
      const shinGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.55, 12);
      const leftShin = new THREE.Mesh(shinGeo, pantsMat);
      leftShin.position.set(-0.44, -1.05, 0.55);
      leftShin.rotation.set(Math.PI * 0.12, 0, -0.15);
      this.legsGroup.add(leftShin);

      // Right Shin
      const rightShin = leftShin.clone();
      rightShin.position.set(0.44, -1.05, 0.55);
      rightShin.rotation.set(Math.PI * 0.12, 0, 0.15);
      this.legsGroup.add(rightShin);

      // Sneakers
      const sneakerGeo = new THREE.BoxGeometry(0.25, 0.19, 0.44);
      const leftSneaker = new THREE.Mesh(sneakerGeo, sneakerMat);
      leftSneaker.position.set(-0.48, -1.28, 0.7);
      leftSneaker.rotation.set(0.08, 0.2, 0);
      this.legsGroup.add(leftSneaker);

      const soleGeo = new THREE.BoxGeometry(0.26, 0.05, 0.46);
      const leftSole = new THREE.Mesh(soleGeo, sneakerSoleMat);
      leftSole.position.set(0, -0.09, 0);
      leftSneaker.add(leftSole);

      const rightSneaker = leftSneaker.clone();
      rightSneaker.position.set(0.48, -1.28, 0.7);
      rightSneaker.rotation.set(0.08, -0.2, 0);
      this.legsGroup.add(rightSneaker);

      // ==================== 3. TORSO & HOODIE ====================
      this.torsoGroup = new THREE.Group();
      this.masterGroup.add(this.torsoGroup);

      const torsoGeo = new THREE.CylinderGeometry(0.48, 0.42, 0.78, 16);
      this.torsoMesh = new THREE.Mesh(torsoGeo, hoodieMat);
      this.torsoMesh.position.set(0, -0.45, 0.02);
      this.torsoGroup.add(this.torsoMesh);

      // Hoodie Collar Rim
      const collarGeo = new THREE.TorusGeometry(0.32, 0.08, 10, 24);
      const collarMesh = new THREE.Mesh(collarGeo, hoodieMat);
      collarMesh.position.set(0, -0.06, 0.04);
      collarMesh.rotation.set(Math.PI * 0.48, 0, 0);
      this.torsoGroup.add(collarMesh);

      // ==================== 4. GLOWING MINIATURE LAPTOP ====================
      this.laptopGroup = new THREE.Group();
      this.laptopGroup.position.set(0, -0.42, 0.44);
      this.laptopGroup.rotation.set(-0.12, 0, 0);
      this.masterGroup.add(this.laptopGroup);

      // Laptop Base
      const lapBaseGeo = new THREE.BoxGeometry(0.72, 0.038, 0.5);
      const lapBase = new THREE.Mesh(lapBaseGeo, laptopBodyMat);
      this.laptopGroup.add(lapBase);

      // Laptop Lid (Open at 116 deg)
      const lidGroup = new THREE.Group();
      lidGroup.position.set(0, 0.016, -0.24);
      lidGroup.rotation.set(Math.PI * 0.64, 0, 0);
      this.laptopGroup.add(lidGroup);

      const lapLidGeo = new THREE.BoxGeometry(0.72, 0.03, 0.48);
      const lapLid = new THREE.Mesh(lapLidGeo, laptopBodyMat);
      lapLid.position.set(0, 0.015, 0.23);
      lidGroup.add(lapLid);

      // Screen Display
      const screenGeo = new THREE.PlaneGeometry(0.66, 0.42);
      const screenMesh = new THREE.Mesh(screenGeo, laptopScreenMat);
      screenMesh.position.set(0, 0.032, 0.23);
      screenMesh.rotation.set(-Math.PI * 0.5, 0, 0);
      lidGroup.add(screenMesh);

      // Dynamic Screen Glow
      this.screenLight = new THREE.PointLight(0xdbeafe, 2.6, 3.8);
      this.screenLight.position.set(0, -0.15, 0.52);
      this.masterGroup.add(this.screenLight);

      // ==================== 5. ARMS & HANDS ====================
      const armGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.58, 12);
      const leftArm = new THREE.Mesh(armGeo, hoodieMat);
      leftArm.position.set(-0.46, -0.32, 0.18);
      leftArm.rotation.set(Math.PI * 0.38, 0.25, -0.35);
      this.torsoGroup.add(leftArm);

      const handGeo = new THREE.SphereGeometry(0.095, 12, 12);
      const leftHand = new THREE.Mesh(handGeo, skinMat);
      leftHand.position.set(-0.25, -0.42, 0.48);
      this.torsoGroup.add(leftHand);

      // Right Arm (Interactive Wave Group)
      this.rightArmGroup = new THREE.Group();
      this.rightArmGroup.position.set(0.46, -0.15, 0.05);
      this.torsoGroup.add(this.rightArmGroup);

      this.rightArmMesh = new THREE.Mesh(armGeo, hoodieMat);
      this.rightArmMesh.position.set(0, -0.2, 0.12);
      this.rightArmMesh.rotation.set(Math.PI * 0.38, -0.25, 0.35);
      this.rightArmGroup.add(this.rightArmMesh);

      this.rightHand = new THREE.Mesh(handGeo, skinMat);
      this.rightHand.position.set(0.2, -0.3, 0.38);
      this.rightArmGroup.add(this.rightHand);

      // ==================== 6. HEAD & EXPRESSIVE FACE ====================
      this.headGroup = new THREE.Group();
      this.headGroup.position.set(0, 0.42, 0.04);
      this.masterGroup.add(this.headGroup);

      const headGeo = new THREE.SphereGeometry(0.7, 28, 28);
      headGeo.scale(1.0, 1.05, 0.95);
      this.headMesh = new THREE.Mesh(headGeo, skinMat);
      this.headGroup.add(this.headMesh);

      // Ears
      const earGeo = new THREE.SphereGeometry(0.15, 12, 12);
      earGeo.scale(0.5, 1.2, 0.9);
      const leftEar = new THREE.Mesh(earGeo, skinMat);
      leftEar.position.set(-0.7, 0, -0.05);
      this.headGroup.add(leftEar);

      const rightEar = leftEar.clone();
      rightEar.position.set(0.7, 0, -0.05);
      this.headGroup.add(rightEar);

      // Nose
      const noseGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const nose = new THREE.Mesh(noseGeo, skinMat);
      nose.position.set(0, -0.04, 0.7);
      this.headGroup.add(nose);

      // Eyes
      const eyeGroup = new THREE.Group();
      this.headGroup.add(eyeGroup);

      const pupilGeo = new THREE.SphereGeometry(0.15, 16, 16);
      pupilGeo.scale(0.85, 1.15, 0.4);

      const leftPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
      leftPupil.position.set(-0.25, 0.06, 0.64);
      eyeGroup.add(leftPupil);

      const rightPupil = leftPupil.clone();
      rightPupil.position.set(0.25, 0.06, 0.64);
      eyeGroup.add(rightPupil);

      // Catchlights
      const sparkGeo = new THREE.SphereGeometry(0.045, 10, 10);
      const leftSpark = new THREE.Mesh(sparkGeo, eyeHighlightMat);
      leftSpark.position.set(-0.22, 0.12, 0.7);
      eyeGroup.add(leftSpark);

      const rightSpark = leftSpark.clone();
      rightSpark.position.set(0.28, 0.12, 0.7);
      eyeGroup.add(rightSpark);

      const subSparkGeo = new THREE.SphereGeometry(0.024, 8, 8);
      const leftSubSpark = new THREE.Mesh(subSparkGeo, eyeHighlightMat);
      leftSubSpark.position.set(-0.28, 0.02, 0.7);
      eyeGroup.add(leftSubSpark);

      const rightSubSpark = leftSubSpark.clone();
      rightSubSpark.position.set(0.22, 0.02, 0.7);
      eyeGroup.add(rightSubSpark);

      // ==================== 7. ROUND WIREFRAME GLASSES ====================
      const glassesGroup = new THREE.Group();
      this.headGroup.add(glassesGroup);

      const frameGeo = new THREE.TorusGeometry(0.23, 0.026, 12, 32);
      const leftFrame = new THREE.Mesh(frameGeo, glassesMat);
      leftFrame.position.set(-0.25, 0.06, 0.67);
      glassesGroup.add(leftFrame);

      const rightFrame = leftFrame.clone();
      rightFrame.position.set(0.25, 0.06, 0.67);
      glassesGroup.add(rightFrame);

      // Bridge
      const bridgeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8);
      const bridge = new THREE.Mesh(bridgeGeo, glassesMat);
      bridge.rotation.set(0, 0, Math.PI * 0.5);
      bridge.position.set(0, 0.07, 0.68);
      glassesGroup.add(bridge);

      // Temples
      const templeGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.54, 8);
      const leftTemple = new THREE.Mesh(templeGeo, glassesMat);
      leftTemple.position.set(-0.48, 0.06, 0.42);
      leftTemple.rotation.set(Math.PI * 0.5, 0, 0.25);
      glassesGroup.add(leftTemple);

      const rightTemple = leftTemple.clone();
      rightTemple.position.set(0.48, 0.06, 0.42);
      rightTemple.rotation.set(Math.PI * 0.5, 0, -0.25);
      glassesGroup.add(rightTemple);

      // ==================== 8. FLUFFY DARK HAIR ====================
      this.hairGroup = new THREE.Group();
      this.headGroup.add(this.hairGroup);

      const hairCrownGeo = new THREE.SphereGeometry(0.74, 20, 20);
      hairCrownGeo.scale(1.05, 1.1, 1.06);
      const hairCrown = new THREE.Mesh(hairCrownGeo, darkHairMat);
      hairCrown.position.set(0, 0.09, -0.06);
      this.hairGroup.add(hairCrown);

      // Front Bangs
      const bangGeo = new THREE.ConeGeometry(0.2, 0.45, 10);
      const bangPositions = [
        { x: -0.34, y: 0.4, z: 0.58, rx: 0.35, ry: 0.1, rz: 0.45 },
        { x: -0.16, y: 0.44, z: 0.64, rx: 0.4, ry: -0.1, rz: 0.2 },
        { x: 0.06, y: 0.46, z: 0.66, rx: 0.38, ry: 0.05, rz: -0.1 },
        { x: 0.27, y: 0.42, z: 0.61, rx: 0.42, ry: -0.15, rz: -0.35 },
        { x: 0.44, y: 0.34, z: 0.52, rx: 0.3, ry: 0.2, rz: -0.55 },
        { x: -0.5, y: 0.3, z: 0.48, rx: 0.28, ry: -0.2, rz: 0.6 }
      ];

      bangPositions.forEach((b) => {
        const bang = new THREE.Mesh(bangGeo, darkHairMat);
        bang.position.set(b.x, b.y, b.z);
        bang.rotation.set(b.rx, b.ry, b.rz);
        this.hairGroup.add(bang);
      });

      // Top messy fluffy hair tufts
      const tuftGeo = new THREE.DodecahedronGeometry(0.26, 0);
      const tuftPositions = [
        { x: -0.22, y: 0.7, z: 0.1 },
        { x: 0.2, y: 0.74, z: -0.05 },
        { x: 0.0, y: 0.76, z: 0.16 },
        { x: -0.38, y: 0.58, z: -0.2 },
        { x: 0.4, y: 0.6, z: -0.18 }
      ];

      tuftPositions.forEach((t) => {
        const tuft = new THREE.Mesh(tuftGeo, darkHairMat);
        tuft.position.set(t.x, t.y, t.z);
        tuft.rotation.set(Math.random(), Math.random(), Math.random());
        this.hairGroup.add(tuft);
      });

      // ==================== 9. LUMINOUS ORBITAL RING ====================
      const haloGeo = new THREE.TorusGeometry(1.6, 0.024, 12, 48);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
      });
      this.haloRing = new THREE.Mesh(haloGeo, haloMat);
      this.haloRing.rotation.set(Math.PI * 0.44, 0.15, 0);
      this.haloRing.position.set(0, -0.3, 0);
      this.masterGroup.add(this.haloRing);

      // ==================== 10. CLICK STARBURST PARTICLE POOL ====================
      this.particleGroup = new THREE.Group();
      this.scene.add(this.particleGroup);
      this.createParticles();

      // Master Posing
      this.masterGroup.position.set(0, 0.12, 0);
      this.masterGroup.rotation.y = -0.06;
    }

    createParticles() {
      const pGeo = new THREE.SphereGeometry(0.048, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });

      for (let i = 0; i < 30; i++) {
        const mesh = new THREE.Mesh(pGeo, pMat.clone());
        mesh.visible = false;
        this.particleGroup.add(mesh);
        this.particles.push({
          mesh,
          vel: new THREE.Vector3(),
          life: 0,
          maxLife: 1
        });
      }
    }

    triggerStarburst() {
      this.particles.forEach((p) => {
        p.mesh.visible = true;
        p.mesh.position.set(0, 0, 0.2);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = Math.random() * 4.0 + 1.2;
        p.vel.set(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.cos(phi) * speed,
          Math.sin(phi) * Math.sin(theta) * speed
        );
        p.life = 0;
        p.maxLife = Math.random() * 0.45 + 0.3;
      });

      if (this.masterGroup) {
        this.masterGroup.scale.set(1.22, 1.22, 1.22);
        setTimeout(() => {
          this.masterGroup.scale.set(1, 1, 1);
        }, 180);
      }
    }

    setTooltip(text, isVisible = true) {
      if (!this.tooltip) return;
      if (this.tooltipText && text) {
        this.tooltipText.textContent = text;
      }
      if (isVisible) {
        this.tooltip.classList.add('is-visible');
      } else {
        this.tooltip.classList.remove('is-visible');
      }
    }

    bindEvents() {
      window.addEventListener('mousemove', (e) => {
        this.mouse.screenX = e.clientX;
        this.mouse.screenY = e.clientY;

        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = 480;
        if (dist < maxDist) {
          this.proximity = 1 - (dist / maxDist);
          this.targetHeadRot.y = Math.max(-0.65, Math.min(0.65, (dx / maxDist) * 1.15));
          this.targetHeadRot.x = Math.max(-0.4, Math.min(0.4, (dy / maxDist) * 0.85));
          this.targetHeadRot.z = -this.targetHeadRot.y * 0.15;

          if (dist < 220 && !this.isChatOpen) {
            this.setTooltip('Ask me anything! ✦', true);
          } else if (dist >= 220 && !this.isHovered && !this.isChatOpen) {
            this.setTooltip('', false);
          }
        } else {
          this.proximity = 0;
          this.targetHeadRot.x = 0;
          this.targetHeadRot.y = -0.06;
          this.targetHeadRot.z = 0;
          if (!this.isHovered && !this.isChatOpen) {
            this.setTooltip('', false);
          }
        }
      }, { passive: true });

      this.container.addEventListener('mouseenter', () => {
        this.isHovered = true;
        if (!this.isChatOpen) {
          this.setTooltip('Hey! 👋', true);
        }
      });

      this.container.addEventListener('mouseleave', () => {
        this.isHovered = false;
        if (!this.isChatOpen) {
          if (this.proximity > 0.4) {
            this.setTooltip('Ask me anything! ✦', true);
          } else {
            this.setTooltip('', false);
          }
        }
      });

      const launcher = document.getElementById('mascot-launcher');
      if (launcher) {
        launcher.addEventListener('click', (e) => {
          e.preventDefault();
          this.triggerStarburst();
          window.dispatchEvent(new CustomEvent('toggle-ai-chat'));
        });
      }

      window.addEventListener('ai-chat-state', (e) => {
        this.isChatOpen = !!e.detail?.isOpen;
        if (this.isChatOpen) {
          this.setTooltip("I'm here if you need anything! ✦", true);
        } else {
          this.setTooltip(this.isHovered ? 'Hey! 👋' : '', this.isHovered);
        }
      });
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      if (!this.renderer || !this.scene || !this.camera || !this.clock) return;

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Breathing
      const floatY = Math.sin(elapsed * 2.0) * 0.07;
      const breathScale = 1 + Math.sin(elapsed * 2.8) * 0.015;

      if (this.masterGroup) {
        this.masterGroup.position.y = 0.12 + floatY;
      }

      if (this.torsoMesh) {
        this.torsoMesh.scale.set(breathScale, 1, breathScale);
      }

      // Screen glow pulse
      if (this.screenLight) {
        const screenPulse = 2.4 + Math.sin(elapsed * 5.0) * 0.4 + (this.isHovered ? 0.9 : 0);
        this.screenLight.intensity = screenPulse;
      }

      // Smooth Head Tracking Lerp
      const lerpFactor = 0.12;
      this.currentHeadRot.x += (this.targetHeadRot.x - this.currentHeadRot.x) * lerpFactor;
      this.currentHeadRot.y += (this.targetHeadRot.y - this.currentHeadRot.y) * lerpFactor;
      this.currentHeadRot.z += (this.targetHeadRot.z - this.currentHeadRot.z) * lerpFactor;

      if (this.headGroup) {
        this.headGroup.rotation.set(
          this.currentHeadRot.x,
          this.currentHeadRot.y,
          this.currentHeadRot.z
        );
      }

      // Hover Wave Gesture
      const targetWave = this.isHovered ? 1 : 0;
      this.waveProgress += (targetWave - this.waveProgress) * 0.15;

      if (this.rightArmGroup) {
        if (this.waveProgress > 0.02) {
          const waveWiggle = Math.sin(elapsed * 9.0) * 0.35 * this.waveProgress;
          this.rightArmGroup.rotation.set(
            -0.8 * this.waveProgress,
            -0.3 * this.waveProgress,
            (0.6 + waveWiggle) * this.waveProgress
          );
        } else {
          this.rightArmGroup.rotation.set(0, 0, 0);
        }
      }

      // Halo ring
      if (this.haloRing) {
        const ringSpeed = this.isHovered ? 3.5 : 1.4;
        this.haloRing.rotation.z += ringSpeed * delta;
        this.haloRing.material.opacity = this.isHovered ? 0.9 : 0.5;
      }

      // Particles
      this.particles.forEach((p) => {
        if (p.mesh.visible) {
          p.life += delta;
          if (p.life >= p.maxLife) {
            p.mesh.visible = false;
          } else {
            p.mesh.position.addScaledVector(p.vel, delta);
            const progress = p.life / p.maxLife;
            p.mesh.material.opacity = 1 - progress;
            p.mesh.scale.setScalar(1 - progress * 0.7);
          }
        }
      });

      this.renderer.render(this.scene, this.camera);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.MascotCompanion = new MascotCompanion();
    });
  } else {
    window.MascotCompanion = new MascotCompanion();
  }
})();
