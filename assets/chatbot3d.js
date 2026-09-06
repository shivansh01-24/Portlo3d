/**
 * 3D PORTFOLIO COMPANION MASCOT — "NOVA"
 * Interactive 3D Guide for Shivansh Srivastava's Portfolio
 * 
 * Features:
 * - Three.js WebGL 3D Stylized Cyber Mascot (Not Shivansh — an interactive AI guide)
 * - Smooth Idle Breathing & Floating Physics (120fps GPU-accelerated)
 * - Intelligent Proximity Cursor Tracking (Turns head/body to observe cursor)
 * - Hover Reaction: Acceleration of Orbital Ring, Energy Core Glow & "ASK ME ✦" Tooltip
 * - Click Reaction: Energy Pulse & Particle Burst triggering Cinematic Chat Drawer
 */

(function () {
  'use strict';

  class MascotCompanion {
    constructor() {
      this.container = document.getElementById('mascot-canvas-container');
      this.tooltip = document.getElementById('mascot-tooltip');
      this.badge = document.getElementById('mascot-badge');
      this.chatDrawer = document.getElementById('ai-chat-drawer');
      
      if (!this.container) return;

      this.width = 110;
      this.height = 110;
      this.isHovered = false;
      this.isChatOpen = false;
      
      this.mouse = { x: 0, y: 0, screenX: 0, screenY: 0 };
      this.targetHeadRotation = { x: 0, y: 0 };
      this.currentHeadRotation = { x: 0, y: 0 };
      this.proximity = 0; // 0 to 1

      this.particles = [];
      this.clock = typeof THREE !== 'undefined' ? new THREE.Clock() : null;

      this.initThree();
      this.createMascot();
      this.bindEvents();
      this.animate();
    }

    initThree() {
      if (typeof THREE === 'undefined') {
        console.warn('[Mascot] Three.js not loaded yet. Retrying...');
        setTimeout(() => this.initThree(), 200);
        return;
      }

      this.clock = new THREE.Clock();

      // Scene & Camera
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 100);
      this.camera.position.set(0, 0, 5.5);

      // Renderer with Alpha Transparency
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = false;
      this.container.appendChild(this.renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      this.scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
      keyLight.position.set(4, 5, 5);
      this.scene.add(keyLight);

      const rimLight = new THREE.PointLight(0x00f0ff, 2.5, 10);
      rimLight.position.set(-3, -2, -2);
      this.scene.add(rimLight);

      const coreLight = new THREE.PointLight(0xffffff, 2.0, 4);
      coreLight.position.set(0, 0, 1);
      this.scene.add(coreLight);
      this.coreLight = coreLight;
    }

    createMascot() {
      if (!this.scene) return;

      this.mascotGroup = new THREE.Group();
      this.scene.add(this.mascotGroup);

      // Premium Materials
      const whiteMatteMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.25,
        metalness: 0.1
      });

      const darkObsidianMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.8
      });

      const visorGlowMat = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        emissive: 0x00d2fe,
        emissiveIntensity: 0.85,
        roughness: 0.1,
        metalness: 0.9
      });

      const ringGlowMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: false,
        transparent: true,
        opacity: 0.65
      });

      // 1. Torso / Body
      const torsoGeo = new THREE.CylinderGeometry(0.55, 0.42, 0.9, 16);
      this.torso = new THREE.Mesh(torsoGeo, darkObsidianMat);
      this.torso.position.y = -0.55;
      this.mascotGroup.add(this.torso);

      // 2. Chest Energy Core (Heart)
      const coreGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1.2
      });
      this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
      this.coreMesh.position.set(0, -0.45, 0.42);
      this.coreMesh.scale.set(1, 1, 0.6);
      this.mascotGroup.add(this.coreMesh);

      // 3. Neck
      const neckGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.2, 12);
      const neck = new THREE.Mesh(neckGeo, whiteMatteMat);
      neck.position.y = 0;
      this.mascotGroup.add(neck);

      // 4. Head Group (Rotates with cursor)
      this.headGroup = new THREE.Group();
      this.headGroup.position.y = 0.35;
      this.mascotGroup.add(this.headGroup);

      // Helmet / Head Sphere
      const headGeo = new THREE.SphereGeometry(0.82, 24, 24);
      this.headMesh = new THREE.Mesh(headGeo, whiteMatteMat);
      this.headGroup.add(this.headMesh);

      // Cute Cyber Visor (Face Screen)
      const visorGeo = new THREE.SphereGeometry(0.72, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.5);
      this.visor = new THREE.Mesh(visorGeo, visorGlowMat);
      this.visor.rotation.x = Math.PI * 0.5;
      this.visor.position.set(0, 0.05, 0.18);
      this.visor.scale.set(0.9, 0.65, 0.75);
      this.headGroup.add(this.visor);

      // Visor Eye Glow Line (Expression)
      const eyeGeo = new THREE.BoxGeometry(0.7, 0.1, 0.1);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      this.eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
      this.eyeMesh.position.set(0, 0.05, 0.85);
      this.headGroup.add(this.eyeMesh);

      // Headset Earpieces (Left & Right)
      const earGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.16, 16);
      const leftEar = new THREE.Mesh(earGeo, darkObsidianMat);
      leftEar.rotation.z = Math.PI * 0.5;
      leftEar.position.set(-0.84, 0.05, 0);
      this.headGroup.add(leftEar);

      const rightEar = leftEar.clone();
      rightEar.position.x = 0.84;
      this.headGroup.add(rightEar);

      // Cute Mini Antenna on Left Earpiece
      const antBaseGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
      const ant = new THREE.Mesh(antBaseGeo, whiteMatteMat);
      ant.position.set(-0.95, 0.4, 0);
      ant.rotation.z = 0.25;
      this.headGroup.add(ant);

      const antTipGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const antTip = new THREE.Mesh(antTipGeo, coreMat);
      antTip.position.set(-1.02, 0.62, 0);
      this.headGroup.add(antTip);

      // 5. Floating Orbital Energy Ring
      const ringGeo = new THREE.TorusGeometry(1.4, 0.035, 12, 48);
      this.orbitRing = new THREE.Mesh(ringGeo, ringGlowMat);
      this.orbitRing.rotation.x = Math.PI * 0.42;
      this.mascotGroup.add(this.orbitRing);

      // 6. Particle Burst Group (for click interaction)
      this.particleGroup = new THREE.Group();
      this.scene.add(this.particleGroup);
      this.createParticlePool();

      // Initial position
      this.mascotGroup.position.set(0, 0, 0);
    }

    createParticlePool() {
      const pGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });

      for (let i = 0; i < 24; i++) {
        const p = new THREE.Mesh(pGeo, pMat.clone());
        p.visible = false;
        this.particleGroup.add(p);
        this.particles.push({
          mesh: p,
          vel: new THREE.Vector3(),
          life: 0,
          maxLife: 1
        });
      }
    }

    triggerBurst() {
      this.particles.forEach((p) => {
        p.mesh.visible = true;
        p.mesh.position.set(0, 0, 0);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = Math.random() * 3.5 + 1.5;
        p.vel.set(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.cos(phi) * speed,
          Math.sin(phi) * Math.sin(theta) * speed
        );
        p.life = 0;
        p.maxLife = Math.random() * 0.4 + 0.35;
      });

      // Quick pulse scaling on mascot
      if (this.mascotGroup) {
        this.mascotGroup.scale.set(1.25, 1.25, 1.25);
        setTimeout(() => {
          this.mascotGroup.scale.set(1, 1, 1);
        }, 180);
      }
    }

    bindEvents() {
      // Global Mouse Track for Proximity
      window.addEventListener('mousemove', (e) => {
        this.mouse.screenX = e.clientX;
        this.mouse.screenY = e.clientY;

        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        const mascotCenterX = rect.left + rect.width / 2;
        const mascotCenterY = rect.top + rect.height / 2;

        const dx = e.clientX - mascotCenterX;
        const dy = e.clientY - mascotCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Proximity calculation (within 380px)
        const maxDist = 380;
        if (dist < maxDist) {
          this.proximity = 1 - (dist / maxDist);
          // Target angles clamped
          this.targetHeadRotation.y = Math.max(-0.65, Math.min(0.65, (dx / maxDist) * 1.1));
          this.targetHeadRotation.x = Math.max(-0.45, Math.min(0.45, (dy / maxDist) * 0.8));

          // Show tooltip subtly if close enough
          if (dist < 180 && !this.isChatOpen && this.tooltip) {
            this.tooltip.classList.add('is-visible');
          } else if (dist >= 180 && !this.isHovered && this.tooltip) {
            this.tooltip.classList.remove('is-visible');
          }
        } else {
          this.proximity = 0;
          this.targetHeadRotation.x = 0;
          this.targetHeadRotation.y = 0;
          if (!this.isHovered && this.tooltip) {
            this.tooltip.classList.remove('is-visible');
          }
        }
      }, { passive: true });

      // Hover on Mascot Container
      this.container.addEventListener('mouseenter', () => {
        this.isHovered = true;
        if (this.tooltip && !this.isChatOpen) {
          this.tooltip.classList.add('is-visible');
        }
      });

      this.container.addEventListener('mouseleave', () => {
        this.isHovered = false;
        if (this.tooltip && this.proximity < 0.3) {
          this.tooltip.classList.remove('is-visible');
        }
      });

      // Click on Mascot Launcher
      const launcher = document.getElementById('mascot-launcher');
      if (launcher) {
        launcher.addEventListener('click', (e) => {
          e.preventDefault();
          this.triggerBurst();
          window.dispatchEvent(new CustomEvent('toggle-ai-chat'));
        });
      }

      // Listen for chat state changes
      window.addEventListener('ai-chat-state', (e) => {
        this.isChatOpen = !!e.detail?.isOpen;
        if (this.isChatOpen && this.tooltip) {
          this.tooltip.classList.remove('is-visible');
        }
      });
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      if (!this.renderer || !this.scene || !this.camera || !this.clock) return;

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // 1. Idle Floating & Breathing
      const floatOffset = Math.sin(elapsed * 2.2) * 0.12;
      const breathScale = 1 + Math.sin(elapsed * 3.0) * 0.02;

      if (this.mascotGroup) {
        this.mascotGroup.position.y = floatOffset;
        this.torso.scale.set(breathScale, 1, breathScale);
      }

      // 2. Orbital Ring Spin (Accelerates on hover)
      if (this.orbitRing) {
        const ringSpeed = this.isHovered ? 4.5 : 1.6;
        this.orbitRing.rotation.z += ringSpeed * delta;
        this.orbitRing.rotation.y = Math.sin(elapsed * 1.5) * 0.2;
      }

      // 3. Core Pulse
      if (this.coreLight && this.coreMesh) {
        const pulse = 1.0 + Math.sin(elapsed * 4.0) * 0.35 + (this.isHovered ? 0.6 : 0);
        this.coreLight.intensity = pulse * 1.8;
        this.coreMesh.material.emissiveIntensity = pulse * 1.2;
      }

      // 4. Smooth Head Cursor Tracking (Lerp)
      this.currentHeadRotation.x += (this.targetHeadRotation.x - this.currentHeadRotation.x) * 0.12;
      this.currentHeadRotation.y += (this.targetHeadRotation.y - this.currentHeadRotation.y) * 0.12;

      if (this.headGroup) {
        this.headGroup.rotation.x = this.currentHeadRotation.x;
        this.headGroup.rotation.y = this.currentHeadRotation.y;
        this.headGroup.rotation.z = -this.currentHeadRotation.y * 0.2;
      }

      // 5. Update Particle Bursts
      this.particles.forEach((p) => {
        if (p.mesh.visible) {
          p.life += delta;
          if (p.life >= p.maxLife) {
            p.mesh.visible = false;
          } else {
            p.mesh.position.addScaledVector(p.vel, delta);
            const progress = p.life / p.maxLife;
            p.mesh.material.opacity = 1 - progress;
            p.mesh.scale.setScalar(1 - progress * 0.8);
          }
        }
      });

      this.renderer.render(this.scene, this.camera);
    }
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.MascotGuide = new MascotCompanion();
    });
  } else {
    window.MascotGuide = new MascotCompanion();
  }
})();
