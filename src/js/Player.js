import * as THREE from "three";
import CapsuleCollider from "./CapsuleCollider.js";
const SPEED = 4.0; // units per second
class Player {
  constructor() {
    this.height = 1.8;
    this.speed = SPEED;
    this.collider = new CapsuleCollider(
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(0, this.height, 0),
      0.3
    );
  }
}


export default Player;