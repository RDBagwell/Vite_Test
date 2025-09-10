import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class Weapon {
  constructor(camera, modelPath = "public/models/pistol.glb") {
    this.mesh = new THREE.Group();

    this.props = {
      damage: 10,
      range: 100,
      cooldown: 500, // ms
      lastShot: 0,
    };

    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const weaponModel = gltf.scene;

        // Reset transforms
        weaponModel.rotation.set(0, 0, 0);
        weaponModel.position.set(0, 0, 0);
        weaponModel.scale.set(1, 1, 1);

        // Normalize size
        const box = new THREE.Box3().setFromObject(weaponModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 0.60 / maxDim;
        weaponModel.scale.setScalar(scaleFactor);

        // Container for positioning relative to camera
        this.weaponContainer = new THREE.Group();
        this.weaponContainer.position.set(0.3, -0.2, -0.6);
        this.weaponContainer.add(weaponModel);
        this.mesh.add(this.weaponContainer);

        // --- Detect "muzzle" node ---
        this.muzzlePoint = weaponModel.getObjectByName("muzzle");

        if (!this.muzzlePoint) {
          console.warn("⚠️ Weapon model has no 'muzzle' bone/empty, using fallback.");
          this.muzzlePoint = new THREE.Object3D();
          this.muzzlePoint.position.set(0, 0, -0.5); // fallback position
          this.weaponContainer.add(this.muzzlePoint);
        }

        // --- Muzzle flash ---
        this.muzzleFlash = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xffff00 })
        );
        this.muzzleFlash.visible = false;

        this.muzzlePoint.add(this.muzzleFlash); // attach directly to muzzle
      },
      undefined,
      (error) => {
        console.error("Error loading weapon model:", error);
      }
    );

    camera.add(this.mesh);

    this.raycaster = new THREE.Raycaster();
  }

  shoot(scene, camera) {
    const now = performance.now();
    if (now - this.props.lastShot < this.props.cooldown) return;
    this.props.lastShot = now;

    // Flash
    if (this.muzzleFlash) {
      this.muzzleFlash.visible = true;
      setTimeout(() => (this.muzzleFlash.visible = false), 80);
    }

    // Raycast
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = this.raycaster.intersectObjects(scene.children, false);

    // Start from muzzle world position
    const start = new THREE.Vector3();
    this.muzzlePoint.getWorldPosition(start);

    let end;
    if (intersects.length > 0) {
      end = intersects[0].point;
    } else {
      end = start
        .clone()
        .add(this.raycaster.ray.direction.clone().multiplyScalar(this.props.range));
    }

    // Tracer
    const tracerMat = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const tracerGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const tracer = new THREE.Line(tracerGeo, tracerMat);
    scene.add(tracer);
    setTimeout(() => scene.remove(tracer), 100);
  }
}

export default Weapon;
