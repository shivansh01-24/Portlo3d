import * as THREE from 'three';
import { lockScroll, unlockScroll, setCinemaProgress } from '../core/scrollController.js';

/**
 * Certificates Gallery — scroll-driven cinematic experience
 *
 * Features:
 *   - Loads cert data from JSON (auto-counts)
 *   - Placeholder frames (user adds photos later)
 *   - Shelf on right wall, camera pauses at each cert
 *   - Summary panel with auto-counted stats
 *   - WALL REVEAL: back wall rises with smoke particles
 *   - RED PRESSURE PLATE stairs — each step glows red as camera steps on it
 *   - Smoother camera with better easing
 */

const ROOM_Z = -15;
const HP = Math.PI / 2;
const WALL_X = 5.93;          // final X position of certs on wall
const WALL_X_HIDDEN = 8.5;    // starting X (inside wall, hidden)
const MIN_DWELL = 2.0;        // minimum seconds to show each cert

let galleryGroup;
let counterCanvas, counterCtx, counterTexture, summaryMesh;
let counterDone = false;
let onCompleteCallback = null;
let stairDone = false;

// Wall reveal
let revealWall = null;
let smokeParticles = null;
let smokeGeo = null;
let revealStarted = false;
let revealTimer = 0;
const REVEAL_DURATION = 3.0;

// Staircase
let steps = [];
let stepLights = [];

// Cert data
let certData = [];
let statsData = { projects: 0, technologies: 0, commits: 0 };
let certPositions = [];
let dataLoaded = false;

// Per-cert animation objects (for wall emergence)
let certFrameGroups = [];   // [{frame, certMesh, goldBorder, spot}]
let certRevealProgress = []; // 0→1 per cert

// Stepped gallery scroll state
let galleryCertIndex = -1;   // -1 = entrance, 0..n-1 = cert, n = achievements
let galleryCertTarget = -1;  // queued target
let galleryCertTimer = 0;    // seconds on current position

// Waypoints used ONLY for the staircase phase (0.78 → 1.0)
let WP = [];

// Raycasting
let certCameraRef = null;
let certMeshList = [];
let summaryMeshRef = null;
const MASTER_DOC_LINK = 'https://docs.google.com/document/d/your-master-cert-doc';

function buildWaypoints() {
    WP = [];
    // Only staircase descent. Gallery cert-browsing is driven by galleryCertIndex.
    // Approach stairs
    WP.push([0.78, 0, 1.3, -7, -0.15, 0]);
    // Descend
    WP.push([0.82, 0, 0.5, -9, -0.15, 0]);
    WP.push([0.86, 0, -0.2, -11, -0.12, 0]);
    WP.push([0.90, 0, -0.9, -13, -0.1, 0]);
    WP.push([0.94, 0, -1.6, -15, -0.05, 0]);
    WP.push([0.97, 0, -2.2, -16.5, 0, 0]);
    WP.push([1.00, 0, -2.2, -16.5, 0, 0]);
}

async function createCertificates(camera, rendererDom) {
    certCameraRef = camera || null;
    galleryGroup = new THREE.Group();
    galleryGroup.position.set(0, 0, ROOM_Z);

    // Load JSON data
    try {
        const resp = await fetch('./data/certificates.json');
        const json = await resp.json();
        certData = json.certificates || [];
        statsData = json.stats || {};
    } catch (e) {
        console.warn('Could not load certificates.json, using defaults');
        certData = [
            { title: 'Certificate 1', issuer: 'Issuer', date: '2024', image: null },
            { title: 'Certificate 2', issuer: 'Issuer', date: '2024', image: null },
            { title: 'Certificate 3', issuer: 'Issuer', date: '2023', image: null },
        ];
        statsData = { projects: 10, technologies: 5, commits: 100 };
    }

    // Calculate cert positions along right wall
    const n = certData.length;
    const zStart = 4, zEnd = -3.5;
    for (let i = 0; i < n; i++) {
        certPositions.push(zStart - i * ((zStart - zEnd) / (n - 1 || 1)));
    }

    buildWaypoints();

    // ── Long shelf on right wall ──
    const shelfMat = new THREE.MeshStandardMaterial({
        color: 0x1a1018, roughness: 0.5, metalness: 0.3,
        emissive: 0x110808, emissiveIntensity: 0.05
    });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 9), shelfMat);
    shelf.position.set(5.75, 1.25, 0);
    galleryGroup.add(shelf);

    // Shelf bracket supports
    for (let z = -4; z <= 4; z += 2) {
        const br = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.03, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 })
        );
        br.position.set(5.85, 1.22, z);
        galleryGroup.add(br);
    }

    // ── Certificate placeholder frames (start hidden inside wall) ──
    certData.forEach((cert, i) => {
        const fW = 1.1, fH = 0.8;
        const fz = certPositions[i];

        // Outer frame — starts INSIDE wall at WALL_X_HIDDEN
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x0f0f1e, roughness: 0.3, metalness: 0.6
        });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(fH + 0.1, fW + 0.1, 0.05), frameMat);
        frame.position.set(WALL_X_HIDDEN, 2, fz); // hidden inside wall
        frame.rotation.y = -HP;
        galleryGroup.add(frame);

        // Gold inner border
        const goldBorder = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(fH + 0.04, fW + 0.04, 0.06)),
            new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.8 })
        );
        goldBorder.position.copy(frame.position);
        goldBorder.rotation.copy(frame.rotation);
        galleryGroup.add(goldBorder);

        // Placeholder canvas
        const c = document.createElement('canvas');
        c.width = 360; c.height = 260;
        const ctx = c.getContext('2d');
        drawPlaceholder(ctx, cert, i, 360, 260);
        const tex = new THREE.CanvasTexture(c);
        const certMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(fH, fW),
            new THREE.MeshBasicMaterial({ map: tex })
        );
        certMesh.position.set(WALL_X_HIDDEN + 0.02, 2, fz); // also hidden
        certMesh.rotation.y = -HP;
        certMesh.userData.certLink = cert.link || null;
        certMesh.userData.certIndex = i;
        certMeshList.push(certMesh);
        galleryGroup.add(certMesh);

        // Spotlight starts dim (0), brightens when cert is focused
        const spot = new THREE.SpotLight(0xffeedd, 0, 4, Math.PI / 8, 0.6, 1);
        spot.position.set(3.5, 3.5, fz);
        const spTarget = new THREE.Object3D();
        spTarget.position.set(5.9, 2, fz);
        galleryGroup.add(spTarget);
        spot.target = spTarget;
        galleryGroup.add(spot);

        // Store group ref for animation
        certFrameGroups.push({ frame, certMesh, goldBorder, spot });
        certRevealProgress.push(0); // start hidden
    });

    // ── Step-based gallery wheel handler ──
    // Each wheel tick queues one step; dwell lock enforced in update
    function onGalleryStep(e) {
        if (cinState !== CIN.GALLERY) return;
        if (e.deltaY > 0) {
            galleryCertTarget = Math.min(certData.length, galleryCertTarget + 1);
        } else if (e.deltaY < 0) {
            galleryCertTarget = Math.max(-1, galleryCertTarget - 1);
        }
    }
    window.addEventListener('wheel', onGalleryStep, { passive: true });

    // ── Summary panel (starts invisible, fades in during ACHIEVE_PAUSE) ──
    counterCanvas = document.createElement('canvas');
    counterCanvas.width = 600; counterCanvas.height = 380;
    counterCtx = counterCanvas.getContext('2d');
    drawCounters(0);
    counterTexture = new THREE.CanvasTexture(counterCanvas);
    summaryMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 1.1),
        new THREE.MeshBasicMaterial({ map: counterTexture, transparent: true, opacity: 0 })
    );
    summaryMesh.position.set(WALL_X - 0.05, 2.3, -5);
    summaryMesh.rotation.y = -HP;
    summaryMesh.userData.masterDocLink = MASTER_DOC_LINK;
    summaryMeshRef = summaryMesh;
    galleryGroup.add(summaryMesh);

    // Summary glow
    const sg = new THREE.PointLight(0x00ff88, 0, 3); // starts off
    sg.userData.isSummaryGlow = true;
    sg.position.set(4.5, 2.3, -5);
    galleryGroup.add(sg);

    // ── Raycaster click — cert frames & summary panel ──
    if (rendererDom) {
        const rcaster = new THREE.Raycaster();
        const rcMouse = new THREE.Vector2(-9999, -9999);
        rendererDom.addEventListener('mousemove', (e) => {
            rcMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            rcMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        rendererDom.addEventListener('click', () => {
            if (!certCameraRef) return;
            rcaster.setFromCamera(rcMouse, certCameraRef);
            // Check summary panel first
            if (summaryMeshRef) {
                const sh = rcaster.intersectObject(summaryMeshRef, false);
                if (sh.length) {
                    window.open(MASTER_DOC_LINK, '_blank');
                    return;
                }
            }
            // Check individual cert frames
            const hits = rcaster.intersectObjects(certMeshList, false);
            if (!hits.length) return;
            const link = hits[0].object.userData.certLink;
            if (link) window.open(link, '_blank');
        });
    }

    // ═══════════════════════════════
    //  REVEAL WALL (rises to show staircase)
    // ═══════════════════════════════
    const rwMat = new THREE.MeshStandardMaterial({
        color: 0x0e0e1a, roughness: 0.85, metalness: 0.1, side: THREE.DoubleSide
    });
    revealWall = new THREE.Mesh(new THREE.PlaneGeometry(4, 5), rwMat);
    revealWall.position.set(0, 2.5, -6.1);
    revealWall.userData.baseY = 2.5;
    galleryGroup.add(revealWall);

    // ── Smoke particles ──
    const smokeCount = 200;
    const sPos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
        sPos[i * 3] = (Math.random() - 0.5) * 4;
        sPos[i * 3 + 1] = Math.random() * 0.5;
        sPos[i * 3 + 2] = -6.1 + (Math.random() - 0.5) * 0.5;
    }
    smokeGeo = new THREE.BufferGeometry();
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    smokeParticles = new THREE.Points(smokeGeo, new THREE.PointsMaterial({
        size: 0.15, color: 0x444455, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    galleryGroup.add(smokeParticles);

    // ═══════════════════════════════
    //  STAIRCASE — 14 steps, pressure plate style
    // ═══════════════════════════════
    const numSteps = 14;
    const stepDepth = 10 / numSteps;
    const stepDrop = 3.5 / numSteps;

    // Staircase corridor walls
    const swMat = new THREE.MeshStandardMaterial({ color: 0x0a0a15, roughness: 0.9, side: THREE.DoubleSide });
    const swL = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), swMat);
    swL.position.set(-1.8, -0.5, -12); swL.rotation.y = HP;
    galleryGroup.add(swL);
    const swR = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), swMat);
    swR.position.set(1.8, -0.5, -12); swR.rotation.y = -HP;
    galleryGroup.add(swR);

    for (let i = 0; i < numSteps; i++) {
        const sz = -7 - i * stepDepth;
        const sy = -i * stepDrop;

        // Step mesh
        const stepMat = new THREE.MeshStandardMaterial({
            color: 0x151525, roughness: 0.6, metalness: 0.3,
            emissive: 0x000000, emissiveIntensity: 0
        });
        const step = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, stepDepth * 0.9), stepMat);
        step.position.set(0, sy, sz);
        step.userData.stepIndex = i;
        galleryGroup.add(step);
        steps.push(step);

        // Red glow light (initially off)
        const glow = new THREE.PointLight(0xff2200, 0, 2);
        glow.position.set(0, sy + 0.1, sz);
        galleryGroup.add(glow);
        stepLights.push(glow);

        // Edge strip on each step (subtle)
        const edgeMat = new THREE.MeshBasicMaterial({
            color: 0x331111, transparent: true, opacity: 0.3
        });
        const edge = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.01, 0.03), edgeMat);
        edge.position.set(0, sy + 0.07, sz + stepDepth * 0.45);
        edge.userData.stepIndex = i;
        galleryGroup.add(edge);
    }

    // Torch holders on staircase walls
    const torchMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.8 });
    for (let i = 1; i < numSteps; i += 3) {
        const tz = -7 - i * stepDepth;
        const ty = -i * stepDrop + 0.8;
        [-1.7, 1.7].forEach(side => {
            const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.25), torchMat);
            tb.position.set(side, ty, tz);
            galleryGroup.add(tb);
            const flame = new THREE.PointLight(0xff6622, 1.2, 2.5);
            flame.position.set(side, ty + 0.2, tz);
            flame.userData.isTorch = true;
            flame.userData.baseY = ty + 0.2;
            galleryGroup.add(flame);
            const fm = new THREE.Mesh(
                new THREE.SphereGeometry(0.035, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0xff8833, transparent: true, opacity: 0.85 })
            );
            fm.position.set(side, ty + 0.18, tz);
            fm.userData.isTorch = true;
            galleryGroup.add(fm);
        });
    }

    // ═══════════════════════════════
    //  OMINOUS RED PORTAL — fully covers staircase bottom
    // ═══════════════════════════════
    const portalY = -numSteps * stepDrop;
    const portalZ = -7 - numSteps * stepDepth - 0.5;

    // Large outer ring — thick, ominous red
    const outerRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.8, 0.1, 16, 64),
        new THREE.MeshBasicMaterial({ color: 0xff1100, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    outerRing.position.set(0, portalY + 1.0, portalZ);
    outerRing.userData.isPortalRing = true;
    outerRing.userData.spinSpeed = 0.8;
    galleryGroup.add(outerRing);

    // Inner ring — faster counter-spin
    const innerRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.4, 0.06, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    innerRing.position.set(0, portalY + 1.0, portalZ - 0.03);
    innerRing.userData.isPortalRing = true;
    innerRing.userData.spinSpeed = -1.5;
    galleryGroup.add(innerRing);

    // Third ring — slow wobble
    const ring3 = new THREE.Mesh(
        new THREE.TorusGeometry(1.6, 0.04, 8, 40),
        new THREE.MeshBasicMaterial({ color: 0xcc0000, transparent: true, opacity: 0.4 })
    );
    ring3.position.set(0, portalY + 1.0, portalZ + 0.03);
    ring3.userData.isPortalRing = true;
    ring3.userData.spinSpeed = 0.3;
    galleryGroup.add(ring3);

    // Energy core — dark red glowing disc covering the opening
    const coreMat = new THREE.MeshBasicMaterial({
        color: 0x440000, transparent: true, opacity: 0.35,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending
    });
    const core = new THREE.Mesh(new THREE.CircleGeometry(1.7, 48), coreMat);
    core.position.set(0, portalY + 1.0, portalZ + 0.01);
    core.userData.isPortalCore = true;
    galleryGroup.add(core);

    // Vortex particles — red swirl (200 particles)
    const vpCount = 200;
    const vpPos = new Float32Array(vpCount * 3);
    for (let i = 0; i < vpCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.2 + Math.random() * 1.6;
        vpPos[i * 3] = Math.cos(a) * r;
        vpPos[i * 3 + 1] = portalY + 1.0 + (Math.random() - 0.5) * 0.6;
        vpPos[i * 3 + 2] = portalZ + Math.sin(a) * r * 0.2;
    }
    const vpGeo = new THREE.BufferGeometry();
    vpGeo.setAttribute('position', new THREE.BufferAttribute(vpPos, 3));
    const vortex = new THREE.Points(vpGeo, new THREE.PointsMaterial({
        size: 0.07, color: 0xff3311, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    vortex.userData.isPortalVortex = true;
    galleryGroup.add(vortex);

    // Energy tendrils — red light beams shooting outward from portal
    for (let t = 0; t < 6; t++) {
        const tAngle = (t / 6) * Math.PI * 2;
        const tendril = new THREE.PointLight(0xff2200, 1.5, 4);
        tendril.position.set(
            Math.cos(tAngle) * 2.2,
            portalY + 1.0 + Math.sin(tAngle) * 0.5,
            portalZ + 0.5
        );
        tendril.userData.isTendril = true;
        tendril.userData.tendrilAngle = tAngle;
        tendril.userData.basePos = tendril.position.clone();
        galleryGroup.add(tendril);
    }

    // Main portal lights — ominous pulsing red glow
    const portalLight1 = new THREE.PointLight(0xff1100, 5, 8);
    portalLight1.position.set(0, portalY + 1.0, portalZ);
    portalLight1.userData.isPortalLight = true;
    galleryGroup.add(portalLight1);

    const portalLight2 = new THREE.PointLight(0xaa0000, 3, 12);
    portalLight2.position.set(0, portalY + 1.0, portalZ + 2);
    portalLight2.userData.isPortalLight = true;
    galleryGroup.add(portalLight2);

    // Red aura fog on staircase walls near bottom
    const auraLight1 = new THREE.PointLight(0xff2200, 1.5, 5);
    auraLight1.position.set(-1.5, portalY + 0.5, portalZ + 2);
    auraLight1.userData.isAura = true;
    galleryGroup.add(auraLight1);

    const auraLight2 = new THREE.PointLight(0xff2200, 1.5, 5);
    auraLight2.position.set(1.5, portalY + 0.5, portalZ + 2);
    auraLight2.userData.isAura = true;
    galleryGroup.add(auraLight2);

    dataLoaded = true;
    return galleryGroup;
}

// ── Placeholder drawing ──
function drawPlaceholder(ctx, cert, index, w, h) {
    // Dark background
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, w, h);

    // Decorative border
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.strokeStyle = '#c9a84c44';
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 14, w - 28, h - 28);

    // Certificate number
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#444';
    ctx.fillText(`#${index + 1}`, w - 22, 30);

    // Placeholder icon
    ctx.textAlign = 'center';
    ctx.font = '36px serif';
    ctx.fillStyle = '#333';
    ctx.fillText('📜', w / 2, h / 2 - 25);

    // Title
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(cert.title, w / 2, h / 2 + 20);

    // Issuer & date
    ctx.font = '11px monospace';
    ctx.fillStyle = '#555';
    ctx.fillText(`${cert.issuer} • ${cert.date}`, w / 2, h / 2 + 45);

    // Click indicator
    if (cert.link) {
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#00ff8820';
        ctx.fillRect(w / 2 - 65, h - 38, 130, 19);
        ctx.strokeStyle = '#00ff8855';
        ctx.lineWidth = 1;
        ctx.strokeRect(w / 2 - 65, h - 38, 130, 19);
        ctx.fillStyle = '#00ff88';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK TO VERIFY  \u2197', w / 2, h - 24);
    } else {
        ctx.font = '10px monospace';
        ctx.fillStyle = '#333';
        ctx.fillText('[ add certificate image ]', w / 2, h - 25);
    }
}

// ── Counter drawing ──
function drawCounters(progress) {
    const w = 600, h = 380;
    counterCtx.fillStyle = '#080810';
    counterCtx.fillRect(0, 0, w, h);

    counterCtx.font = 'bold 20px monospace';
    counterCtx.textAlign = 'center';
    counterCtx.fillStyle = '#00ff88';
    counterCtx.shadowColor = '#00ff88';
    counterCtx.shadowBlur = 12;
    counterCtx.fillText('⟨ ACHIEVEMENTS ⟩', w / 2, 35);
    counterCtx.shadowBlur = 0;

    // Auto-counted stats
    const allStats = [
        { label: 'Certificates', target: certData.length, icon: '📜' },
        { label: 'Projects', target: statsData.projects || 0, icon: '💻' },
        { label: 'Technologies', target: statsData.technologies || 0, icon: '⚡' },
        { label: 'Commits', target: statsData.commits || 0, icon: '🔥' },
    ];

    const colW = w / allStats.length;
    allStats.forEach((s, i) => {
        const cx = colW * i + colW / 2;
        const val = Math.floor(s.target * Math.min(1, progress));
        counterCtx.font = '30px serif';
        counterCtx.textAlign = 'center';
        counterCtx.fillText(s.icon, cx, 95);
        counterCtx.font = 'bold 38px monospace';
        counterCtx.fillStyle = '#00ff88';
        counterCtx.shadowColor = '#00ff88';
        counterCtx.shadowBlur = 10;
        counterCtx.fillText(val + '+', cx, 155);
        counterCtx.shadowBlur = 0;
        counterCtx.font = '12px monospace';
        counterCtx.fillStyle = '#777';
        counterCtx.fillText(s.label, cx, 180);
    });

    // Progress bar
    counterCtx.fillStyle = '#111128';
    counterCtx.fillRect(30, h - 35, w - 60, 6);
    counterCtx.fillStyle = '#00ff88';
    counterCtx.fillRect(30, h - 35, (w - 60) * Math.min(1, progress), 6);
}

// ── Camera interpolation ──
function getCam(scroll) {
    if (!WP.length) return { x: 0, y: 1.5, z: 3, rx: 0, ry: 0 };
    for (let i = 0; i < WP.length - 1; i++) {
        if (scroll >= WP[i][0] && scroll <= WP[i + 1][0]) {
            const range = WP[i + 1][0] - WP[i][0];
            const t = range > 0 ? (scroll - WP[i][0]) / range : 0;
            const e = smoothStep(t);
            return {
                x: mix(WP[i][1], WP[i + 1][1], e),
                y: mix(WP[i][2], WP[i + 1][2], e),
                z: mix(WP[i][3], WP[i + 1][3], e),
                rx: mix(WP[i][4], WP[i + 1][4], e),
                ry: mix(WP[i][5], WP[i + 1][5], e),
            };
        }
    }
    const last = WP[WP.length - 1];
    return { x: last[1], y: last[2], z: last[3], rx: last[4], ry: last[5] };
}

// ── Cinematic state machine ──
const CIN = {
    GALLERY: 'GALLERY',
    ACHIEVE_PAUSE: 'ACHIEVE_PAUSE',
    TURN_TO_WALL: 'TURN_TO_WALL',
    WALL_REVEAL: 'WALL_REVEAL',
    STAIRS: 'STAIRS',
};
let cinState = CIN.GALLERY;
let cinTimer = 0;

function mix(a, b, t) { return a + (b - a) * t; }
function smoothStep(t) { return t * t * t * (t * (t * 6 - 15) + 10); }


// Returns world-space camera target based on certIndex:
//   -1 = room entrance   0..n-1 = focused on cert i   n = achievements panel
function galleryCamTarget(idx) {
    if (idx < 0) {
        // Entrance: face forward, slightly right of door
        return { px: 0, py: 1.5, pz: ROOM_Z + 3, rx: 0, ry: 0 };
    }
    if (idx < certData.length) {
        // Face cert i on right wall
        return { px: 2.8, py: 1.6, pz: ROOM_Z + certPositions[idx], rx: 0, ry: -HP };
    }
    // Achievements panel (same wall, further back)
    return { px: 2.8, py: 1.8, pz: ROOM_Z + (-5), rx: 0.07, ry: -HP };
}

// ─── Update ───
function updateCertificates(delta, camera, scrollProgress) {
    if (!galleryGroup || !dataLoaded) return;
    certCameraRef = camera;
    const time = performance.now() * 0.001;
    const n = certData.length;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  STATE MACHINE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (cinState === CIN.GALLERY) {
        // ── Stepped cert browsing ──
        // Advance/retreat index only after spending MIN_DWELL on current position
        galleryCertTimer += delta;

        const wantAdvance = galleryCertTarget > galleryCertIndex;
        const wantRetreat = galleryCertTarget < galleryCertIndex;

        if ((wantAdvance || wantRetreat) && galleryCertTimer >= MIN_DWELL) {
            if (wantAdvance) galleryCertIndex++;
            else galleryCertIndex--;
            galleryCertIndex = Math.max(-1, Math.min(n, galleryCertIndex));
            galleryCertTimer = 0;

            // Trigger wall emergence for newly focused cert
            if (galleryCertIndex >= 0 && galleryCertIndex < n) {
                if (certRevealProgress[galleryCertIndex] === 0) {
                    certRevealProgress[galleryCertIndex] = 0.001; // start animation
                }
            }
        }

        // ── Camera aimed at current cert index ──
        const tgt = galleryCamTarget(galleryCertIndex);
        camera.position.x += (tgt.px - camera.position.x) * 0.055;
        camera.position.y += (tgt.py - camera.position.y) * 0.055;
        camera.position.z += (tgt.pz - camera.position.z) * 0.055;
        camera.rotation.x += (tgt.rx - camera.rotation.x) * 0.055;
        camera.rotation.y += (tgt.ry - camera.rotation.y) * 0.055;

        // ── Spotlight per cert ──
        certFrameGroups.forEach((fg, i) => {
            const isFocused = i === galleryCertIndex;
            const targetIntensity = isFocused ? 2.5 : 0;
            fg.spot.intensity += (targetIntensity - fg.spot.intensity) * 0.08;
        });

        // ── Transition to ACHIEVE_PAUSE when camera reaches achievements panel ──
        if (galleryCertIndex >= n && galleryCertTimer >= MIN_DWELL) {
            cinState = CIN.ACHIEVE_PAUSE;
            cinTimer = 0;
            lockScroll();
        }

    } else if (cinState === CIN.ACHIEVE_PAUSE) {
        // Hold at achievements panel for 5 seconds — counters animate
        cinTimer += delta;

        // Camera fixed on achievements panel
        const tgt = galleryCamTarget(n);
        camera.position.x += (tgt.px - camera.position.x) * 0.04;
        camera.position.y += (tgt.py - camera.position.y) * 0.04;
        camera.position.z += (tgt.pz - camera.position.z) * 0.04;
        camera.rotation.x += (tgt.rx - camera.rotation.x) * 0.04;
        camera.rotation.y += (tgt.ry - camera.rotation.y) * 0.04;

        // Counter animation and summary panel fade-in
        const counterProgress = Math.min(1, cinTimer / 2.5); // finish in 2.5s
        drawCounters(smoothStep(counterProgress));
        counterTexture.needsUpdate = true;
        if (summaryMesh) {
            const targetOp = Math.min(1, cinTimer / 1.5);
            summaryMesh.material.opacity += (targetOp - summaryMesh.material.opacity) * 0.05;
        }
        // Summary glow fades in too
        galleryGroup.children.forEach(c => {
            if (c.userData && c.userData.isSummaryGlow) {
                c.intensity += (2.0 - c.intensity) * 0.05;
            }
        });

        if (cinTimer >= 5.0) {
            cinState = CIN.TURN_TO_WALL;
            cinTimer = 0;
        }

    } else if (cinState === CIN.TURN_TO_WALL) {
        // 2.5s cinematic auto-turn to face the back wall
        cinTimer += delta;
        const t = Math.min(1, cinTimer / 2.5);
        const ease = smoothStep(t);

        // Interpolate camera from achievements pos to wall-facing pos
        const startPos = galleryCamTarget(n); // achievements view
        const endPx = 0, endPy = 1.6, endPz = ROOM_Z + (-5.5), endRx = 0, endRy = 0;
        const tpx = mix(startPos.px, endPx, ease);
        const tpy = mix(startPos.py, endPy, ease);
        const tpz = mix(startPos.pz, endPz, ease);
        const trx = mix(startPos.rx, endRx, ease);
        const try_ = mix(startPos.ry, endRy, ease);
        camera.position.x += (tpx - camera.position.x) * 0.06;
        camera.position.y += (tpy - camera.position.y) * 0.06;
        camera.position.z += (tpz - camera.position.z) * 0.06;
        camera.rotation.x += (trx - camera.rotation.x) * 0.06;
        camera.rotation.y += (try_ - camera.rotation.y) * 0.06;

        if (t >= 1) {
            cinState = CIN.WALL_REVEAL;
            cinTimer = 0;
            revealStarted = true;
            revealTimer = 0;
        }

    } else if (cinState === CIN.WALL_REVEAL) {
        // Wall rises with smoke — camera held facing the wall
        cinTimer += delta;
        const tpx = 0, tpy = 1.5, tpz = ROOM_Z - 5.5;
        camera.position.x += (tpx - camera.position.x) * 0.04;
        camera.position.y += (tpy - camera.position.y) * 0.04;
        camera.position.z += (tpz - camera.position.z) * 0.04;
        camera.rotation.x += ((-0.08) - camera.rotation.x) * 0.04;
        camera.rotation.y += ((0) - camera.rotation.y) * 0.04;

        if (cinTimer >= REVEAL_DURATION + 1.5) {
            cinState = CIN.STAIRS;
            setCinemaProgress(0.78);
            unlockScroll();
        }

    } else if (cinState === CIN.STAIRS) {
        // Scroll-driven staircase — uses WP waypoints (0.78→1.0)
        const cam = getCam(scrollProgress);
        camera.position.x += (cam.x - camera.position.x) * 0.06;
        camera.position.y += (cam.y - camera.position.y) * 0.06;
        camera.position.z += ((ROOM_Z + cam.z) - camera.position.z) * 0.06;
        camera.rotation.x += (cam.rx - camera.rotation.x) * 0.06;
        camera.rotation.y += (cam.ry - camera.rotation.y) * 0.06;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  CERT WALL EMERGENCE (runs every frame)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    certFrameGroups.forEach((fg, i) => {
        const p = certRevealProgress[i];
        if (p <= 0) return; // not yet triggered
        if (p < 1) {
            certRevealProgress[i] = Math.min(1, p + delta * 1.4); // ~0.7s emerge
        }
        const eased = smoothStep(certRevealProgress[i]);
        // Slight overshoot spring: goes to 1, overshoots slightly, settles
        const spring = eased < 1 ? eased : 1 + Math.sin((certRevealProgress[i] - 1) * Math.PI) * 0.04;
        const wallX = mix(WALL_X_HIDDEN, WALL_X, spring);
        fg.frame.position.x = wallX;
        fg.goldBorder.position.x = wallX;
        fg.certMesh.position.x = wallX - 0.02;
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  WALL REVEAL ANIMATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (revealWall && revealStarted && revealTimer < REVEAL_DURATION + 0.5) {
        revealTimer += delta;
        const revealT = Math.min(1, revealTimer / REVEAL_DURATION);
        const eased = smoothStep(revealT);
        revealWall.position.y = revealWall.userData.baseY + eased * 5.5;
        smokeParticles.material.opacity = Math.sin(revealT * Math.PI) * 0.6;
        const sArr = smokeGeo.attributes.position.array;
        for (let i = 0; i < sArr.length / 3; i++) {
            sArr[i * 3 + 1] += (Math.random() - 0.3) * delta * 2;
            sArr[i * 3] += (Math.random() - 0.5) * delta * 0.5;
        }
        smokeGeo.attributes.position.needsUpdate = true;
    }
    if (revealWall && revealTimer >= REVEAL_DURATION) {
        revealWall.visible = false;
        smokeParticles.material.opacity = Math.max(0, smokeParticles.material.opacity - delta * 0.5);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  RED PRESSURE PLATE STAIRS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (cinState === CIN.STAIRS && scrollProgress > 0.78) {
        const stairStart = 0.78, stairEnd = 0.97;
        const stairT = Math.min(1, Math.max(0, (scrollProgress - stairStart) / (stairEnd - stairStart)));
        const currentStep = Math.floor(stairT * steps.length);
        steps.forEach((step, i) => {
            if (i <= currentStep) {
                const gi = i === currentStep ? 1 : Math.max(0, 1 - (currentStep - i) * 0.15);
                step.material.emissive.setHex(0xff2200);
                step.material.emissiveIntensity = gi * 0.8;
                stepLights[i].intensity = gi * 2;
            } else {
                step.material.emissiveIntensity = 0;
                stepLights[i].intensity = 0;
            }
        });
        camera.position.y += Math.sin(stairT * steps.length * Math.PI) * 0.025;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  ALWAYS: Torch flicker + portal animations
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    galleryGroup.children.forEach(c => {
        if (c.userData && c.userData.isTorch && c.isLight) {
            c.intensity = 1.2 + Math.sin(time * 7 + c.position.x * 5) * 0.4;
        }
        if (c.userData && c.userData.isPortalRing) {
            c.rotation.z = time * c.userData.spinSpeed;
            c.rotation.x = Math.sin(time * 0.4 + c.userData.spinSpeed) * 0.12;
        }
        if (c.userData && c.userData.isPortalCore) {
            c.material.opacity = 0.25 + Math.sin(time * 1.5) * 0.15;
            c.scale.setScalar(1 + Math.sin(time * 0.8) * 0.05);
        }
        if (c.userData && c.userData.isPortalVortex) {
            const arr = c.geometry.attributes.position.array;
            for (let k = 0; k < arr.length / 3; k++) {
                const cx = arr[k * 3], cz = arr[k * 3 + 2] - c.position.z;
                const a = Math.atan2(cz, cx) + delta * 3;
                const r = Math.sqrt(cx * cx + cz * cz);
                arr[k * 3] = Math.cos(a) * r;
                arr[k * 3 + 2] = c.position.z + Math.sin(a) * r;
                arr[k * 3 + 1] += Math.sin(time * 4 + k * 0.5) * delta * 0.03;
            }
            c.geometry.attributes.position.needsUpdate = true;
        }
        if (c.userData && c.userData.isTendril) {
            const ta = c.userData.tendrilAngle + time * 0.5;
            const pulse = 1.8 + Math.sin(time * 3 + c.userData.tendrilAngle * 2) * 0.8;
            c.position.x = Math.cos(ta) * pulse;
            c.position.y = c.userData.basePos.y + Math.sin(ta * 2) * 0.3;
            c.intensity = 1.5 + Math.sin(time * 4 + c.userData.tendrilAngle) * 1;
        }
        if (c.userData && c.userData.isPortalLight) {
            c.intensity = 4 + Math.sin(time * 1.5) * 2.5;
        }
        if (c.userData && c.userData.isAura) {
            c.intensity = 1.5 + Math.sin(time * 0.8 + c.position.x) * 0.7;
        }
    });

    // ── Completion ──
    if (cinState === CIN.STAIRS && scrollProgress > 0.98 && !stairDone) {
        stairDone = true;
        if (onCompleteCallback) onCompleteCallback();
    }
}

function onGalleryComplete(cb) { onCompleteCallback = cb; }
function isGalleryDone() { return stairDone; }

export { createCertificates, updateCertificates, onGalleryComplete, isGalleryDone };


