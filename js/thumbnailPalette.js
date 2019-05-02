import * as THREE from './threejs_es6/three.module.js';
import { makeDraggable } from "./draggable.js";
import { fitToContainer } from "./utils.js";
import { appleCrayonColorHexValue, appleCrayonColorThreeJS } from "./color.js";

const [ fov, near, far ] = [ 40, 1e-1, 7e2 ];

let doRender = true;
class ThumbnailPalette {

    constructor ({ container, palette, renderer, model }) {

        // const $canvas = $(palette).find('canvas');
        // const canvas = $canvas.get(0);
        //
        // fitToContainer(canvas, window.devicePixelRatio);
        //
        // this.context = canvas.getContext('2d');
        //
        // this.canvas = canvas;

        // renderer
        const renderContainer = $(palette).find('#trace3d_thumbnail_container').get(0);
        const { width: renderWidth, height: renderHeight } = renderContainer.getBoundingClientRect();

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(renderWidth, renderHeight);

        // TODO: HACK HACK HACK. iInsert rendering canvas in DOM
        renderContainer.appendChild(renderer.domElement);

        renderer.setClearColor(appleCrayonColorHexValue('magnesium'));

        this.renderer = renderer;

        // camera
        this.camera = new THREE.PerspectiveCamera(fov, renderWidth / renderHeight, near, far);

        const { target, position } = model.niceCameraPose();
        this.camera.position.copy(position);
        this.camera.lookAt( target );

        // scene
        this.scene = new THREE.Scene();
        this.scene.background = appleCrayonColorThreeJS('aqua');

        this.scene.add(model.mesh);

        layout(container, palette);

        makeDraggable(palette, $(palette).find('.trace3d_card_drag_container').get(0));

        $(window).on('resize.thumbnail_palette', () => { this.onWindowResize(container, palette) });

    }

    getSize() {
        return { width: this.canvas.offsetWidth, height: this.canvas.offsetHeight }
    }

    render () {
        const { scene, camera } = this;
        this.renderer.render( scene, camera );
    }

    renderOneTime() {

        if (doRender) {

            this.render();

            /*
             const { width: renderWidth, height: renderHeight } = this.renderer.domElement;

            const { width, height } = this.getSize();

            const [ w, h ] = [ width, height ].map((pixelValue) => {
                return window.devicePixelRatio * pixelValue
            });

            // origin is at north-west corner of canvas: x-east, y-south
            this.context.drawImage(this.renderer.domElement, 0, 0, renderWidth, renderHeight, 0, 0, w, h);

             */


            doRender = false;
        }
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

export default ThumbnailPalette;
