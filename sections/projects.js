import * as THREE from 'three';

/**
 * Projects Section — "The Underground Vault"
 *
 * Premium circular gallery with floating holographic project cards.
 * Cards load from projects.json with individual links.
 * Ultra-smooth carousel rotation with momentum feel.
 */

const SECTION_Z = -32;
const SECTION_Y = -2.5;

let vaultGroup;
let cardMeshes = [];
let cardData = [];
let carousel;
let hoverOverlay = null;
let onCompleteCallback = null;
let sectionDone = false;
let carouselAngle = 0;
let initialized = false;
let entryAnim = 0;
let cameraRef = null; // stored for raycasting

async function createProjects(camera, rendererDom) {
    cameraRef = camera;
    vaultGroup = new THREE.Group();
    vaultGroup.position.set(0, SECTION_Y, SECTION_Z);

    // Load JSON
    try {
        const resp = await fetch('./data/projects.json');
        const json = await resp.json();
        cardData = json.projects || [];
    } catch (e) {
        console.warn('Could not load projects.json');
        cardData = [{ title: 'Project', description: 'A cool project', tech: ['JS'], link: null, github: null, demo: null }];
    }

    // ═══════════════════════════════
    //  UNDERGROUND CAVERN — premium look
    // ═══════════════════════════════

    // Floor — dark reflective
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x060610, roughness: 0.3, metalness: 0.8, side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    vaultGroup.add(floor);

    // Floor glow ring
    const ringGeo = new THREE.RingGeometry(3.8, 4.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1a0033, transparent: true, opacity: 0.4,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending
    });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.01;
    floorRing.userData.isFloorRing = true;
    vaultGroup.add(floorRing);

    // Ceiling dome
    const domeGeo = new THREE.SphereGeometry(8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
        color: 0x040408, roughness: 0.95, metalness: 0.1, side: THREE.BackSide
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0;
    vaultGroup.add(dome);

    // ── Atmospheric lighting ──
    const centerGlow = new THREE.PointLight(0x2211aa, 2, 14);
    centerGlow.position.set(0, 4, 0);
    vaultGroup.add(centerGlow);

    const floorLight = new THREE.PointLight(0x110033, 1.5, 8);
    floorLight.position.set(0, 0.05, 0);
    floorLight.userData.isFloorLight = true;
    vaultGroup.add(floorLight);

    // Accent spotlights pointing down at cards
    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const sp = new THREE.PointLight(0x3322aa, 0.6, 6);
        sp.position.set(Math.cos(a) * 5, 4, Math.sin(a) * 5);
        vaultGroup.add(sp);
    }

    // ── Floating particles ──
    const dustCount = 250;
    const dPos = new Float32Array(dustCount * 3);
    const dCol = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.5 + Math.random() * 7;
        dPos[i * 3] = Math.cos(a) * r;
        dPos[i * 3 + 1] = Math.random() * 5 + 0.3;
        dPos[i * 3 + 2] = Math.sin(a) * r;
        const hue = Math.random();
        const c = new THREE.Color().setHSL(0.7 + hue * 0.15, 0.6, 0.5 + Math.random() * 0.3);
        dCol[i * 3] = c.r; dCol[i * 3 + 1] = c.g; dCol[i * 3 + 2] = c.b;
    }
    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    dGeo.setAttribute('color', new THREE.BufferAttribute(dCol, 3));
    const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({
        size: 0.04, vertexColors: true, transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    dust.userData.isDust = true;
    vaultGroup.add(dust);

    // ═══════════════════════════════
    //  CAROUSEL — premium floating cards
    // ═══════════════════════════════
    carousel = new THREE.Group();
    carousel.position.y = 2;
    vaultGroup.add(carousel);

    const n = cardData.length;
    const radius = 4.2;

    cardData.forEach((proj, i) => {
        const angle = (i / n) * Math.PI * 2;
        const cardGroup = new THREE.Group();
        cardGroup.position.set(
            Math.sin(angle) * radius,
            0,
            Math.cos(angle) * radius
        );
        cardGroup.rotation.y = -angle + Math.PI;

        // Card dimensions
        const cardW = 2.4, cardH = 1.6;

        // Card back panel — dark glass
        const bgMat = new THREE.MeshPhysicalMaterial({
            color: 0x080818, roughness: 0.1, metalness: 0.6,
            transparent: true, opacity: 0.9,
            emissive: 0x0a0020, emissiveIntensity: 0.1,
            clearcoat: 0.5, clearcoatRoughness: 0.2,
        });
        const bg = new THREE.Mesh(new THREE.BoxGeometry(cardW, cardH, 0.03), bgMat);
        cardGroup.add(bg);

        // Neon border — unique hue per card
        const hue = (i / n);
        const borderColor = new THREE.Color().setHSL(hue, 0.85, 0.55);
        const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(cardW + 0.02, cardH + 0.02, 0.035));
        const border = new THREE.LineSegments(borderGeo,
            new THREE.LineBasicMaterial({ color: borderColor, transparent: true, opacity: 0.8 })
        );
        cardGroup.add(border);

        // Top accent bar
        const accentBar = new THREE.Mesh(
            new THREE.BoxGeometry(cardW - 0.2, 0.025, 0.035),
            new THREE.MeshBasicMaterial({ color: borderColor, transparent: true, opacity: 0.6 })
        );
        accentBar.position.y = cardH / 2 - 0.08;
        accentBar.position.z = 0.02;
        cardGroup.add(accentBar);

        // Card content texture
        const canvas = document.createElement('canvas');
        canvas.width = 520; canvas.height = 350;
        const ctx = canvas.getContext('2d');
        drawProjectCard(ctx, proj, i, 520, 350, borderColor);
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 4;
        const face = new THREE.Mesh(
            new THREE.PlaneGeometry(cardW - 0.06, cardH - 0.06),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );
        face.position.z = 0.02;
        cardGroup.add(face);

        // Card glow — soft colored light
        const glow = new THREE.PointLight(borderColor.getHex(), 0.4, 2.5);
        glow.position.z = 0.6;
        cardGroup.add(glow);

        // Bottom reflection glow (on floor)
        const refGlow = new THREE.PointLight(borderColor.getHex(), 0.15, 1.5);
        refGlow.position.set(0, -1.8, 0);
        cardGroup.add(refGlow);

        cardGroup.userData = { index: i, proj, borderColor, baseY: 0 };
        carousel.add(cardGroup);
        cardMeshes.push(cardGroup);
    });

    // Center pedestal — glowing crystal
    const pedGeo = new THREE.CylinderGeometry(0.6, 0.9, 0.4, 8);
    const pedMat = new THREE.MeshStandardMaterial({
        color: 0x111128, roughness: 0.3, metalness: 0.7,
        emissive: 0x110044, emissiveIntensity: 0.15
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -1.8;
    carousel.add(pedestal);

    // Crystal on pedestal
    const crystalGeo = new THREE.OctahedronGeometry(0.25);
    const crystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x6633ff, roughness: 0, metalness: 0.2,
        transparent: true, opacity: 0.7,
        emissive: 0x4422cc, emissiveIntensity: 0.5,
        clearcoat: 1,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = -1.4;
    crystal.userData.isCrystal = true;
    carousel.add(crystal);

    const crystalLight = new THREE.PointLight(0x6633ff, 1.5, 4);
    crystalLight.position.y = -1.3;
    crystalLight.userData.isCrystalLight = true;
    carousel.add(crystalLight);

    // ── Hover overlay ──
    hoverOverlay = document.createElement('div');
    hoverOverlay.id = 'project-hover';
    hoverOverlay.style.cssText = `
    position: fixed; bottom: 30px; left: 50%;
    transform: translateX(-50%);
    font-family: 'Courier New', monospace;
    pointer-events: auto; z-index: 15;
    text-align: center;
    background: linear-gradient(135deg, rgba(5,5,25,0.92), rgba(10,0,30,0.92));
    border: 1px solid rgba(100,50,255,0.25);
    border-radius: 10px;
    padding: 14px 28px;
    opacity: 0; transition: opacity 0.6s ease;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(100,50,255,0.15);
  `;
    document.body.appendChild(hoverOverlay);

    // Vault scroll hint
    const vaultHint = document.createElement('div');
    vaultHint.style.cssText = `
    position: fixed; top: 25px; left: 50%;
    transform: translateX(-50%);
    color: #8833ff; font-family: 'Courier New', monospace;
    font-size: 12px; letter-spacing: 3px; text-transform: uppercase;
    opacity: 0; pointer-events: none; z-index: 15;
    text-shadow: 0 0 12px rgba(136,51,255,0.6);
    transition: opacity 1.2s ease;
  `;
    vaultHint.textContent = '⟡ Scroll to browse projects ⟡';
    document.body.appendChild(vaultHint);
    setTimeout(() => { vaultHint.style.opacity = '1'; }, 800);
    setTimeout(() => { vaultHint.style.opacity = '0'; }, 6000);

    // ── Raycaster for precise card clicks ──
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999); // off-screen default

    // Track mouse position
    if (rendererDom) {
        rendererDom.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Click — only open link if raycast hits a card face
        rendererDom.addEventListener('click', (e) => {
            if (!cameraRef) return;
            raycaster.setFromCamera(mouse, cameraRef);
            // Collect all child meshes of all card groups
            const hitTargets = [];
            cardMeshes.forEach(cg => cg.children.forEach(c => {
                if (c.isMesh) hitTargets.push(c);
            }));
            const hits = raycaster.intersectObjects(hitTargets, false);
            if (!hits.length) return; // nothing hit — ignore click
            // Find which card was hit
            const hitObj = hits[0].object;
            let hitCard = null;
            cardMeshes.forEach(cg => {
                if (cg.children.includes(hitObj)) hitCard = cg.userData;
            });
            if (!hitCard) return;
            const p = hitCard.proj;
            if (p.demo) window.open(p.demo, '_blank');
            else if (p.link) window.open(p.link, '_blank');
            else if (p.github) window.open(p.github, '_blank');
        });
    }


    initialized = true;
    return vaultGroup;
}

function getFocusedCard() {
    if (!cardMeshes.length || !carousel) return null;
    const n = cardMeshes.length;
    const a = ((carousel.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const idx = Math.round((a / (Math.PI * 2)) * n) % n;
    return cardMeshes[idx] ? cardMeshes[idx].userData : null;
}

function drawProjectCard(ctx, proj, index, w, h, color) {
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0c0c1e');
    grad.addColorStop(0.5, '#080815');
    grad.addColorStop(1, '#0a0a12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(100,50,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // Top accent line
    const acGrad = ctx.createLinearGradient(30, 0, w - 30, 0);
    acGrad.addColorStop(0, 'transparent');
    acGrad.addColorStop(0.3, `#${color.getHexString()}`);
    acGrad.addColorStop(0.7, `#${color.getHexString()}`);
    acGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = acGrad;
    ctx.fillRect(25, 16, w - 50, 2);

    // Project number badge
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = `#${color.getHexString()}88`;
    ctx.fillText(`#${String(index + 1).padStart(2, '0')}`, w - 20, 38);

    // Title with glow
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'left';
    ctx.shadowColor = `#${color.getHexString()}`;
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(proj.title, 22, 58);
    ctx.shadowBlur = 0;

    // Divider under title
    ctx.fillStyle = `#${color.getHexString()}33`;
    ctx.fillRect(22, 68, 80, 1);

    // Description
    ctx.font = '13px monospace';
    ctx.fillStyle = '#999';
    wrapText(ctx, proj.description, 22, 92, w - 44, 18);

    // Tech tags
    ctx.font = 'bold 10px monospace';
    let tx = 22;
    const ty = h - 80;
    (proj.tech || []).forEach(t => {
        const tw = ctx.measureText(t).width + 14;
        // Tag bg
        ctx.fillStyle = `#${color.getHexString()}15`;
        roundRect(ctx, tx, ty - 10, tw, 18, 3);
        ctx.fill();
        ctx.strokeStyle = `#${color.getHexString()}55`;
        ctx.lineWidth = 0.8;
        roundRect(ctx, tx, ty - 10, tw, 18, 3);
        ctx.stroke();
        ctx.fillStyle = `#${color.getHexString()}`;
        ctx.fillText(t, tx + 7, ty + 2);
        tx += tw + 5;
    });

    // Links
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    let ly = h - 48;
    if (proj.demo) {
        ctx.fillStyle = '#00ff88';
        ctx.fillText('▶ ' + proj.demo, w / 2, ly);
        ly += 13;
    }
    if (proj.link) {
        ctx.fillStyle = '#00aaff';
        ctx.fillText('🌐 ' + proj.link, w / 2, ly);
        ly += 13;
    }
    if (proj.github) {
        ctx.fillStyle = '#777';
        ctx.fillText('⟨/⟩ ' + proj.github, w / 2, ly);
    }

    // Bottom accent
    const btGrad = ctx.createLinearGradient(30, 0, w - 30, 0);
    btGrad.addColorStop(0, 'transparent');
    btGrad.addColorStop(0.5, `#${color.getHexString()}44`);
    btGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = btGrad;
    ctx.fillRect(25, h - 6, w - 50, 1);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '', ly = y;
    words.forEach(word => {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line.trim(), x, ly);
            line = word + ' ';
            ly += lineH;
        } else line = test;
    });
    if (line) ctx.fillText(line.trim(), x, ly);
}

// ═══════════════════════════════
//  UPDATE — ultra-smooth
// ═══════════════════════════════

function updateProjects(delta, camera, scrollProgress) {
    if (!vaultGroup || !initialized) return;
    const time = performance.now() * 0.001;

    // Entry fade-in (first 2 seconds)
    entryAnim = Math.min(1, entryAnim + delta * 0.5);
    const entryEase = 1 - Math.pow(1 - entryAnim, 3);

    // Camera — smooth entry from above
    camera.position.set(
        0,
        SECTION_Y + 2.2 + (1 - entryEase) * 3,
        SECTION_Z
    );
    camera.rotation.set((1 - entryEase) * -0.3, 0, 0);

    // Smooth carousel rotation with momentum
    const targetAngle = scrollProgress * Math.PI * 2 * 1.5;
    carouselAngle += (targetAngle - carouselAngle) * 0.025;
    carousel.rotation.y = carouselAngle;

    // Card animations
    cardMeshes.forEach((cg, i) => {
        // Gentle float
        cg.position.y = Math.sin(time * 0.5 + i * 0.9) * 0.1;
        // Subtle tilt
        cg.rotation.x = Math.sin(time * 0.25 + i * 0.6) * 0.015;
        cg.rotation.z = Math.sin(time * 0.3 + i * 0.8) * 0.008;
        // Scale based on entry
        cg.scale.setScalar(entryEase);
    });

    // Crystal spin
    carousel.children.forEach(c => {
        if (c.userData && c.userData.isCrystal) {
            c.rotation.y = time * 0.4;
            c.rotation.x = Math.sin(time * 0.3) * 0.2;
            c.position.y = -1.4 + Math.sin(time * 0.6) * 0.08;
        }
        if (c.userData && c.userData.isCrystalLight) {
            c.intensity = 1.5 + Math.sin(time * 0.8) * 0.5;
        }
    });

    // Dust orbit
    vaultGroup.children.forEach(c => {
        if (c.userData && c.userData.isDust) {
            const pos = c.geometry.attributes.position.array;
            for (let i = 0; i < pos.length / 3; i++) {
                pos[i * 3 + 1] += Math.sin(time * 0.3 + i * 0.2) * delta * 0.01;
                const a = Math.atan2(pos[i * 3 + 2], pos[i * 3]) + delta * 0.005;
                const r = Math.sqrt(pos[i * 3] ** 2 + pos[i * 3 + 2] ** 2);
                pos[i * 3] = Math.cos(a) * r;
                pos[i * 3 + 2] = Math.sin(a) * r;
            }
            c.geometry.attributes.position.needsUpdate = true;
        }
        // Floor ring glow pulse
        if (c.userData && c.userData.isFloorRing) {
            c.material.opacity = 0.3 + Math.sin(time * 0.5) * 0.15;
        }
        // Floor light pulse
        if (c.userData && c.userData.isFloorLight) {
            c.intensity = 1.5 + Math.sin(time * 0.4) * 0.5;
        }
    });

    // Hover overlay
    const focused = getFocusedCard();
    if (focused && hoverOverlay) {
        const p = focused.proj;
        hoverOverlay.innerHTML = `
      <div style="color:#fff;font-size:16px;font-weight:bold;margin-bottom:5px;text-shadow:0 0 8px rgba(100,50,255,0.4);">
        ⟨ ${p.title} ⟩
      </div>
      <div style="color:#666;font-size:11px;margin-bottom:8px;letter-spacing:1px;">
        ${p.tech ? p.tech.join(' · ') : ''}
      </div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        ${p.demo ? `<a href="${p.demo}" target="_blank" style="color:#00ff88;font-size:11px;text-decoration:none;padding:4px 10px;border:1px solid #00ff8844;border-radius:5px;transition:all 0.3s;">▶ Demo</a>` : ''}
        ${p.link ? `<a href="${p.link}" target="_blank" style="color:#00aaff;font-size:11px;text-decoration:none;padding:4px 10px;border:1px solid #00aaff44;border-radius:5px;transition:all 0.3s;">🌐 Live</a>` : ''}
        ${p.github ? `<a href="${p.github}" target="_blank" style="color:#bbb;font-size:11px;text-decoration:none;padding:4px 10px;border:1px solid #bbb4;border-radius:5px;transition:all 0.3s;">⟨/⟩ Code</a>` : ''}
      </div>
    `;
        hoverOverlay.style.opacity = entryEase.toString();
    }

    // Completion
    if (scrollProgress > 0.95 && !sectionDone) {
        sectionDone = true;
        if (onCompleteCallback) onCompleteCallback();
    }
}

function onProjectsComplete(cb) { onCompleteCallback = cb; }
function isProjectsDone() { return sectionDone; }

export { createProjects, updateProjects, onProjectsComplete, isProjectsDone };
