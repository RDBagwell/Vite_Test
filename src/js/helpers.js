import * as THREE from "three";

const _box = new THREE.Box3();
const _center = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _absDir = new THREE.Vector3();

export function checkCollision(colliders, playerCollider) {
    let closest = null;
    let minDist = Infinity;

    for (let obj of colliders) {
        if (!obj.isMesh) continue;

        _box.setFromObject(obj).expandByScalar(playerCollider.radius);

        for (let p of [playerCollider.start, playerCollider.end]) {
            if (_box.containsPoint(p)) {
                _box.getCenter(_center);
                _dir.subVectors(p, _center);

                if (_dir.lengthSq() === 0) continue;

                _absDir.set(Math.abs(_dir.x), Math.abs(_dir.y), Math.abs(_dir.z));

                let normal = new THREE.Vector3();
                if (_absDir.x > _absDir.y && _absDir.x > _absDir.z) {
                    normal.set(Math.sign(_dir.x), 0, 0);
                } else if (_absDir.y > _absDir.x && _absDir.y > _absDir.z) {
                    normal.set(0, Math.sign(_dir.y), 0);
                } else {
                    normal.set(0, 0, Math.sign(_dir.z));
                }

                const dist = _dir.lengthSq();
                if (dist < minDist) {
                    minDist = dist;
                    closest = {
                        normal: normal.clone(),
                        point: p.clone(),
                        depth: Math.sqrt(dist),
                        obj
                    };
                }
            }
        }
    }

    return closest;
}
