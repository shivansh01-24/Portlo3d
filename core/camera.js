import * as THREE from 'three';

// Create perspective camera — FOV 60 gives a natural field of view
const camera = new THREE.PerspectiveCamera(
    60,                                      // Field of view
    window.innerWidth / window.innerHeight,  // Aspect ratio
    0.1,                                     // Near clipping plane
    1000                                     // Far clipping plane
);

// Position at approximate eye-height, slightly back from origin
camera.position.set(0, 1.6, 5);

export default camera;
