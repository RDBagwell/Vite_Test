import * as THREE from "three";
import CapsuleCollider from "./CapsuleCollider.js";
import { checkCollision } from "./helpers.js";
import Weapon from "./Weapon.js";

class Player {

  constructor(
    playerOptions = {
      height: 1.8,
      radius: 1,
      speed: 5
    },

  ) {
    this.height = playerOptions.height;
    this.radius = playerOptions.radius;
    this.speed = playerOptions.speed;

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
    this.camera.position.set(0, this.height, 0);
    
    this.raycaster = new THREE.Raycaster();

    this.collider = new CapsuleCollider(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, this.height, 0),
      this.radius
    );
    // Track previous and current camera positions for interpolation
    this.prevCameraPos = new THREE.Vector3(0, this.height, 0);
    this.currCameraPos = new THREE.Vector3(0, this.height, 0);

    // --- Weapon system ---
    this.weapon = new Weapon(this.camera);

  }

  shoot(scene) {
    this.weapon.shoot(scene, this.camera);
  }

  update(delta, inputVec, colliders) {
    // Save current position as "previous" before updating
    this.prevCameraPos.copy(this.currCameraPos);

    // 1) Key amounts
    const forwardAmt = (inputVec.keys["KeyW"] ? 1 : 0) - (inputVec.keys["KeyS"] ? 1 : 0);
    const rightAmt = (inputVec.keys["KeyD"] ? 1 : 0) - (inputVec.keys["KeyA"] ? 1 : 0);

    // 2) Camera forward/right (flatten Y so movement stays on ground)
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // 3) Intended step this frame (no velocity accumulator = crisp inputVec)
    const step = new THREE.Vector3();
    step.addScaledVector(forward, forwardAmt);
    step.addScaledVector(right, rightAmt);

    if (step.lengthSq() === 0) return;

    if (step.lengthSq() > 0) {
      step.normalize().multiplyScalar(this.speed * Math.min(delta, 0.05));

      const before = { start: this.collider.start.clone(), end: this.collider.end.clone() };
      this.collider.translate(step);

      const collided = checkCollision(colliders, this.collider);

      if (collided) {
        // Undo Move
        this.collider.start.copy(before.start);
        this.collider.end.copy(before.end);

        const normal = collided.normal;
        const slide = step.clone().projectOnPlane(normal);

        // Try slide move
        this.collider.translate(slide);
        const collidedSlide = checkCollision(colliders, this.collider);
        if (collidedSlide) {
          // Undo Slide
          this.collider.start.copy(before.start);
          this.collider.end.copy(before.end);
        }
      }

    }

    // Update current camera position from collider
    this.currCameraPos.copy(this.collider.end).add(new THREE.Vector3(0, -0.1, 0));
    this.camera.position.copy(this.currCameraPos);
  }
}


export default Player;