import * as THREE from './threejs_es6/three.module.js';
import { makeDraggable } from "./draggable.js";
import { fitToContainer } from "./utils.js";
import { appleCrayonColorHexValue, appleCrayonColorThreeJS } from "./color.js";

const [ fov, near, far ] = [ 40, 1e-1, 7e2 ];

let doRender = true;
class ThumbnailPanel {

    constructor ({ container, palette, renderer, model, material }) {

        const $canvas = $(palette).find('canvas');
        const canvas = $canvas.get(0);

        fitToContainer(canvas, window.devicePixelRatio);

        this.context = canvas.getContext('2d');

        this.canvas = canvas;

        // renderer
        const renderContainer = $(palette).find('#trace3d_thumbnail_container').get(0);
        const { width: renderWidth, height: renderHeight } = renderContainer.getBoundingClientRect();

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(renderWidth, renderHeight);

        renderer.setClearColor(appleCrayonColorHexValue('sky'));

        this.renderer = renderer;

        // camera
        this.camera = new THREE.PerspectiveCamera(fov, renderWidth / renderHeight, near, far);

        const { target, position } = model.getCameraPoseAlongAxis('-z');
        this.camera.position.copy(position);
        this.camera.lookAt( target );

        // scene
        this.scene = new THREE.Scene();
        this.scene.background = appleCrayonColorThreeJS('sky');

        this.scene.add(new THREE.Mesh(model.geometry, material));

        layout(container, palette);

        makeDraggable(palette, $(palette).find('.trace3d_card_drag_container').get(0));

        $(window).on('resize.thumbnail_palette', () => { this.onWindowResize(container, palette) });

    }

    renderOneTime() {

        if (doRender) {

            this.render();

            const { width: rw, height: rh } = this.renderer.domElement;
            const { width:  w, height:  h } = this.canvas;

            // origin is at north-west corner of canvas: x-east, y-south
            this.context.drawImage(this.renderer.domElement, 0, 0, rw, rh, 0, 0, w, h);


            doRender = false;
        }
    }

    render () {
        const { scene, camera } = this;
        this.renderer.render( scene, camera );
    }

    onWindowResize(container, palette) {
        layout(container, palette);
    }

}

let layout = (container, palette) => {

    const { width: cw, height: ch } = container.getBoundingClientRect();
    const { width: pw, height: ph } = palette.getBoundingClientRect();

    const left = cw - 1.1 * pw;
    const  top = ch - 1.1 * ph;

    $(palette).offset( { left, top } );

};

export default ThumbnailPanel;
