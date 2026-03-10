import * as THREE from 'three';
import scene from './core/scene.js';
import camera from './core/camera.js';
import renderer from './core/renderer.js';
import { initScrollController, updateScroll, getScrollProgress, resetScroll, lockScroll, unlockScroll, setCinemaProgress } from './core/scrollController.js';
import { createGlitchCube, updateGlitchCube, isBurstDone, onBurstComplete } from './sections/glitchCube.js';
import { createIntro, isIntroComplete } from './sections/intro.js';
import { createDoor, updateDoor, isDoorOpen, onDoorEnter } from './sections/door.js';
import { createDesk, updateDesk, getRoomZ, onDeskComplete, isDeskDone, getPhase } from './sections/desk.js';
import { createCertificates, updateCertificates, onGalleryComplete, isGalleryDone } from './sections/certificates.js';
import { createProjects, updateProjects, onProjectsComplete, isProjectsDone } from './sections/projects.js';

// ═══════════════════════════════
//  STATE: INTRO → SPACE → DOOR → ROOM → GALLERY → VAULT → ...
// ═══════════════════════════════
let sceneState = 'INTRO';
const CAMERA_Z_START = 5;
const CAMERA_Z_END = -45;
const DOOR_Z = -5;
let scrollEnabled = false;
let starfield = null;

// ── Lighting ──
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// ── Starfield ──
function createStarfield() {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 80;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 40 + 3;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 120 - 20;
        const b = 0.3 + Math.random() * 0.7, t = Math.random();
        col[i * 3] = b * (t < 0.3 ? 0.8 : 1);
        col[i * 3 + 1] = b * (t < 0.6 ? 0.9 : 1);
        col[i * 3 + 2] = b + Math.random() * 0.3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    starfield = new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.05, vertexColors: true, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(starfield);
}
createStarfield();

// ── Glitch Cube ──
const glitchCubeGroup = createGlitchCube();
scene.add(glitchCubeGroup);

// ── Door ──
const doorGroup = createDoor();
doorGroup.visible = false;
scene.add(doorGroup);

// ── Desk / Room ──
const deskGroup = createDesk();
deskGroup.visible = false;
scene.add(deskGroup);

// ── Certificates / Gallery (async) ──
let certGroup = null;
(async () => {
    certGroup = await createCertificates(camera, renderer.domElement);
    certGroup.visible = false;
    scene.add(certGroup);
})();

// ── Projects / Vault (async) ──
let projGroup = null;
(async () => {
    projGroup = await createProjects(camera, renderer.domElement);
    projGroup.visible = false;
    scene.add(projGroup);
})();

// ── Cube burst → show door ──
onBurstComplete(() => {
    sceneState = 'DOOR';
    starfield.visible = false;
    doorGroup.visible = true;
    scrollHint.style.opacity = '0';
    setTimeout(() => scrollHint.remove(), 1000);
    camera.position.set(0, 1.6, DOOR_Z + 8);
    camera.rotation.set(0, 0, 0);
    console.log('🚪 Door scene');
});

// ── Door enter → show room ──
onDoorEnter(() => {
    sceneState = 'ROOM';
    doorGroup.visible = false;
    deskGroup.visible = true;
    console.log('🏠 Room scene');
});

// ── Desk complete → gallery ──
onDeskComplete(() => {
    sceneState = 'GALLERY';
    if (certGroup) certGroup.visible = true;
    const bw = deskGroup.getObjectByName('backWall');
    if (bw) bw.visible = false;
    document.querySelectorAll('div').forEach(d => {
        if (d.textContent && d.textContent.includes('Scroll to continue')) d.remove();
    });
    resetScroll();
    console.log('🏆 Gallery');
});

// ── Gallery complete → time-travel → vault ──
onGalleryComplete(() => {
    // Start the transition but don't switch state yet
    playTimeTravelTransition(() => {
        sceneState = 'VAULT';
        deskGroup.visible = false;
        if (certGroup) certGroup.visible = false;
        if (projGroup) projGroup.visible = true;
        resetScroll();
        renderer.domElement.style.filter = '';
        console.log('🔮 Projects vault');
    });
});

// ─────────────────────────────────────────────────────
//  TIME-TRAVEL CINEMATIC  (runs on top of Three.js canvas)
// ─────────────────────────────────────────────────────
function playTimeTravelTransition(onComplete) {
    const DURATION = 4200; // ms

    // Full-screen overlay canvas
    const ov = document.createElement('canvas');
    ov.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
                        z-index:200;pointer-events:none;`;
    ov.width = window.innerWidth;
    ov.height = window.innerHeight;
    document.body.appendChild(ov);
    const ctx = ov.getContext('2d');
    const W = ov.width, H = ov.height;
    const cx = W / 2, cy = H / 2;

    // ── Particles ──
    const N = 350;
    const parts = Array.from({ length: N }, (_, k) => ({
        angle: (k / N) * Math.PI * 2 + Math.random() * 0.3,
        dist: Math.random() * 0.25 + 0.04,
        speed: 0.25 + Math.random() * 0.6,
        thick: 0.6 + Math.random() * 1.4,
        hue0: Math.random() * 60,   // individual hue offset
    }));

    // ── Easing helpers ──
    function easeIn(t) { return t * t * t; }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function smoothstep(t) { return t * t * (3 - 2 * t); }

    const t0 = performance.now();

    function frame() {
        const elapsed = performance.now() - t0;
        const t = Math.min(1, elapsed / DURATION);   // 0 → 1

        // ── Phase weights ──
        const p1 = smoothstep(Math.min(1, t / 0.12));               // 0-12% portal burst
        const p2 = smoothstep(Math.min(1, Math.max(0, (t - 0.12) / 0.58))); // 12-70% warp accel
        const p3 = smoothstep(Math.min(1, Math.max(0, (t - 0.70) / 0.20))); // 70-90% decel
        const p4 = smoothstep(Math.min(1, Math.max(0, (t - 0.88) / 0.12))); // 88-100% arrival

        const warpSpeed = t < 0.70
            ? easeIn(p2) * 4.5
            : 4.5 * (1 - easeOut(p3));

        // ── Global hue cycling: red → orange → purple → cyan → white ──
        const globalHue = (t * 420) % 360;  // full rainbow over 4s

        // --- Background trail ---
        ctx.fillStyle = `rgba(0,0,2,${0.18 + warpSpeed * 0.06})`;
        ctx.fillRect(0, 0, W, H);

        // --- Warp streak particles ---
        parts.forEach(p => {
            if (warpSpeed < 0.05) return;
            p.dist += p.speed * warpSpeed * 0.009;
            if (p.dist > 0.88) { p.dist = 0.01 + Math.random() * 0.05; }

            const r = Math.min(W, H) * 0.5 * p.dist;
            const tailR = r * (0.06 + warpSpeed * 0.22);
            const x = cx + Math.cos(p.angle) * r;
            const y = cy + Math.sin(p.angle) * r;
            const tx = cx + Math.cos(p.angle) * Math.max(0, r - tailR);
            const ty = cy + Math.sin(p.angle) * Math.max(0, r - tailR);

            const hue = (globalHue + p.hue0 * 2 + p.dist * 90) % 360;
            const alpha = Math.min(1, warpSpeed * 0.5) * (0.5 + p.dist * 0.5);

            const g = ctx.createLinearGradient(tx, ty, x, y);
            g.addColorStop(0, `hsla(${hue},100%,60%,0)`);
            g.addColorStop(1, `hsla(${hue},100%,92%,${alpha})`);

            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(x, y);
            ctx.strokeStyle = g;
            ctx.lineWidth = p.thick * (0.5 + warpSpeed * 0.7);
            ctx.stroke();
        });

        // --- Central spiral / vortex rings ---
        const ringCount = 5;
        for (let r = 0; r < ringCount; r++) {
            const phase = (t * 3 + r * 0.4) % 1;
            const radius = Math.min(W, H) * 0.04 * (1 + phase * 6) * (1 - p3 * 0.5);
            const alpha = (1 - phase) * Math.min(1, warpSpeed) * 0.7;
            const hue = (globalHue + r * 50) % 360;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${hue},100%,80%,${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // --- Central glow core ---
        const coreR = Math.min(W, H) * (0.12 - warpSpeed * 0.022);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, coreR));
        const cHue = (globalHue + 180) % 360;
        cg.addColorStop(0, `hsla(${cHue},100%,100%,${0.9 * Math.min(1, warpSpeed + 0.3)})`);
        cg.addColorStop(0.4, `hsla(${globalHue},100%,70%,${0.5 * Math.min(1, warpSpeed)})`);
        cg.addColorStop(1, 'transparent');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, coreR), 0, Math.PI * 2);
        ctx.fill();

        // --- Vignette ---
        const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.75);
        vg.addColorStop(0, 'transparent');
        vg.addColorStop(1, `rgba(0,0,0,${0.55 + warpSpeed * 0.15})`);
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);

        // --- PHASE 1: Red/orange portal entry burst ---
        if (t < 0.12) {
            const flash = easeOut(1 - t / 0.12);
            ctx.fillStyle = `rgba(255,80,0,${flash * 0.85})`;
            ctx.fillRect(0, 0, W, H);
        }

        // --- PHASE 4: White arrival flash ---
        if (t > 0.86) {
            const flash = easeIn(p4);
            ctx.fillStyle = `rgba(140,220,255,${flash * 0.95})`;
            ctx.fillRect(0, 0, W, H);
        }

        // --- CSS chromatic aberration on Three.js canvas ---
        const aberration = warpSpeed * 25;
        renderer.domElement.style.filter =
            `hue-rotate(${globalHue}deg) saturate(${1 + warpSpeed * 2}) `
            + `blur(${Math.max(0, warpSpeed - 1.5) * 0.8}px)`;

        if (t < 1) {
            requestAnimationFrame(frame);
        } else {
            // Final: white flash then remove overlay
            ctx.fillStyle = 'rgba(180,235,255,0.98)';
            ctx.fillRect(0, 0, W, H);
            setTimeout(() => {
                document.body.removeChild(ov);
                onComplete();
            }, 80);
        }
    }

    requestAnimationFrame(frame);
}

// ── Projects complete ──
onProjectsComplete(() => {
    console.log('✨ Projects complete — ready for contact');
});

// ── Scroll controller ──
initScrollController();
const clock = new THREE.Clock();

// ── Scroll hint ──
const scrollHint = document.createElement('div');
scrollHint.id = 'scroll-hint';
scrollHint.innerHTML = '⟡ Scroll to enter ⟡';
scrollHint.style.cssText = `
  position: fixed; bottom: 40px; left: 50%;
  transform: translateX(-50%);
  color: #00ff88; font-family: 'Courier New', monospace;
  font-size: 14px; letter-spacing: 4px; text-transform: uppercase;
  opacity: 0; pointer-events: none; z-index: 10;
  text-shadow: 0 0 10px rgba(0,255,136,0.5);
  transition: opacity 0.8s ease;
  animation: pulse 2s ease-in-out infinite;
`;
document.body.appendChild(scrollHint);
const style = document.createElement('style');
style.textContent = `@keyframes pulse{0%,100%{opacity:0.4;}50%{opacity:1;}}`;
document.head.appendChild(style);

// ── Intro ──
createIntro(() => {
    sceneState = 'SPACE';
    scrollEnabled = true;
    scrollHint.style.opacity = '1';
    console.log('🎬 Space scene');
});

// ═══════════════════════════════
//  ANIMATION LOOP
// ═══════════════════════════════
function animate() {
    requestAnimationFrame(animate);
    const rawDelta = clock.getDelta();
    const delta = Math.min(rawDelta, 0.05); // cap at 50ms to prevent spiral-of-death

    if (!scrollEnabled) {
        updateGlitchCube(delta, 0);
        renderer.render(scene, camera);
        return;
    }

    const scrollProgress = updateScroll();

    switch (sceneState) {
        case 'SPACE': {
            const targetZ = THREE.MathUtils.lerp(CAMERA_Z_START, CAMERA_Z_END, scrollProgress);
            camera.position.z += (targetZ - camera.position.z) * 0.06;
            camera.position.y += (1.6 - camera.position.y) * 0.06;
            updateGlitchCube(delta, scrollProgress);
            if (scrollProgress > 0.01) {
                scrollHint.style.opacity = Math.max(0, 1 - scrollProgress * 20).toString();
            }
            break;
        }

        case 'DOOR': {
            const targetZDoor = THREE.MathUtils.lerp(DOOR_Z + 8, DOOR_Z - 4, scrollProgress);
            camera.position.z += (targetZDoor - camera.position.z) * 0.07;
            camera.position.y += (1.6 - camera.position.y) * 0.07;
            camera.position.x += (0 - camera.position.x) * 0.07;
            updateDoor(delta, scrollProgress);
            break;
        }

        case 'ROOM':
            updateDesk(delta, camera, scrollProgress);
            break;

        case 'GALLERY':
            updateCertificates(delta, camera, scrollProgress);
            break;

        case 'VAULT':
            updateProjects(delta, camera, scrollProgress);
            break;
    }

    renderer.render(scene, camera);
}

animate();
console.log('✅ Three.js portfolio initialized');
