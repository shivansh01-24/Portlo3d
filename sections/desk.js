import * as THREE from 'three';

/**
 * Desk Section — "The Hacker's Den"
 *
 * PHASES:
 *   IDLE     — Camera far, laptop screen dark with subtle flicker
 *   APPROACH — User scrolls closer, camera smoothly moves toward laptop
 *   FOCUS    — Camera at closest point, angle tilts to look at screen
 *   BOOT     — Lenovo boot logo, loading bar
 *   HACK     — Green matrix rain, hacking text, computing visuals
 *   FLASH    — Screen flashes and goes black for dramatic tension
 *   BIO      — Big texts appear one by one, each fading in/out:
 *              "Hi" → "Hi, myself Shivansh Srivastava" → role, hobbies, etc
 *   PULLBACK — Camera slowly moves back to neutral position
 *   DONE     — Ready for next section, visual cue to scroll
 */

const ROOM_Z = -15;
const DESK_Z = -4.5;  // desk position within room (local)

let roomGroup;
let screenMesh, screenTexture;
let screenCanvas, screenCtx;
let deskLamp;
let kbLights = [];
let matrixColumns = [];

// ── Phase state ──
let phase = 'IDLE';  // Current phase
let phaseTimer = 0;
let onCompleteCallback = null;

// ── Camera positions (world Z) ──
const CAM_START = { x: 0, y: 1.6, z: ROOM_Z + 6 };     // entering room
const CAM_NEAR = { x: 0, y: 1.2, z: ROOM_Z - 3.5 };   // close to laptop
const CAM_NEUTRAL = { x: 0, y: 1.5, z: ROOM_Z + 3 };     // pulled back

// Camera approach progress (0→1, scroll-driven)
let approachProgress = 0;
// Camera transition progress for auto-move phases
let autoMoveProgress = 0;

// ── Bio sequence ──
const BIO_LINES = [
    { text: 'Hi', duration: 2.0 },
    { text: '', duration: 0.5 },
    { text: "Hi, myself Shivansh Srivastava", duration: 3.0 },
    { text: '', duration: 0.5 },
    { text: 'I am a Software Developer', duration: 3.0 },
    { text: '', duration: 0.5 },
    { text: 'I love building interactive\ndigital experiences', duration: 3.5 },
    { text: '', duration: 0.5 },
    { text: 'Passionate about Web Development,\n3D Graphics & Creative Coding', duration: 3.5 },
    { text: '', duration: 0.5 },
    { text: 'Skills: JavaScript, React,\nThree.js, Node.js, Python, C++', duration: 3.5 },
    { text: '', duration: 0.5 },
    { text: 'Always learning.\nAlways shipping. 🚀', duration: 3.0 },
];
let bioIndex = 0;
let bioFadeState = 'IN';  // IN, HOLD, OUT
let bioFadeTimer = 0;

// ── Scroll hint element ──
let nextHint = null;

// ── Idle screen flicker ──
let flickerTimer = 0;

function createDesk() {
    roomGroup = new THREE.Group();
    roomGroup.position.set(0, 0, ROOM_Z);

    // ═══════════════════════════════
    //  ROOM — dark but VISIBLE
    // ═══════════════════════════════
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x0e0e1a, roughness: 0.9, metalness: 0.1, side: THREE.DoubleSide
    });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.85, metalness: 0.15 });

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat);
    floor.rotation.x = -Math.PI / 2;
    roomGroup.add(floor);

    // Walls
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), wallMat);
    backWall.position.set(0, 2.5, -6);
    backWall.name = 'backWall';
    roomGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), wallMat);
    leftWall.position.set(-6, 2.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    roomGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), wallMat);
    rightWall.position.set(6, 2.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    roomGroup.add(rightWall);

    // ═══════════════════════════════
    //  NEON CEILING
    // ═══════════════════════════════
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x080810, roughness: 0.95 });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), ceilMat);
    ceiling.position.y = 5;
    ceiling.rotation.x = Math.PI / 2;
    roomGroup.add(ceiling);

    const neonColors = [0x00ff88, 0x00ccff, 0xff00aa, 0x00ff88];
    for (let i = 0; i < 4; i++) {
        const strip = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.02, 0.08),
            new THREE.MeshBasicMaterial({ color: neonColors[i], transparent: true, opacity: 0.8 })
        );
        strip.position.set(0, 4.98, -4 + i * 2.5);
        roomGroup.add(strip);
        const glow = new THREE.PointLight(neonColors[i], 0.6, 6);
        glow.position.set(0, 4.8, -4 + i * 2.5);
        roomGroup.add(glow);
    }

    // Edge neon strips
    const en = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.4 });
    addStrip(-5.98, 0.02, 0, 0.02, 0.02, 10, en);
    addStrip(5.98, 0.02, 0, 0.02, 0.02, 10, en);
    addStrip(0, 0.02, -5.98, 10, 0.02, 0.02, en);

    // ═══════════════════════════════
    //  DESK
    // ═══════════════════════════════
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x1a1018, roughness: 0.6, metalness: 0.2 });
    const dW = 2.4, dD = 1, dH = 0.06, dY = 0.75;

    const desktop = new THREE.Mesh(new THREE.BoxGeometry(dW, dH, dD), deskMat);
    desktop.position.set(0, dY, DESK_Z);
    roomGroup.add(desktop);

    const legMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.7 });
    const legGeo = new THREE.BoxGeometry(0.06, dY, 0.06);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(sx * (dW / 2 - 0.1), dY / 2, DESK_Z + sz * (dD / 2 - 0.1));
        roomGroup.add(leg);
    });

    // ═══════════════════════════════
    //  LAPTOP with RGB KEYBOARD
    // ═══════════════════════════════
    const laptopMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.8 });
    const bW = 0.8, bD = 0.55, bH = 0.02;

    const base = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), laptopMat);
    base.position.set(0, dY + dH / 2 + bH / 2, DESK_Z);
    roomGroup.add(base);

    // RGB Keys
    const rows = 5, cols = 12, kW = 0.05, kD = 0.04, kGap = 0.01;
    const kStartX = -(cols * (kW + kGap)) / 2 + kW / 2;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const hue = ((r * cols + c) / (rows * cols)) * 360;
            const km = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(hue / 360, 1, 0.5),
                transparent: true, opacity: 0.7
            });
            const key = new THREE.Mesh(new THREE.BoxGeometry(kW, 0.005, kD), km);
            key.position.set(
                kStartX + c * (kW + kGap),
                dY + dH / 2 + bH + 0.003,
                DESK_Z - bD * 0.25 + r * (kD + kGap)
            );
            key.userData.baseHue = hue;
            kbLights.push(key);
            roomGroup.add(key);
        }
    }

    // RGB underglow
    const rgbGlow = new THREE.PointLight(0xff00ff, 0.4, 1.5);
    rgbGlow.position.set(0, dY + 0.02, DESK_Z);
    rgbGlow.userData.isRGB = true;
    roomGroup.add(rgbGlow);

    // Screen pivot + lid
    const sW = 0.78, sH = 0.5;
    const pivot = new THREE.Group();
    pivot.position.set(0, dY + dH / 2 + bH, DESK_Z - bD / 2 + 0.02);

    const lid = new THREE.Mesh(
        new THREE.BoxGeometry(sW + 0.04, sH + 0.04, 0.01), laptopMat
    );
    lid.position.set(0, sH / 2, -0.005);
    pivot.add(lid);

    // Screen canvas
    screenCanvas = document.createElement('canvas');
    screenCanvas.width = 640;
    screenCanvas.height = 400;
    screenCtx = screenCanvas.getContext('2d');
    drawIdleScreen(0);

    screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;

    screenMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(sW, sH),
        new THREE.MeshBasicMaterial({ map: screenTexture })
    );
    screenMesh.position.set(0, sH / 2, 0.001);
    pivot.add(screenMesh);

    pivot.rotation.x = -0.35;
    roomGroup.add(pivot);

    // ═══════════════════════════════
    //  CHAIR
    // ═══════════════════════════════
    const cm = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.5, metalness: 0.5 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), cm);
    seat.position.set(0, 0.45, -3.7); roomGroup.add(seat);
    const sb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.04), cm);
    sb.position.set(0, 0.75, -3.95); roomGroup.add(sb);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35), cm);
    pole.position.set(0, 0.25, -3.7); roomGroup.add(pole);
    for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 / 5) * i;
        const cl = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.3), cm);
        cl.position.set(Math.sin(a) * 0.15, 0.05, -3.7 + Math.cos(a) * 0.15);
        cl.rotation.y = a; roomGroup.add(cl);
    }

    // ═══════════════════════════════
    //  DESK LAMP
    // ═══════════════════════════════
    const lm = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.8 });
    const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.03), lm);
    lb.position.set(-0.9, dY + dH / 2 + 0.015, DESK_Z); roomGroup.add(lb);
    const la = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5), lm);
    la.position.set(-0.9, dY + dH / 2 + 0.28, DESK_Z); roomGroup.add(la);
    const sm = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.5, emissive: 0x00ff88, emissiveIntensity: 0.4 });
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.1, 8, 1, true), sm);
    shade.position.set(-0.9, dY + dH / 2 + 0.55, DESK_Z); shade.rotation.x = Math.PI; roomGroup.add(shade);
    deskLamp = new THREE.PointLight(0x00ff88, 2, 3);
    deskLamp.position.set(-0.9, dY + dH / 2 + 0.5, DESK_Z); roomGroup.add(deskLamp);

    // ═══════════════════════════════
    //  COFFEE MUG
    // ═══════════════════════════════
    const mm = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4, metalness: 0.1 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 12), mm);
    mug.position.set(0.85, dY + dH / 2 + 0.045, DESK_Z + 0.2); roomGroup.add(mug);
    const mh = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 8, 12, Math.PI), mm);
    mh.position.set(0.89, dY + dH / 2 + 0.045, DESK_Z + 0.2); mh.rotation.y = Math.PI / 2; roomGroup.add(mh);

    // Room lighting
    const cl = new THREE.PointLight(0x221133, 1, 10);
    cl.position.set(0, 4.5, 0); roomGroup.add(cl);

    // Matrix columns
    for (let i = 0; i < 40; i++) {
        matrixColumns.push({ x: Math.floor(Math.random() * 50), y: Math.floor(Math.random() * 25), speed: 1 + Math.random() * 3 });
    }

    return roomGroup;
}

function addStrip(x, y, z, w, h, d, mat) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    s.position.set(x, y, z); roomGroup.add(s);
}

// ══════════════════════════════
//  SCREEN DRAWING FUNCTIONS
// ══════════════════════════════

function drawIdleScreen(time) {
    const w = 640, h = 400;
    screenCtx.fillStyle = '#050508';
    screenCtx.fillRect(0, 0, w, h);
    // Subtle scanlines
    for (let y = 0; y < h; y += 4) {
        screenCtx.fillStyle = `rgba(0,255,136,${0.01 + Math.sin(time * 2 + y * 0.1) * 0.005})`;
        screenCtx.fillRect(0, y, w, 1);
    }
    // Faint glow in center
    const flicker = 0.03 + Math.sin(time * 3) * 0.015;
    screenCtx.fillStyle = `rgba(0,255,136,${flicker})`;
    screenCtx.fillRect(w / 2 - 60, h / 2 - 20, 120, 40);
    // Blinking underscore
    if (Math.floor(time * 2) % 2 === 0) {
        screenCtx.fillStyle = 'rgba(0,255,136,0.3)';
        screenCtx.font = '14px monospace';
        screenCtx.fillText('_', w / 2 - 4, h / 2 + 5);
    }
}

function drawBootScreen(progress) {
    const w = 640, h = 400;
    screenCtx.fillStyle = '#000000';
    screenCtx.fillRect(0, 0, w, h);
    screenCtx.font = 'bold 48px Arial, sans-serif';
    screenCtx.textAlign = 'center';
    screenCtx.fillStyle = '#cc0000';
    screenCtx.fillText('LENOVO', w / 2, h / 2 - 20);
    screenCtx.strokeStyle = '#333';
    screenCtx.lineWidth = 2;
    screenCtx.strokeRect(w / 2 - 80, h / 2 + 20, 160, 12);
    screenCtx.fillStyle = '#cc0000';
    screenCtx.fillRect(w / 2 - 78, h / 2 + 22, 156 * progress, 8);
    screenCtx.font = '11px monospace';
    screenCtx.fillStyle = '#555';
    screenCtx.fillText('Press F2 for BIOS Setup', w / 2, h - 30);
    screenCtx.textAlign = 'left';
}

function drawHackScreen() {
    screenCtx.fillStyle = 'rgba(0,0,0,0.15)';
    screenCtx.fillRect(0, 0, 640, 400);
    screenCtx.font = '12px monospace';
    matrixColumns.forEach(col => {
        col.y += col.speed * 0.5;
        if (col.y > 30) { col.y = 0; col.x = Math.floor(Math.random() * 50); }
        const ch = String.fromCharCode(0x30A0 + Math.random() * 96);
        const b = Math.random();
        screenCtx.fillStyle = `rgba(0,${Math.floor(180 + b * 75)},${Math.floor(b * 50)},${0.5 + b * 0.5})`;
        screenCtx.fillText(ch, col.x * 13, col.y * 14);
    });
    if (Math.random() > 0.8) {
        const texts = ['ACCESS GRANTED', 'DECRYPTING...', 'BYPASSING FIREWALL', 'ROOT@SYSTEM:~#',
            'LOADING KERNEL...', 'SSH CONNECTED', 'BUFFER OVERFLOW', 'SCANNING PORTS...',
            '0xDEADBEEF', 'chmod 777', 'BREACH DETECTED', 'PROXY CHAIN ACTIVE', 'ENCRYPTING...'];
        screenCtx.fillStyle = `rgb(0,${150 + Math.floor(Math.random() * 105)},0)`;
        screenCtx.font = `${10 + Math.floor(Math.random() * 6)}px monospace`;
        screenCtx.fillText(texts[Math.floor(Math.random() * texts.length)], Math.random() * 500, Math.random() * 380);
    }
}

function drawBlackScreen() {
    screenCtx.fillStyle = '#000000';
    screenCtx.fillRect(0, 0, 640, 400);
}

function drawBigText(text, alpha) {
    const w = 640, h = 400;
    screenCtx.fillStyle = '#050508';
    screenCtx.fillRect(0, 0, w, h);

    const lines = text.split('\n');
    const fontSize = lines.length > 1 ? 22 : (text.length > 25 ? 20 : 36);
    screenCtx.font = `bold ${fontSize}px 'Courier New', monospace`;
    screenCtx.textAlign = 'center';
    screenCtx.textBaseline = 'middle';
    screenCtx.fillStyle = `rgba(0,255,136,${alpha})`;
    screenCtx.shadowColor = `rgba(0,255,136,${alpha * 0.5})`;
    screenCtx.shadowBlur = 20;

    const lineH = fontSize * 1.4;
    const startY = h / 2 - (lines.length - 1) * lineH / 2;
    lines.forEach((line, i) => {
        screenCtx.fillText(line, w / 2, startY + i * lineH);
    });

    screenCtx.shadowBlur = 0;
    screenCtx.textAlign = 'left';
    screenCtx.textBaseline = 'alphabetic';
}

// ══════════════════════════════
//  UPDATE — called every frame
// ══════════════════════════════
function updateDesk(delta, camera, scrollProgress) {
    if (!roomGroup) return;
    const time = performance.now() * 0.001;

    // ── RGB Keyboard wave ──
    kbLights.forEach(key => {
        const hue = (key.userData.baseHue + time * 60) % 360;
        key.material.color.setHSL(hue / 360, 1, 0.45);
        key.material.opacity = 0.5 + Math.sin(time * 3 + key.userData.baseHue * 0.01) * 0.3;
    });

    // RGB underglow cycle
    roomGroup.children.forEach(child => {
        if (child.userData && child.userData.isRGB) {
            child.color.setHSL((time * 40 % 360) / 360, 1, 0.5);
        }
    });

    // Desk lamp pulse
    if (deskLamp) deskLamp.intensity = 2 + Math.sin(time * 2) * 0.3;

    phaseTimer += delta;

    switch (phase) {
        // ─────────────────────────────
        //  IDLE: Camera at entrance, laptop dark with glow
        // ─────────────────────────────
        case 'IDLE':
            camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
            camera.rotation.set(0, 0, 0);
            drawIdleScreen(time);
            // Auto-transition to APPROACH after a brief pause
            if (phaseTimer > 0.5) {
                phase = 'APPROACH';
                phaseTimer = 0;
                approachProgress = 0;
            }
            break;

        // ─────────────────────────────
        //  APPROACH: Scroll drives camera toward laptop
        // ─────────────────────────────
        case 'APPROACH': {
            // Use scroll to drive approach (0→1)
            approachProgress += delta * 0.3;  // auto approach ~3.5 seconds
            approachProgress = Math.min(1, approachProgress);
            const t = easeInOutCubic(approachProgress);

            camera.position.x = lerp(CAM_START.x, CAM_NEAR.x, t);
            camera.position.y = lerp(CAM_START.y, CAM_NEAR.y, t);
            camera.position.z = lerp(CAM_START.z, CAM_NEAR.z, t);
            // Tilt down to look at screen
            camera.rotation.x = lerp(0, -0.3, t);

            drawIdleScreen(time);

            if (approachProgress >= 1) {
                phase = 'BOOT';
                phaseTimer = 0;
            }
            break;
        }

        // ─────────────────────────────
        //  BOOT: Lenovo boot logo
        // ─────────────────────────────
        case 'BOOT': {
            const dur = 3;
            drawBootScreen(Math.min(1, phaseTimer / dur));
            if (phaseTimer > dur + 0.5) {
                phase = 'HACK';
                phaseTimer = 0;
            }
            break;
        }

        // ─────────────────────────────
        //  HACK: Matrix rain + hacking text
        // ─────────────────────────────
        case 'HACK':
            drawHackScreen();
            if (phaseTimer > 4) {
                phase = 'FLASH';
                phaseTimer = 0;
            }
            break;

        // ─────────────────────────────
        //  FLASH: Screen flashes white then goes black
        // ─────────────────────────────
        case 'FLASH':
            if (phaseTimer < 0.15) {
                // White flash
                screenCtx.fillStyle = '#ffffff';
                screenCtx.fillRect(0, 0, 640, 400);
            } else {
                drawBlackScreen();
            }
            if (phaseTimer > 1.0) {
                phase = 'BIO';
                phaseTimer = 0;
                bioIndex = 0;
                bioFadeState = 'IN';
                bioFadeTimer = 0;
            }
            break;

        // ─────────────────────────────
        //  BIO: Big texts appear one by one
        // ─────────────────────────────
        case 'BIO': {
            if (bioIndex >= BIO_LINES.length) {
                phase = 'PULLBACK';
                phaseTimer = 0;
                autoMoveProgress = 0;
                break;
            }

            const line = BIO_LINES[bioIndex];
            bioFadeTimer += delta;

            // Empty lines = pause
            if (line.text === '') {
                drawBlackScreen();
                if (bioFadeTimer > line.duration) {
                    bioIndex++;
                    bioFadeTimer = 0;
                    bioFadeState = 'IN';
                }
                break;
            }

            const fadeInTime = 0.6;
            const fadeOutTime = 0.6;
            const holdTime = line.duration - fadeInTime - fadeOutTime;
            let alpha = 1;

            if (bioFadeState === 'IN') {
                alpha = Math.min(1, bioFadeTimer / fadeInTime);
                if (bioFadeTimer >= fadeInTime) {
                    bioFadeState = 'HOLD';
                    bioFadeTimer = 0;
                }
            } else if (bioFadeState === 'HOLD') {
                alpha = 1;
                if (bioFadeTimer >= holdTime) {
                    bioFadeState = 'OUT';
                    bioFadeTimer = 0;
                }
            } else if (bioFadeState === 'OUT') {
                alpha = Math.max(0, 1 - bioFadeTimer / fadeOutTime);
                if (bioFadeTimer >= fadeOutTime) {
                    bioIndex++;
                    bioFadeTimer = 0;
                    bioFadeState = 'IN';
                }
            }

            drawBigText(line.text, alpha);
            break;
        }

        // ─────────────────────────────
        //  PULLBACK: Camera moves back to neutral
        // ─────────────────────────────
        case 'PULLBACK': {
            autoMoveProgress += delta * 0.4;  // ~2.5 second pullback
            autoMoveProgress = Math.min(1, autoMoveProgress);
            const t = easeInOutCubic(autoMoveProgress);

            camera.position.x = lerp(CAM_NEAR.x, CAM_NEUTRAL.x, t);
            camera.position.y = lerp(CAM_NEAR.y, CAM_NEUTRAL.y, t);
            camera.position.z = lerp(CAM_NEAR.z, CAM_NEUTRAL.z, t);
            camera.rotation.x = lerp(-0.3, 0, t);

            // Screen shows calm state
            drawIdleScreen(time);

            if (autoMoveProgress >= 1) {
                phase = 'DONE';
                phaseTimer = 0;
                showNextHint();
                if (onCompleteCallback) onCompleteCallback();
            }
            break;
        }

        // ─────────────────────────────
        //  DONE: Calm, ready for next section
        // ─────────────────────────────
        case 'DONE':
            drawIdleScreen(time);
            break;
    }

    // Update screen texture
    if (screenTexture) screenTexture.needsUpdate = true;
}

// ══════════════════════════════
//  HELPERS
// ══════════════════════════════
function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function showNextHint() {
    nextHint = document.createElement('div');
    nextHint.innerHTML = '⟡ Scroll to continue ⟡';
    nextHint.style.cssText = `
    position: fixed; bottom: 40px; left: 50%;
    transform: translateX(-50%);
    color: #00ff88; font-family: 'Courier New', monospace;
    font-size: 14px; letter-spacing: 4px; text-transform: uppercase;
    opacity: 0; pointer-events: none; z-index: 10;
    text-shadow: 0 0 10px rgba(0,255,136,0.5);
    transition: opacity 1s ease;
    animation: nextPulse 2s ease-in-out infinite;
  `;
    const style = document.createElement('style');
    style.textContent = `@keyframes nextPulse{0%,100%{opacity:0.4;}50%{opacity:1;}}`;
    document.head.appendChild(style);
    document.body.appendChild(nextHint);
    setTimeout(() => { nextHint.style.opacity = '1'; }, 100);
}

function onDeskComplete(cb) { onCompleteCallback = cb; }
function isDeskDone() { return phase === 'DONE'; }
function getRoomZ() { return ROOM_Z; }
function getPhase() { return phase; }

export { createDesk, updateDesk, getRoomZ, onDeskComplete, isDeskDone, getPhase };
