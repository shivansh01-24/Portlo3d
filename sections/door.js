import * as THREE from 'three';

/**
 * Door Section — Grand VIP Gate with white glowing portal
 *
 * Two spotlights illuminate a grand gate.
 * Behind the door is a bright white glowing screen.
 * When the door opens, the white glow is visible.
 * User must CLICK the white glow to teleport (white flash fills screen → room).
 */

const DOOR_Z = -5;
const DOOR_WIDTH = 3.5;
const DOOR_HEIGHT = 4.5;
const FRAME_THICKNESS = 0.3;
const DOOR_DEPTH = 0.15;

let doorGroup;
let leftDoor, rightDoor;
let doorGlow;
let openProgress = 0;
let roomFlashOverlay = null;
let roomFlashTriggered = false;
let onEnterCallback = null;
let glowMesh = null;

const FRAME_COLOR = 0x1a1a2e;
const DOOR_COLOR = 0x111827;
const ACCENT_COLOR = 0xc9a84c;

function createDoor() {
    doorGroup = new THREE.Group();
    doorGroup.position.set(0, 0, DOOR_Z);

    // ── Floor ──
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshStandardMaterial({ color: 0x0a0a10, roughness: 0.95, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    doorGroup.add(floor);

    // ── Back wall ──
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 6),
        new THREE.MeshStandardMaterial({ color: 0x0d0d15, roughness: 0.9, metalness: 0.05 })
    );
    backWall.position.set(0, 3, -0.3);
    doorGroup.add(backWall);

    // ── Door Frame ──
    const frameMat = new THREE.MeshStandardMaterial({ color: FRAME_COLOR, roughness: 0.35, metalness: 0.7 });
    const pillarMat = new THREE.MeshStandardMaterial({ color: FRAME_COLOR, roughness: 0.3, metalness: 0.8 });

    // Top beam
    const topBeam = new THREE.Mesh(
        new THREE.BoxGeometry(DOOR_WIDTH + FRAME_THICKNESS * 3, FRAME_THICKNESS * 1.5, FRAME_THICKNESS * 2.5),
        frameMat
    );
    topBeam.position.set(0, DOOR_HEIGHT + FRAME_THICKNESS * 0.3, 0);
    doorGroup.add(topBeam);

    // Pillars
    const leftPillar = new THREE.Mesh(
        new THREE.BoxGeometry(FRAME_THICKNESS * 1.5, DOOR_HEIGHT + FRAME_THICKNESS, FRAME_THICKNESS * 2.5),
        pillarMat
    );
    leftPillar.position.set(-DOOR_WIDTH / 2 - FRAME_THICKNESS, DOOR_HEIGHT / 2, 0);
    doorGroup.add(leftPillar);
    const rightPillar = leftPillar.clone();
    rightPillar.position.x = DOOR_WIDTH / 2 + FRAME_THICKNESS;
    doorGroup.add(rightPillar);

    // Gold trim
    const trimMat = new THREE.MeshStandardMaterial({
        color: ACCENT_COLOR, roughness: 0.2, metalness: 0.95,
        emissive: ACCENT_COLOR, emissiveIntensity: 0.15,
    });

    [-1, 1].forEach(side => {
        const trim = new THREE.Mesh(new THREE.BoxGeometry(0.04, DOOR_HEIGHT, 0.04), trimMat);
        trim.position.set(side * (DOOR_WIDTH / 2 + FRAME_THICKNESS * 0.3), DOOR_HEIGHT / 2, FRAME_THICKNESS);
        doorGroup.add(trim);
        for (let y = 0.8; y < DOOR_HEIGHT; y += 1.2) {
            const orn = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.06), trimMat);
            orn.position.set(side * (DOOR_WIDTH / 2 + FRAME_THICKNESS), y, FRAME_THICKNESS * 1.1);
            orn.rotation.z = Math.PI / 4;
            doorGroup.add(orn);
        }
    });

    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(DOOR_WIDTH + FRAME_THICKNESS * 2, 0.04, 0.06), trimMat);
    topTrim.position.set(0, DOOR_HEIGHT + FRAME_THICKNESS * 0.8, FRAME_THICKNESS);
    doorGroup.add(topTrim);

    // ── Door Panels ──
    const doorMat = new THREE.MeshStandardMaterial({ color: DOOR_COLOR, roughness: 0.5, metalness: 0.5 });
    const handleMat = new THREE.MeshStandardMaterial({
        color: ACCENT_COLOR, roughness: 0.15, metalness: 0.95,
        emissive: ACCENT_COLOR, emissiveIntensity: 0.3,
    });

    // Left door
    const leftPivot = new THREE.Group();
    leftPivot.position.set(-DOOR_WIDTH / 2, 0, 0);
    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_WIDTH / 2, DOOR_HEIGHT, DOOR_DEPTH), doorMat);
    leftPanel.position.set(DOOR_WIDTH / 4, DOOR_HEIGHT / 2, 0);
    leftPivot.add(leftPanel);
    addPanelDetails(leftPivot, DOOR_WIDTH / 4);
    const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.1), handleMat);
    h1.position.set(DOOR_WIDTH / 2 - 0.2, DOOR_HEIGHT * 0.48, DOOR_DEPTH / 2 + 0.06);
    leftPivot.add(h1);
    const hp1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.03), handleMat);
    hp1.position.set(DOOR_WIDTH / 2 - 0.2, DOOR_HEIGHT * 0.48, DOOR_DEPTH / 2 + 0.02);
    leftPivot.add(hp1);
    doorGroup.add(leftPivot);
    leftDoor = leftPivot;

    // Right door
    const rightPivot = new THREE.Group();
    rightPivot.position.set(DOOR_WIDTH / 2, 0, 0);
    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_WIDTH / 2, DOOR_HEIGHT, DOOR_DEPTH), doorMat);
    rightPanel.position.set(-DOOR_WIDTH / 4, DOOR_HEIGHT / 2, 0);
    rightPivot.add(rightPanel);
    addPanelDetails(rightPivot, -DOOR_WIDTH / 4);
    const h2 = h1.clone(); h2.position.set(-DOOR_WIDTH / 2 + 0.2, DOOR_HEIGHT * 0.48, DOOR_DEPTH / 2 + 0.06);
    rightPivot.add(h2);
    const hp2 = hp1.clone(); hp2.position.set(-DOOR_WIDTH / 2 + 0.2, DOOR_HEIGHT * 0.48, DOOR_DEPTH / 2 + 0.02);
    rightPivot.add(hp2);
    doorGroup.add(rightPivot);
    rightDoor = rightPivot;

    // ═══════════════════════════════
    //  BRIGHT WHITE GLOWING SCREEN behind the door
    // ═══════════════════════════════
    const glowGeo = new THREE.PlaneGeometry(DOOR_WIDTH * 0.95, DOOR_HEIGHT * 0.98);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
    });
    glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(0, DOOR_HEIGHT / 2, -0.25);
    glowMesh.userData.isPortal = true; // For raycaster detection
    doorGroup.add(glowMesh);

    // Strong white light behind door
    const portalLight = new THREE.PointLight(0xffffff, 0, 20);
    portalLight.position.set(0, DOOR_HEIGHT / 2, -1);
    portalLight.userData.isPortalLight = true;
    doorGroup.add(portalLight);

    // ═══════════════════════════════
    //  TWO SPOTLIGHTS — Focus on the gate
    // ═══════════════════════════════
    const spotTargetL = new THREE.Object3D();
    spotTargetL.position.set(-DOOR_WIDTH / 4, DOOR_HEIGHT / 2, 0);
    doorGroup.add(spotTargetL);

    const spotTargetR = new THREE.Object3D();
    spotTargetR.position.set(DOOR_WIDTH / 4, DOOR_HEIGHT / 2, 0);
    doorGroup.add(spotTargetR);

    const spotLeft = new THREE.SpotLight(0xffeedd, 40, 14, Math.PI / 5, 0.5, 1);
    spotLeft.position.set(-6, 5, 5);
    spotLeft.target = spotTargetL;
    doorGroup.add(spotLeft);

    const spotRight = new THREE.SpotLight(0xffeedd, 40, 14, Math.PI / 5, 0.5, 1);
    spotRight.position.set(6, 5, 5);
    spotRight.target = spotTargetR;
    doorGroup.add(spotRight);

    // Visible light cone hints
    [-1, 1].forEach(side => {
        const cone = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 1, 8, 8, 1, true),
            new THREE.MeshBasicMaterial({
                color: 0xffeedd, transparent: true, opacity: 0.03,
                side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
            })
        );
        cone.position.set(side * 5.5, 3.5, 3.5);
        cone.rotation.z = side * 0.4;
        cone.rotation.x = -0.25;
        doorGroup.add(cone);
    });

    // ── Dust particles ──
    const dustCount = 100;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 8;
        dustPos[i * 3 + 1] = Math.random() * 5 + 0.2;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
        size: 0.04, color: 0xffeedd, transparent: true, opacity: 0.25,
        blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    dust.userData.isDust = true;
    doorGroup.add(dust);

    // ── Room flash overlay (for click-to-enter) ──
    roomFlashOverlay = document.createElement('div');
    roomFlashOverlay.id = 'room-flash';
    roomFlashOverlay.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: #ffffff;
    z-index: 500; pointer-events: none;
    opacity: 0;
  `;
    document.body.appendChild(roomFlashOverlay);

    return doorGroup;
}

function addPanelDetails(parent, centerX) {
    const detailMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1e, roughness: 0.6, metalness: 0.3 });
    const trimMat = new THREE.MeshStandardMaterial({
        color: ACCENT_COLOR, roughness: 0.3, metalness: 0.9, emissive: ACCENT_COLOR, emissiveIntensity: 0.1,
    });
    [{ y: DOOR_HEIGHT * 0.72, h: DOOR_HEIGHT * 0.18 }, { y: DOOR_HEIGHT * 0.35, h: DOOR_HEIGHT * 0.22 }].forEach(({ y, h }) => {
        const inset = new THREE.Mesh(new THREE.BoxGeometry(DOOR_WIDTH / 2 - 0.4, h, DOOR_DEPTH + 0.02), detailMat);
        inset.position.set(centerX, y, 0.01);
        parent.add(inset);
        const border = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(DOOR_WIDTH / 2 - 0.35, h + 0.04, DOOR_DEPTH + 0.03)),
            new THREE.LineBasicMaterial({ color: ACCENT_COLOR, transparent: true, opacity: 0.5 })
        );
        border.position.copy(inset.position);
        parent.add(border);
    });
}

/**
 * Update door
 */
function updateDoor(delta, scrollProgress) {
    if (!doorGroup) return;
    const time = performance.now() * 0.001;

    // Door opens between scroll 0.14 and 0.24
    const openStart = 0.14;
    const openEnd = 0.24;

    if (scrollProgress > openStart) {
        const t = Math.min(1, (scrollProgress - openStart) / (openEnd - openStart));
        openProgress = 1 - Math.pow(1 - t, 3);
    } else {
        openProgress = 0;
    }

    // Swing doors
    const maxAngle = Math.PI / 2.2;
    leftDoor.rotation.y = -openProgress * maxAngle;
    rightDoor.rotation.y = openProgress * maxAngle;

    // White glow behind the door — visible as doors open
    glowMesh.material.opacity = openProgress * 0.9;

    // Portal light intensity
    doorGroup.children.forEach(child => {
        if (child.userData.isPortalLight) {
            child.intensity = openProgress * 12;
        }
    });

    // Handle glow when closed
    if (openProgress < 0.1) {
        const hp = 0.3 + Math.sin(time * 3) * 0.3;
        [leftDoor, rightDoor].forEach(pivot => {
            pivot.children.forEach(c => {
                if (c.material && c.material.metalness > 0.9) c.material.emissiveIntensity = hp;
            });
        });
    }

    // Auto-trigger room entry when camera collides with white wall
    if (openProgress > 0.9 && !roomFlashTriggered) {
        triggerRoomEnter();
    }

    // Dust float
    doorGroup.children.forEach(child => {
        if (child.userData.isDust) {
            const pos = child.geometry.attributes.position.array;
            for (let i = 0; i < pos.length / 3; i++) {
                pos[i * 3] += Math.sin(time * 0.5 + i * 0.5) * delta * 0.03;
                pos[i * 3 + 1] += Math.sin(time * 0.3 + i * 0.3) * delta * 0.02;
            }
            child.geometry.attributes.position.needsUpdate = true;
        }
    });
}

/**
 * Trigger the white flash room transition (called on click)
 */
function triggerRoomEnter() {
    if (roomFlashTriggered) return;
    roomFlashTriggered = true;

    // MASSIVE white flash — camera hit the white wall
    roomFlashOverlay.style.transition = 'opacity 0.1s ease';
    roomFlashOverlay.style.opacity = '1';

    // Hold white, then slowly fade out to reveal the room
    setTimeout(() => {
        roomFlashOverlay.style.transition = 'opacity 2s ease';
        roomFlashOverlay.style.opacity = '0';
        if (onEnterCallback) onEnterCallback();
        setTimeout(() => { if (roomFlashOverlay) roomFlashOverlay.remove(); }, 2100);
    }, 600);
}

function isDoorOpen() { return openProgress > 0.95; }
function onDoorEnter(cb) { onEnterCallback = cb; }

export { createDoor, updateDoor, isDoorOpen, onDoorEnter };
