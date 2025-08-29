import * as THREE from "three";
import CapsuleCollider from "./CapsuleCollider.js";

class Player {
  constructor() {
    this.height = 1.8;
    this.collider = new CapsuleCollider(
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(0, this.height, 0),
      0.3
    );
  }
}


export default Player;