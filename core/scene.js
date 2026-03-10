import * as THREE from 'three';

// Create the main scene
const scene = new THREE.Scene();

// Dark background for the cinematic feel
scene.background = new THREE.Color(0x0a0a0a);

// Add fog for depth atmosphere — objects fade into darkness
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.035);

export default scene;
