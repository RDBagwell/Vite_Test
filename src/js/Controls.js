import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
class Controls extends PointerLockControls {
    constructor(camera, domElement) {
        super(camera, domElement);
        this.keys = {}
        this.init();
    }
    init() {
        document.getElementById("blocker").addEventListener("click", () => this.lock());
        this.addEventListener("lock", () => document.getElementById("blocker").style.display = "none");
        this.addEventListener("unlock", () => document.getElementById("blocker").style.display = "flex");
        document.addEventListener("keydown", e => this.keys[e.code] = 1);
        document.addEventListener("keyup", e => this.keys[e.code] = 0);
    }
}

export default Controls;