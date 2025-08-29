import './style.css'

import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const playerHeight = 1.8;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, playerHeight, 0);

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

// Capsule Collider Class
class CapsuleCollider {
  constructor(start, end, radius) {
    this.start = start;
    this.end = end;
    this.radius = radius;
  }
  translate(offset) {
    this.start.add(offset);
    this.end.add(offset);
  }
}


const playerCollider = new CapsuleCollider(
  new THREE.Vector3(0, 0.3, 0),
  new THREE.Vector3(0, playerHeight, 0),
  0.3
);

const controls = new PointerLockControls(camera, document.body);
document.getElementById("blocker").addEventListener("click", () => controls.lock());
controls.addEventListener("lock", () => document.getElementById("blocker").style.display = "none");
controls.addEventListener("unlock", () => document.getElementById("blocker").style.display = "flex");

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

function updatePlayer(delta) {
  const SPEED = 4.0; // units per second

  // 1) Key amounts
  const forwardAmt = (keys["KeyW"] ? 1 : 0) - (keys["KeyS"] ? 1 : 0);
  const rightAmt   = (keys["KeyD"] ? 1 : 0) - (keys["KeyA"] ? 1 : 0);

  // 2) Camera forward/right (flatten Y so movement stays on ground)
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);  // direction camera is looking
  forward.y = 0;
  if (forward.lengthSq() > 0) forward.normalize();

  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

  // 3) Intended step this frame (no velocity accumulator = crisp controls)
  const step = new THREE.Vector3();
  step.addScaledVector(forward, forwardAmt);
  step.addScaledVector(right, rightAmt);

  if (step.lengthSq() > 0) {
    step.normalize().multiplyScalar(SPEED * delta);

    // Try full move
    const before = { start: playerCollider.start.clone(), end: playerCollider.end.clone() };
    playerCollider.translate(step);

    // 4) Basic collision + slide
    let collided = false;
    for (let obj of colliders) {
      const box = new THREE.Box3().setFromObject(obj).expandByScalar(playerCollider.radius);
      if (box.containsPoint(playerCollider.start) || box.containsPoint(playerCollider.end)) {
        collided = true;
        break;
      }
    }

    if (collided) {
      // Undo, then try X-only slide, then Z-only slide
      playerCollider.start.copy(before.start);
      playerCollider.end.copy(before.end);

      const stepX = new THREE.Vector3(step.x, 0, 0);
      if (stepX.x !== 0) {
        playerCollider.translate(stepX);
        let hitX = false;
        for (let obj of colliders) {
          const box = new THREE.Box3().setFromObject(obj).expandByScalar(playerCollider.radius);
          if (box.containsPoint(playerCollider.start) || box.containsPoint(playerCollider.end)) { hitX = true; break; }
        }
        if (hitX) {
          // undo X
          playerCollider.start.copy(before.start);
          playerCollider.end.copy(before.end);
        } else {
          // keep X, try Z next relative to current
          const afterX = { start: playerCollider.start.clone(), end: playerCollider.end.clone() };
          const stepZ = new THREE.Vector3(0, 0, step.z);
          if (stepZ.z !== 0) {
            playerCollider.translate(stepZ);
            let hitZ = false;
            for (let obj of colliders) {
              const box = new THREE.Box3().setFromObject(obj).expandByScalar(playerCollider.radius);
              if (box.containsPoint(playerCollider.start) || box.containsPoint(playerCollider.end)) { hitZ = true; break; }
            }
            if (hitZ) {
              // undo Z only
              playerCollider.start.copy(afterX.start);
              playerCollider.end.copy(afterX.end);
            }
          }
        }
      } else if (step.z !== 0) {
        // Only Z to try
        const stepZ = new THREE.Vector3(0, 0, step.z);
        playerCollider.translate(stepZ);
        let hitZ = false;
        for (let obj of colliders) {
          const box = new THREE.Box3().setFromObject(obj).expandByScalar(playerCollider.radius);
          if (box.containsPoint(playerCollider.start) || box.containsPoint(playerCollider.end)) { hitZ = true; break; }
        }
        if (hitZ) {
          // undo Z
          playerCollider.start.copy(before.start);
          playerCollider.end.copy(before.end);
        }
      }
    }
  }

  // Put the camera at eye height (capsule top)
  camera.position.copy(playerCollider.end);
}


function animate() {
  requestAnimationFrame(animate);
  if (controls.isLocked) {
    updatePlayer(0.2);
  }
  renderer.render(scene, camera);
}
animate();