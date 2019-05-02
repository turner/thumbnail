
import { makeDraggable } from "./draggable.js";
import { fitToContainer } from "./utils.js";


let doRender = true;
class ThumbnailPalette {

    constructor ({ container, palette }) {

        this.renderCanvasRealEstateHeight = 768;

        // ramp canvas
        const $canvas = $(palette).find('canvas');
        const canvas = $canvas.get(0);

        fitToContainer(canvas, window.devicePixelRatio);

        this.context = canvas.getContext('2d');

        this.canvas = canvas;
        console.log('thumbnail canvas ' + this.canvas.offsetWidth + ' ' + this.canvas.offsetHeight);

        layout(container, palette);

        makeDraggable(palette, $(palette).find('.trace3d_card_drag_container').get(0));

        $(window).on('resize.thumbnail_palette', () => {
            this.onWindowResize(container, palette)
        });


    }

    getSize() {
        return { width: this.canvas.offsetWidth, height: this.canvas.offsetHeight }
    }

    renderOneTime({ renderCanvas }) {

        if (doRender) {

            const { offsetWidth: renderWidth, offsetHeight: renderHeight } = renderCanvas;

            const { width, height } = this.getSize();

            const [ rw, rh, w, h ] = [ renderWidth, renderHeight - this.renderCanvasRealEstateHeight, width, height ].map((pixelValue) => {
                return window.devicePixelRatio * pixelValue
            });

            // origin is at north-west corner of canvas: x-east, y-south
            this.context.drawImage(renderCanvas, 0, 0, rw, rh, 0, 0, w, h);

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
