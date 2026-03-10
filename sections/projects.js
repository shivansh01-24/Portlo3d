import * as THREE from 'three';

/**
 * Projects Section — "Command Deck" Cover Flow
 * Cards on a flat X-rail. Center card always perfectly face-forward.
 * Scroll one step at a time. Click center = zoom in. Click again = open URL.
 */

const SECTION_Z  = -32;
const SECTION_Y  = -2.5;
const CARD_W     = 2.5;
const CARD_H     = 1.7;
const CARD_GAP   = 3.4;   // X spacing between cards
const TILT_MAX   = 1.15;  // max rotation.y (radians) for side cards — ~66°

let vaultGroup;
let cardMeshes = [];
let cardData   = [];
let onCompleteCallback = null;
let sectionDone = false;
let initialized = false;
let entryAnim   = 0;
let cameraRef   = null;

// ── Cover-flow state ──
let cflowOffset = 0;      // smooth fractional current center (0..n-1)
let cflowTarget = 0;      // integer snap target
let lastScrollTime = 0;
const SCROLL_COOLDOWN = 0.45; // seconds between steps

// ── Focus / zoom state ──
let focusedCardIdx = null;
let focusZoom      = 0;
let focusExiting   = false;

// ── Hint ──
let bottomHint = null;
let hintPhase  = 'scroll';

// ─────────────────────────────────────────────────────────────────────────────
//  CREATE
// ─────────────────────────────────────────────────────────────────────────────
async function createProjects(camera, rendererDom) {
    cameraRef  = camera;
    vaultGroup = new THREE.Group();
    vaultGroup.position.set(0, SECTION_Y, SECTION_Z);

    // ── Load data ──
    try {
        const resp = await fetch('./data/projects.json');
        const json = await resp.json();
        cardData = json.projects || [];
    } catch {
        cardData = [{ title: 'Project', description: 'A cool project.', tech: ['JS'], link: null, github: null, demo: null }];
    }

    // ════════════════════════════════════════
    //  ENVIRONMENT
    // ════════════════════════════════════════

    // ── Dark floor ──
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x040410, roughness: 0.2, metalness: 0.9 });
    const floor    = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.4;
    vaultGroup.add(floor);

    // ── Neon grid overlay on floor ──
    const gc = document.createElement('canvas');
    gc.width = gc.height = 512;
    const gx = gc.getContext('2d');
    gx.fillStyle = '#000';
    gx.fillRect(0, 0, 512, 512);
    gx.strokeStyle = 'rgba(80,0,255,0.55)';
    gx.lineWidth = 1;
    for (let v = 0; v <= 512; v += 32) {
        gx.beginPath(); gx.moveTo(v, 0); gx.lineTo(v, 512); gx.stroke();
        gx.beginPath(); gx.moveTo(0, v); gx.lineTo(512, v); gx.stroke();
    }
    const gridTex  = new THREE.CanvasTexture(gc);
    gridTex.wrapS  = gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.repeat.set(8, 5);
    const gridMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 20),
        new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false })
    );
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -1.39;
    vaultGroup.add(gridMesh);

    // ── Back wall — animated hex canvas ──
    const wc = document.createElement('canvas');
    wc.width = 1024; wc.height = 512;
    const wx = wc.getContext('2d');
    wx.fillStyle = '#010110';
    wx.fillRect(0, 0, 1024, 512);
    const hexR = 28, hexH = hexR * Math.sqrt(3);
    for (let row = -1; row < 20; row++) {
        for (let col = -1; col < 42; col++) {
            const cx = col * hexR * 1.5 + (row & 1) * hexR * 0.75;
            const cy = row * hexH * 0.5;
            wx.beginPath();
            for (let k = 0; k < 6; k++) {
                const ang = Math.PI / 6 + k * Math.PI / 3;
                const hx = cx + hexR * 0.88 * Math.cos(ang);
                const hy = cy + hexR * 0.88 * Math.sin(ang);
                k === 0 ? wx.moveTo(hx, hy) : wx.lineTo(hx, hy);
            }
            wx.closePath();
            const alpha = 0.15 + Math.random() * 0.2;
            wx.strokeStyle = `rgba(60,0,200,${alpha.toFixed(2)})`;
            wx.lineWidth = 0.7;
            wx.stroke();
        }
    }
    const wallTex  = new THREE.CanvasTexture(wc);
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(36, 10),
        new THREE.MeshBasicMaterial({ map: wallTex, transparent: true, opacity: 0.75,
            blending: THREE.AdditiveBlending })
    );
    backWall.position.set(0, 2.5, -7);
    vaultGroup.add(backWall);

    // ── Ceiling glow strip ──
    const strip = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.06, 0.4),
        new THREE.MeshBasicMaterial({ color: 0x3311ff, transparent: true, opacity: 0.7 })
    );
    strip.position.set(0, 5, 0);
    vaultGroup.add(strip);

    // ── Lighting ──
    const topLight = new THREE.PointLight(0x3311ff, 4, 16);
    topLight.position.set(0, 5, 0);
    topLight.userData.isPulse = true;
    vaultGroup.add(topLight);

    const ambLight = new THREE.AmbientLight(0x110033, 1);
    vaultGroup.add(ambLight);

    [-10, 10].forEach((x, si) => {
        const sl = new THREE.PointLight(0x5522bb, 1.5, 10);
        sl.position.set(x, 3, 0);
        sl.userData.isSide = true;
        sl.userData.si = si;
        vaultGroup.add(sl);
    });

    // ════════════════════════════════════════
    //  CARDS  (placed in vaultGroup, not a rotating carousel)
    // ════════════════════════════════════════
    const n = cardData.length;
    cardData.forEach((proj, i) => {
        const hue   = i / Math.max(n, 1);
        const color = new THREE.Color().setHSL(hue, 0.9, 0.60);

        const cardGroup = new THREE.Group();
        // X position set each frame; Y and Z static
        cardGroup.position.set(0, 1.2, 0);

        // ── Glass back panel ──
        const bgMat = new THREE.MeshPhysicalMaterial({
            color: 0x060618, roughness: 0.05, metalness: 0.75,
            transparent: true, opacity: 0.92,
            emissive: new THREE.Color().setHSL(hue, 0.6, 0.05), emissiveIntensity: 1,
            clearcoat: 1, clearcoatRoughness: 0.08,
        });
        cardGroup.add(new THREE.Mesh(new THREE.BoxGeometry(CARD_W, CARD_H, 0.05), bgMat));

        // ── Neon border ──
        const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(CARD_W + 0.03, CARD_H + 0.03, 0.06));
        cardGroup.add(new THREE.LineSegments(borderGeo,
            new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 })));

        // ── Top accent bar ──
        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(CARD_W - 0.12, 0.03, 0.06),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.65 })
        );
        bar.position.set(0, CARD_H / 2 - 0.06, 0.03);
        cardGroup.add(bar);

        // ── Content canvas ──
        const cvs = document.createElement('canvas');
        cvs.width = 540; cvs.height = 360;
        drawProjectCard(cvs.getContext('2d'), proj, i, 540, 360, color);
        const tex = new THREE.CanvasTexture(cvs);
        tex.anisotropy = 4;
        const face = new THREE.Mesh(
            new THREE.PlaneGeometry(CARD_W - 0.07, CARD_H - 0.07),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );
        face.position.z = 0.028;
        cardGroup.add(face);

        // ── Card glow light ──
        const glow = new THREE.PointLight(color.getHex(), 0, 3.5);
        glow.position.z = 1;
        glow.userData.isCardGlow = true;
        cardGroup.add(glow);

        cardGroup.userData = { index: i, proj, color };
        vaultGroup.add(cardGroup);
        cardMeshes.push(cardGroup);
    });

    // ════════════════════════════════════════
    //  BOTTOM HINT
    // ════════════════════════════════════════
    if (!document.getElementById('vault-blink-style')) {
        const st = document.createElement('style');
        st.id = 'vault-blink-style';
        st.textContent = `
            @keyframes vaultBlink { 0%,100%{ opacity:1; } 50%{ opacity:0.3; } }
            @keyframes vaultPulse { 0%,100%{ border-color:rgba(130,70,255,0.22); }
                                    50%{     border-color:rgba(170,100,255,0.7); } }
            #vault-hint { animation: vaultBlink 1.8s ease-in-out infinite,
                                     vaultPulse 1.8s ease-in-out infinite; }
        `;
        document.head.appendChild(st);
    }
    bottomHint = document.createElement('div');
    bottomHint.id = 'vault-hint';
    bottomHint.style.cssText = `
        position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
        color:#cc88ff; font-family:'Courier New',monospace; font-size:12px;
        letter-spacing:3px; text-transform:uppercase;
        background:rgba(2,0,10,0.7); backdrop-filter:blur(10px);
        padding:9px 28px 8px; border:1px solid rgba(130,70,255,0.22);
        border-radius:20px; pointer-events:none; z-index:50;
        opacity:0; transition:opacity 1s ease;
        text-shadow:0 0 14px rgba(180,100,255,0.7);
    `;
    document.body.appendChild(bottomHint);
    setTimeout(() => { bottomHint.style.opacity = '1'; }, 800);
    setHint('scroll');

    // ════════════════════════════════════════
    //  EVENT LISTENERS
    // ════════════════════════════════════════
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2(-9999, -9999);

    if (rendererDom) {
        rendererDom.addEventListener('mousemove', (e) => {
            mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight)  * 2 + 1;
            if (!cameraRef) return;
            raycaster.setFromCamera(mouse, cameraRef);
            const tgts = [];
            cardMeshes.forEach(cg => cg.children.forEach(c => { if (c.isMesh) tgts.push(c); }));
            const hits = raycaster.intersectObjects(tgts, false);
            rendererDom.style.cursor = hits.length ? 'pointer' : 'default';
        });

        rendererDom.addEventListener('click', () => {
            if (!cameraRef) return;
            raycaster.setFromCamera(mouse, cameraRef);
            const tgts = [];
            cardMeshes.forEach(cg => cg.children.forEach(c => { if (c.isMesh) tgts.push(c); }));
            const hits = raycaster.intersectObjects(tgts, false);
            if (!hits.length) return;

            let hitIdx = null;
            cardMeshes.forEach((cg, i) => { if (cg.children.includes(hits[0].object)) hitIdx = i; });
            if (hitIdx === null) return;

            if (focusedCardIdx !== null) {
                // Already zoomed — open URL
                const p = cardMeshes[focusedCardIdx]?.userData?.proj;
                if (p) {
                    if      (p.demo)   window.open(p.demo,   '_blank');
                    else if (p.link)   window.open(p.link,   '_blank');
                    else if (p.github) window.open(p.github, '_blank');
                }
                return;
            }

            const centreIdx = Math.round(cflowOffset);
            if (hitIdx !== centreIdx) {
                // Bring clicked card to centre
                cflowTarget = hitIdx;
            } else {
                // Zoom in on centre card
                focusedCardIdx = hitIdx;
                focusZoom      = 0;
                focusExiting   = false;
                setHint('focused');
                rendererDom.style.cursor = 'pointer';
            }
        });

        window.addEventListener('wheel', (e) => {
            if (focusedCardIdx !== null) { exitFocus(rendererDom); return; }
            const now = performance.now() * 0.001;
            if (now - lastScrollTime < SCROLL_COOLDOWN) return;
            lastScrollTime = now;
            cflowTarget = Math.max(0, Math.min(cardData.length - 1,
                cflowTarget + (e.deltaY > 0 ? 1 : -1)));
        }, { passive: true });
    }

    initialized = true;
    return vaultGroup;
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function setHint(mode) {
    if (!bottomHint) return;
    hintPhase = mode;
    if (mode === 'scroll')  bottomHint.innerHTML = '&#x2193;&nbsp; Scroll to Browse &nbsp;&#x2193;';
    if (mode === 'browse')  bottomHint.innerHTML = '&#x2190; Scroll &nbsp;|&nbsp; Click Centre Card to Inspect &#x2192;';
    if (mode === 'focused') bottomHint.innerHTML = '&#x2191; Click to Open Project &nbsp;|&nbsp; Scroll to Go Back';
}

function exitFocus(dom) {
    focusExiting = true;
    if (dom) dom.style.cursor = 'default';
    setHint('browse');
}

function drawProjectCard(ctx, proj, index, w, h, color) {
    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0b0b1e');
    bg.addColorStop(1, '#070710');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = `rgba(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)},0.06)`;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 22) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    const hex = '#' + color.getHexString();

    // Top accent line
    const ac = ctx.createLinearGradient(20, 0, w - 20, 0);
    ac.addColorStop(0, 'transparent');
    ac.addColorStop(0.4, hex);
    ac.addColorStop(0.6, hex);
    ac.addColorStop(1, 'transparent');
    ctx.fillStyle = ac;
    ctx.fillRect(20, 18, w - 40, 2);

    // Card number
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = hex + '88';
    ctx.fillText('#' + String(index + 1).padStart(2, '0'), w - 18, 36);

    // Title
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'left';
    ctx.shadowColor = hex;
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(proj.title || 'Project', 22, 64);
    ctx.shadowBlur = 0;

    // Description
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(180,180,210,0.85)';
    wrapText(ctx, proj.description || '', 22, 92, w - 44, 19);

    // Tech tags
    if (proj.tech && proj.tech.length) {
        let tx = 22;
        proj.tech.slice(0, 5).forEach(t => {
            const tw = ctx.measureText(t).width + 18;
            roundRect(ctx, tx, h - 80, tw, 22, 5);
            ctx.fillStyle = hex + '22';
            ctx.fill();
            ctx.strokeStyle = hex + '88';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = hex;
            ctx.textAlign = 'center';
            ctx.fillText(t, tx + tw / 2, h - 65);
            tx += tw + 8;
        });
    }

    // Links
    ctx.textAlign = 'left';
    let ly = h - 48;
    [
        { val: proj.demo,   icon: '▶', col: '#00ff88' },
        { val: proj.link,   icon: '🌐', col: '#00aaff' },
        { val: proj.github, icon: '⌥', col: '#aaaaaa' },
    ].forEach(({ val, icon, col }) => {
        if (!val) return;
        ctx.font = '10px monospace';
        ctx.fillStyle = col;
        ctx.fillText(icon + ' ' + val, 22, ly);
        ly += 14;
    });

    // Bottom line
    ctx.fillStyle = hex + '33';
    ctx.fillRect(20, h - 7, w - 40, 1);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '', ly = y;
    for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line.trim(), x, ly);
            line = word + ' '; ly += lineH;
            if (ly > 200) break;
        } else line = test;
    }
    if (line) ctx.fillText(line.trim(), x, ly);
}

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE
// ─────────────────────────────────────────────────────────────────────────────
function updateProjects(delta, camera, scrollProgress) {
    if (!vaultGroup || !initialized) return;
    const time = performance.now() * 0.001;
    const n    = cardMeshes.length;

    // Entry fade-in
    const wasComplete = entryAnim >= 1;
    entryAnim = Math.min(1, entryAnim + delta * 0.45);
    const entry = 1 - Math.pow(1 - entryAnim, 3);
    if (!wasComplete && entryAnim >= 1 && hintPhase === 'scroll') setHint('browse');

    // ── Focus zoom ──
    const zoomTgt = (focusedCardIdx !== null && !focusExiting) ? 1 : 0;
    focusZoom    += (zoomTgt - focusZoom) * Math.min(1, delta * 3.5);
    if (focusExiting && focusZoom < 0.01) {
        focusedCardIdx = null;
        focusExiting   = false;
    }

    // ── Cover-flow offset ──
    cflowOffset += (cflowTarget - cflowOffset) * Math.min(1, delta * 5.5);

    // ── Camera ──
    if (focusedCardIdx !== null || focusExiting) {
        const cg = cardMeshes[focusedCardIdx ?? cflowTarget];
        const wpX  = cg.position.x;
        const wpY  = SECTION_Y + 2.4;
        const camZ = SECTION_Z + 3 - focusZoom * 1.5;
        camera.position.x += (wpX  - camera.position.x) * 0.08;
        camera.position.y += (wpY  - camera.position.y) * 0.08;
        camera.position.z += (camZ - camera.position.z) * 0.08;
        camera.lookAt(cg.position.x + vaultGroup.position.x,
                      cg.position.y + vaultGroup.position.y,
                      vaultGroup.position.z);
    } else {
        // Browse: camera centered, looking down the rail
        const browseY = SECTION_Y + 2.2 + (1 - entry) * 3;
        camera.position.x += (0         - camera.position.x) * 0.06;
        camera.position.y += (browseY   - camera.position.y) * 0.06;
        camera.position.z += (SECTION_Z + 3.5 - camera.position.z) * 0.06;
        camera.rotation.x += (-0.05 * (1 - entry) - camera.rotation.x) * 0.06;
        camera.rotation.y += (0 - camera.rotation.y) * 0.06;
        camera.rotation.z += (0 - camera.rotation.z) * 0.06;
    }

    // ── Per-card cover-flow positioning ──
    cardMeshes.forEach((cg, i) => {
        const dist   = i - cflowOffset;          // float distance from centre
        const absDist = Math.abs(dist);

        // X position
        const targetX = dist * CARD_GAP;
        cg.position.x += (targetX - cg.position.x) * 0.1;

        // Z depth — centre card comes slightly forward
        const targetZ = -absDist * 0.5;
        cg.position.z += (targetZ - cg.position.z) * 0.1;

        // Rotation.y — perfectly 0 at centre, tilts inward on sides
        const tiltTarget = Math.sign(dist) * Math.min(absDist * 0.75, TILT_MAX);
        cg.rotation.y += (tiltTarget - cg.rotation.y) * 0.1;

        // Subtle float (only when not focused)
        const isFocused = i === focusedCardIdx;
        if (!isFocused) {
            cg.position.y = 1.2 + Math.sin(time * 0.5 + i * 1.1) * 0.06;
        } else {
            cg.position.y += (1.2 - cg.position.y) * 0.08;
        }

        // Scale — centre = 1, sides = smaller
        const scaleTarget = entry * Math.max(0.5, 1 - absDist * 0.14);
        cg.scale.setScalar(cg.scale.x + (scaleTarget - cg.scale.x) * 0.1);

        // Glow light intensity — only bright at centre + focused
        const glowTarget = (absDist < 0.5) ? (1.2 + focusZoom * 1.5) : 0;
        cg.children.forEach(c => {
            if (c.userData.isCardGlow) c.intensity += (glowTarget - c.intensity) * 0.08;
        });
    });

    // ── Environment pulse ──
    vaultGroup.children.forEach(c => {
        if (c.userData.isPulse)  c.intensity = 3.5 + Math.sin(time * 0.6) * 1.0;
        if (c.userData.isSide)   c.intensity = 1.3 + Math.sin(time * 0.4 + c.userData.si * 1.2) * 0.4;
    });

    // Completion
    if (scrollProgress > 0.95 && !sectionDone) {
        sectionDone = true;
        if (onCompleteCallback) onCompleteCallback();
    }
}

function onProjectsComplete(cb) { onCompleteCallback = cb; }
function isProjectsDone()       { return sectionDone; }

export { createProjects, updateProjects, onProjectsComplete, isProjectsDone };
