import * as THREE from "three";
import Player from "./js/Player.js";
import Controls from "./js/Controls.js";

import './style.css';

const FIXED_STEP = 1 / 60;
const MAX_STEPS = 5;
let accumulator = 0;

const clock = new THREE.Clock();

const player = new Player();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const controls = new Controls(player.camera, document.body);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 2);
scene.add(dirLight);

// Floor
const floorGeo = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Walls
const wallMat = new THREE.MeshStandardMaterial({ color: 0xa0522d });
const wallGeo = new THREE.BoxGeometry(20, 5, 0.5);

const wall1 = new THREE.Mesh(wallGeo, wallMat);
wall1.position.set(0, 2.5, -10);
scene.add(wall1);

const wall2 = wall1.clone();
wall2.position.set(0, 2.5, 10);
scene.add(wall2);

const wall3 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5, 20), wallMat);
wall3.position.set(-10, 2.5, 0);
scene.add(wall3);

const wall4 = wall3.clone();
wall4.position.set(10, 2.5, 0);
scene.add(wall4);

const colliders = [wall1, wall2, wall3, wall4];

function animate() {
  const delta = clock.getDelta();
  accumulator += delta;

  let steps = 0;
  while (accumulator >= FIXED_STEP && steps < MAX_STEPS) {
    if (controls.isLocked) {
      player.update(FIXED_STEP, controls, colliders);
    }
    accumulator -= FIXED_STEP;
    steps++;
  }
  renderer.render(scene, player.camera);
}

renderer.setAnimationLoop(animate);

// Fire on click
window.addEventListener('click', () => {
  player.shoot(scene);
});