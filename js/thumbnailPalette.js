
import { makeDraggable } from "./draggable.js";
import { fitToContainer } from "./utils.js";

class ThumbnailPalette {

    constructor ({ container, palette }) {

        // ramp canvas
        const $canvas = $(palette).find('canvas');
        const canvas = $canvas.get(0);

        fitToContainer(canvas, window.devicePixelRatio);

        this.context = canvas.getContext('2d');

        this.canvas = canvas;
        console.log('thumbnail canvas ' + this.canvas.offsetWidth + ' ' + this.canvas.offsetHeight);

        layout(container, palette);

        makeDraggable(palette, $(palette).find('.trace3d_card_drag_container').get(0));

    }

    render({ sceneCanvas, thumbnailRect }) {

        const { offsetWidth, offsetHeight } = this.canvas;

        const yTop = sceneCanvas.offsetHeight - (offsetHeight + thumbnailRect.y);

        const [ sx, sy, w, h ] = [ thumbnailRect.x, yTop, offsetWidth, offsetHeight ].map((a) => { return window.devicePixelRatio * a });
        this.context.drawImage(sceneCanvas, sx, sy, w, h, 0, 0, w, h);
    }
}

let layout = (container, element) => {

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const left = containerRect.width - 1.1 * elementRect.width;
    const top = containerRect.height - 1.1 * elementRect.height;

    $(element).offset( { left, top } );

};

export default ThumbnailPalette;
