import * as THREE from 'three';

/**
 * Glitch Cube — with fully opaque theme-colored flash on burst
 */

const CUBE_SIZE = 1.2;
const AURA_PARTICLE_COUNT = 600;
const EMBER_COUNT = 150;
const SPEED_LINE_COUNT = 200;
const ASTEROID_COUNT = 18;
const BURST_PARTICLE_COUNT = 900;

const COLOR_CORE = 0x00ff88;
const COLOR_FIRE_WHITE = 0xffffff;
const COLOR_FIRE_YELLOW = 0xffdd44;
const COLOR_FIRE_ORANGE = 0xff8800;
const COLOR_FIRE_RED = 0xff2200;

let state = 'IDLE';
let burstProgress = 0;
let group, cubeGroup;
let cubeMesh, edgesMesh, innerMesh;
let auraParticles, emberParticles, speedLines;
let auraLight, auraLight2;
let asteroids = [];
let burstParticles;
let burstVelocities = [];
let flashOverlay = null;
let onBurstCompleteCallback = null;

const _tv = new THREE.Vector3();

function createGlitchCube() {
    group = new THREE.Group();
    group.position.set(0, 1.6, 0);
    cubeGroup = new THREE.Group();

    const cubeGeo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    cubeMesh = new THREE.Mesh(cubeGeo, new THREE.MeshBasicMaterial({
        color: COLOR_CORE, transparent: true, opacity: 0.15, side: THREE.DoubleSide,
    }));
    cubeGroup.add(cubeMesh);

    edgesMesh = new THREE.LineSegments(
        new THREE.EdgesGeometry(cubeGeo),
        new THREE.LineBasicMaterial({ color: COLOR_CORE, transparent: true, opacity: 1.0 })
    );
    cubeGroup.add(edgesMesh);

    const innerGeo = new THREE.BoxGeometry(CUBE_SIZE * 0.5, CUBE_SIZE * 0.5, CUBE_SIZE * 0.5);
    innerMesh = new THREE.LineSegments(
        new THREE.EdgesGeometry(innerGeo),
        new THREE.LineBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.6 })
    );
    cubeGroup.add(innerMesh);
    group.add(cubeGroup);

    auraLight = new THREE.PointLight(COLOR_FIRE_ORANGE, 3, 10);
    group.add(auraLight);
    auraLight2 = new THREE.PointLight(COLOR_CORE, 1.5, 6);
    group.add(auraLight2);

    auraParticles = createAuraParticles();
    group.add(auraParticles);
    emberParticles = createEmberParticles();
    group.add(emberParticles);
    speedLines = createSpeedLines();
    group.add(speedLines);
    createAsteroids();
    burstParticles = createBurstParticles();
    burstParticles.visible = false;
    group.add(burstParticles);

    // ── Flash overlay — FULLY OPAQUE, theme colors ──
    flashOverlay = document.createElement('div');
    flashOverlay.id = 'cube-flash';
    flashOverlay.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 500; pointer-events: none;
    opacity: 0;
    background: #00ff88;
  `;
    document.body.appendChild(flashOverlay);

    return group;
}

// ── Aura particles ──
function createAuraParticles() {
    const pos = new Float32Array(AURA_PARTICLE_COUNT * 3);
    const col = new Float32Array(AURA_PARTICLE_COUNT * 3);
    const fireG = [new THREE.Color(0xffffff), new THREE.Color(0xffdd44), new THREE.Color(0xff8800), new THREE.Color(0xff2200), new THREE.Color(0xcc0000)];
    for (let i = 0; i < AURA_PARTICLE_COUNT; i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        const r = CUBE_SIZE * 0.6 + Math.random() * CUBE_SIZE * 0.5;
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); pos[i * 3 + 2] = r * Math.cos(ph);
        const ci = Math.min(4, Math.floor((r / (CUBE_SIZE * 1.1)) * 4)); const c = fireG[ci];
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const points = new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.15, map: createDotTexture(), vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    points.userData.orbitData = [];
    for (let i = 0; i < AURA_PARTICLE_COUNT; i++) {
        points.userData.orbitData.push({ theta: Math.random() * Math.PI * 2, phi: Math.acos(2 * Math.random() - 1), radius: CUBE_SIZE * 0.55 + Math.random() * CUBE_SIZE * 0.55, speed: 0.5 + Math.random() * 1.5, phiSpeed: (Math.random() - 0.5) * 0.4, flicker: Math.random() * Math.PI * 2 });
    }
    return points;
}

function createEmberParticles() {
    const pos = new Float32Array(EMBER_COUNT * 3), col = new Float32Array(EMBER_COUNT * 3);
    for (let i = 0; i < EMBER_COUNT; i++) {
        const a = Math.random() * Math.PI * 2, r = CUBE_SIZE * 0.8 + Math.random() * 1.5;
        pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 2; pos[i * 3 + 2] = Math.sin(a) * r;
        const b = 0.8 + Math.random() * 0.2; col[i * 3] = b; col[i * 3 + 1] = b * 0.4; col[i * 3 + 2] = 0;
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.05, map: createDotTexture(), vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
}

function createSpeedLines() {
    const pos = new Float32Array(SPEED_LINE_COUNT * 6), col = new Float32Array(SPEED_LINE_COUNT * 6);
    for (let i = 0; i < SPEED_LINE_COUNT; i++) {
        const x = (Math.random() - 0.5) * 20, y = (Math.random() - 0.5) * 12, z = (Math.random() - 0.5) * 30 - 5, l = 0.5 + Math.random() * 2.5;
        pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z; pos[i * 6 + 3] = x; pos[i * 6 + 4] = y; pos[i * 6 + 5] = z + l;
        const b = 0.15 + Math.random() * 0.4; for (let j = 0; j < 2; j++) { col[i * 6 + j * 3] = b * 0.5; col[i * 6 + j * 3 + 1] = b * 0.7; col[i * 6 + j * 3 + 2] = b + 0.2; }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending }));
}

function createAsteroids() {
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        const det = Math.random() > 0.5 ? 1 : 0, bs = 0.15 + Math.random() * 0.5;
        const geo = new THREE.IcosahedronGeometry(bs, det); const pa = geo.attributes.position;
        for (let v = 0; v < pa.count; v++) { const n = 0.7 + Math.random() * 0.6; pa.setXYZ(v, pa.getX(v) * n, pa.getY(v) * n, pa.getZ(v) * n); }
        pa.needsUpdate = true; geo.computeVertexNormals();
        const sh = 0.2 + Math.random() * 0.25;
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: new THREE.Color(sh, sh * 0.9, sh * 0.8), roughness: 0.95, metalness: 0.1, flatShading: true }));
        mesh.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, -18 - Math.random() * 25);
        mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        mesh.userData.speed = 3 + Math.random() * 7; mesh.userData.rotSpeed = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: (Math.random() - 0.5) * 2 };
        group.add(mesh); asteroids.push(mesh);
    }
}

function createBurstParticles() {
    const pos = new Float32Array(BURST_PARTICLE_COUNT * 3), col = new Float32Array(BURST_PARTICLE_COUNT * 3);
    const pal = [new THREE.Color(COLOR_CORE), new THREE.Color(0x00ccff), new THREE.Color(0xffffff), new THREE.Color(0x00ff66), new THREE.Color(0x88ffcc)];
    for (let i = 0; i < BURST_PARTICLE_COUNT; i++) {
        const half = CUBE_SIZE / 2, face = Math.floor(Math.random() * 6); let x = 0, y = 0, z = 0;
        switch (face) { case 0: x = half; y = (Math.random() - .5) * CUBE_SIZE; z = (Math.random() - .5) * CUBE_SIZE; break; case 1: x = -half; y = (Math.random() - .5) * CUBE_SIZE; z = (Math.random() - .5) * CUBE_SIZE; break; case 2: y = half; x = (Math.random() - .5) * CUBE_SIZE; z = (Math.random() - .5) * CUBE_SIZE; break; case 3: y = -half; x = (Math.random() - .5) * CUBE_SIZE; z = (Math.random() - .5) * CUBE_SIZE; break; case 4: z = half; x = (Math.random() - .5) * CUBE_SIZE; y = (Math.random() - .5) * CUBE_SIZE; break; case 5: z = -half; x = (Math.random() - .5) * CUBE_SIZE; y = (Math.random() - .5) * CUBE_SIZE; break; }
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
        const dir = _tv.set(x, y, z).normalize(), spd = 12 * (0.5 + Math.random());
        burstVelocities.push(dir.x * spd + (Math.random() - .5) * 5, dir.y * spd + (Math.random() - .5) * 5, dir.z * spd + (Math.random() - .5) * 5);
        const c = pal[Math.floor(Math.random() * pal.length)]; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.12, map: createDotTexture(), vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
}

function createDotTexture() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.1, 'rgba(255,255,255,0.95)'); g.addColorStop(0.3, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(255,255,255,0.15)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}

// ═══════════════════════════
//  UPDATE
// ═══════════════════════════
function updateGlitchCube(delta, scrollProgress) {
    if (state === 'DONE' || !group) return;
    const time = performance.now() * 0.001;

    if (state === 'IDLE') {
        cubeGroup.rotation.x += delta * 0.3; cubeGroup.rotation.y += delta * 0.5;
        innerMesh.rotation.x = -cubeGroup.rotation.x * 0.7; innerMesh.rotation.y = -cubeGroup.rotation.y * 0.5;
        cubeGroup.scale.setScalar(1 + Math.sin(time * 1.2) * 0.04);
        auraLight.intensity = 3 + Math.sin(time * 1.5) * 1.5; auraLight2.intensity = 1.5 + Math.sin(time * 2.1) * 0.8;
        if (Math.random() > 0.94) { edgesMesh.material.color.setHex(Math.random() > 0.5 ? 0xff8800 : 0x00ccff); setTimeout(() => { if (edgesMesh.material) edgesMesh.material.color.setHex(COLOR_CORE); }, 50); }
        updateAura(delta, time); updateEmbers(delta, time); updateSpeedLn(delta); updateAst(delta);
        if (scrollProgress > 0.03) triggerBurst();
    }

    if (state === 'BURSTING') {
        burstProgress += delta * 1.5; // faster burst
        const fade = Math.max(0, 1 - burstProgress * 3);
        cubeMesh.material.opacity = 0.15 * fade; edgesMesh.material.opacity = fade; innerMesh.material.opacity = 0.6 * fade;
        auraLight.intensity = 8 * fade; auraLight2.intensity = 4 * fade;
        auraParticles.material.opacity = 0.85 * fade; emberParticles.material.opacity = 0.7 * fade;
        speedLines.material.opacity = 0.35 * fade;
        asteroids.forEach(a => { a.material.opacity = fade; a.material.transparent = true; });
        cubeGroup.scale.setScalar(1 + burstProgress * 3);

        const bp = burstParticles.geometry.attributes.position.array;
        for (let i = 0; i < BURST_PARTICLE_COUNT; i++) { bp[i * 3] += burstVelocities[i * 3] * delta; bp[i * 3 + 1] += burstVelocities[i * 3 + 1] * delta; bp[i * 3 + 2] += burstVelocities[i * 3 + 2] * delta; burstVelocities[i * 3 + 1] -= delta * 3; }
        burstParticles.geometry.attributes.position.needsUpdate = true;
        burstParticles.material.opacity = burstProgress < 0.3 ? burstProgress / 0.3 : Math.max(0, 1 - (burstProgress - 0.3) * 1.2);

        // ── FULLY OPAQUE theme-colored flash ──
        // Phase 1: Slam to full green (0.0 - 0.3)
        // Phase 2: Shift through theme colors (0.3 - 0.8)
        // Phase 3: Fade to solid black (0.8 - 1.4)
        if (burstProgress < 0.3) {
            flashOverlay.style.opacity = Math.min(1, burstProgress / 0.15).toString(); // instant slam to 1
            flashOverlay.style.background = '#00ff88';
        } else if (burstProgress < 0.5) {
            flashOverlay.style.opacity = '1';
            flashOverlay.style.background = '#00ccff'; // cyan
        } else if (burstProgress < 0.7) {
            flashOverlay.style.opacity = '1';
            flashOverlay.style.background = '#00ff66'; // bright green
        } else if (burstProgress < 0.9) {
            flashOverlay.style.opacity = '1';
            flashOverlay.style.background = '#ffffff'; // white peak
        } else if (burstProgress < 1.4) {
            flashOverlay.style.opacity = '1';
            // Fade from white to black
            const t = (burstProgress - 0.9) / 0.5;
            const v = Math.max(0, Math.floor(255 * (1 - t)));
            flashOverlay.style.background = `rgb(${v},${v},${v})`;
        } else {
            flashOverlay.style.opacity = '1';
            flashOverlay.style.background = '#000000';
        }

        // Done — everything black, call complete immediately
        if (burstProgress > 1.6) {
            state = 'DONE';
            group.visible = false;
            // Fade the black overlay out to reveal door
            flashOverlay.style.transition = 'opacity 1s ease';
            flashOverlay.style.opacity = '0';
            setTimeout(() => { if (flashOverlay) flashOverlay.remove(); }, 1100);
            if (onBurstCompleteCallback) onBurstCompleteCallback();
        }
    }
}

function updateAura(delta, time) {
    const pos = auraParticles.geometry.attributes.position.array, col = auraParticles.geometry.attributes.color.array, data = auraParticles.userData.orbitData;
    const fg = [[1, 1, 1], [1, 0.87, 0.27], [1, 0.53, 0], [1, 0.13, 0], [0.8, 0, 0]];
    for (let i = 0; i < AURA_PARTICLE_COUNT; i++) {
        const d = data[i]; d.theta += d.speed * delta; d.phi += d.phiSpeed * delta; const b = 1 + Math.sin(time * 2 + d.flicker) * 0.15; const r = d.radius * b;
        pos[i * 3] = r * Math.sin(d.phi) * Math.cos(d.theta); pos[i * 3 + 1] = r * Math.sin(d.phi) * Math.sin(d.theta); pos[i * 3 + 2] = r * Math.cos(d.phi);
        const dist = r / (CUBE_SIZE * 1.1), ci = Math.min(4, Math.floor(dist * 3.5)), cn = Math.min(4, ci + 1), t = (dist * 3.5) - ci;
        col[i * 3] = fg[ci][0] + (fg[cn][0] - fg[ci][0]) * t; col[i * 3 + 1] = fg[ci][1] + (fg[cn][1] - fg[ci][1]) * t; col[i * 3 + 2] = fg[ci][2] + (fg[cn][2] - fg[ci][2]) * t;
    }
    auraParticles.geometry.attributes.position.needsUpdate = true; auraParticles.geometry.attributes.color.needsUpdate = true;
}

function updateEmbers(delta, time) {
    const pos = emberParticles.geometry.attributes.position.array;
    for (let i = 0; i < EMBER_COUNT; i++) {
        const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2], dist = Math.sqrt(x * x + y * y + z * z);
        if (dist > 0.01) { pos[i * 3] += (x / dist) * delta * 1.5; pos[i * 3 + 1] += (y / dist) * delta * 1.5 + delta * 0.5; pos[i * 3 + 2] += (z / dist) * delta * 1.5; }
        pos[i * 3] += Math.sin(time * 3 + i) * delta * 0.3; pos[i * 3 + 1] += Math.cos(time * 2.5 + i * 0.7) * delta * 0.2;
        if (dist > 3) { const a = Math.random() * Math.PI * 2, r = CUBE_SIZE * 0.7; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * CUBE_SIZE; pos[i * 3 + 2] = Math.sin(a) * r; }
    }
    emberParticles.geometry.attributes.position.needsUpdate = true;
}

function updateSpeedLn(delta) {
    const pos = speedLines.geometry.attributes.position.array, s = delta * 22;
    for (let i = 0; i < SPEED_LINE_COUNT; i++) {
        pos[i * 6 + 2] += s; pos[i * 6 + 5] += s;
        if (pos[i * 6 + 2] > 15) { const x = (Math.random() - 0.5) * 20, y = (Math.random() - 0.5) * 12, z = -20 - Math.random() * 15, l = 0.5 + Math.random() * 2.5; pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z; pos[i * 6 + 3] = x; pos[i * 6 + 4] = y; pos[i * 6 + 5] = z + l; }
    }
    speedLines.geometry.attributes.position.needsUpdate = true;
}

function updateAst(delta) {
    asteroids.forEach(a => {
        a.position.z += a.userData.speed * delta; a.rotation.x += a.userData.rotSpeed.x * delta; a.rotation.y += a.userData.rotSpeed.y * delta; a.rotation.z += a.userData.rotSpeed.z * delta;
        if (a.position.z > 10) { a.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, -20 - Math.random() * 20); a.userData.speed = 3 + Math.random() * 7; }
    });
}

function triggerBurst() { if (state !== 'IDLE') return; state = 'BURSTING'; burstProgress = 0; burstParticles.visible = true; }
function isBurstDone() { return state === 'DONE'; }
function onBurstComplete(cb) { onBurstCompleteCallback = cb; }

export { createGlitchCube, updateGlitchCube, triggerBurst, isBurstDone, onBurstComplete };
