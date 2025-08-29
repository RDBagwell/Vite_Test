import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as THREE from 'three';

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

export async function loadModel(path, scene) {
    const mesh = await loader.loadAsync(path);
    scene.add(mesh.scene);
    let mixer = null;
    if (mesh.animations && mesh.animations.length) {
        mixer = new THREE.AnimationMixer(mesh.scene);
    }
    return {
        mesh: mesh.scene,
        mixer: mixer,
        gltf: mesh
    };
}

export async function loadAnimation(model, clipName) {
    if (!model.mixer || !model.gltf.animations) return;
    const clip = THREE.AnimationClip.findByName(model.gltf.animations, clipName);
    if (!clip) return;
    const action = model.mixer.clipAction(clip);
    if (model.currentAction !== action) {
        if (model.currentAction) {
            model.currentAction.fadeOut(0.3);
        }
        action.reset().fadeIn(0.3).play();
        model.currentAction = action;
    }
}

