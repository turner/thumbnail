import * as THREE from "./threejs_es6/three.module.js";

class Model {
    constructor ({ sx, sy, sz, geometry, material }) {

        this.sx = sx;
        this.sy = sy;
        this.sz = sz;

        this.geometry = geometry;
        this.material = material;

        this.mesh = new THREE.Mesh(geometry, material);

    }

    getBBox() {
        const { sx, sy, sz } = this;
        return { sx, sy, sz }
    }

    niceCameraPose () {

        const [ targetX, targetY, targetZ ] = [ 0, 0, 0 ];
        const target = new THREE.Vector3(targetX, targetY, targetZ);

        const { sx, sy, sz } = this;
        const dimen = Math.max(...[sx, sy, sz]);

        const [ locationX, locationY, locationZ ] = [ dimen, dimen, dimen ];
        const position = new THREE.Vector3(locationX, locationY, locationZ);

        return { target, position }
    }
}

export default Model;
