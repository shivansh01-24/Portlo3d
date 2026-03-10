import * as THREE from 'three';
import camera from './camera.js';

// Create WebGL renderer with antialiasing for smooth edges
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
});

// Match device pixel ratio for sharp rendering on HiDPI screens
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Fill the entire viewport
renderer.setSize(window.innerWidth, window.innerHeight);

// Enable physically correct lighting for realistic materials later
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// Append the canvas element to the page
document.body.appendChild(renderer.domElement);

/**
 * Handle window resize — updates camera aspect ratio and renderer size
 */
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Listen for resize events
window.addEventListener('resize', handleResize);

export default renderer;
