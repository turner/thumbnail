import * as THREE from './threejs_es6/three.module.js';
import OrbitControls from './threejs_es6/orbit-controls-es6.js';
import ThumbnailPanel from './thumbnailPanel.js';
import MeshModel from './meshModel.js';

import { appleCrayonColorThreeJS, appleCrayonColorHexValue } from './color.js';

let scene;
let renderer;
let camera;
let orbitControl;

let thumbnailPanel;

let showSTMaterial;

const showSTConfig =
    {
        uniforms: {},
        vertexShader: document.getElementById( 'show_st_vert' ).textContent,
        fragmentShader: document.getElementById( 'show_st_frag' ).textContent,
        side: THREE.DoubleSide
    };

showSTMaterial = new THREE.ShaderMaterial( showSTConfig );

const [ fov, near, far ] = [ 40, 1e-1, 7e2 ];

let textureMaterial;

let rootContainer;

let model;
let boxGeometry;

let main = async(container) => {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    container.appendChild(renderer.domElement);

    rootContainer = container;

    const { offsetWidth: cw, offsetHeight: ch } = container;
    camera = new THREE.PerspectiveCamera(fov, cw / ch, near, far);

    orbitControl = new OrbitControls(camera, renderer.domElement);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(appleCrayonColorHexValue('snow'));

    setRendererSize({ renderer, containerSize: { width: cw, height: ch } });

    scene = new THREE.Scene();
    scene.background = appleCrayonColorThreeJS('magnesium');

    const textureLoader = new THREE.TextureLoader();

    const onLoad = (texture) => {

        textureMaterial = new THREE.MeshBasicMaterial( { map: texture } );

        const dimen = 16;
        const [ sx, sy, sz, tessx, tessy, tessz, material ] = [ dimen, dimen/4, dimen/2, 4, 4, 4, showSTMaterial ];
        boxGeometry = new THREE.BoxBufferGeometry( sx, sy, sz, tessx, tessy, tessz );
        model = new MeshModel({ sx, sy, sz, geometry: boxGeometry, material });

        const thumbnailPanelConfig =
            {
                container,
                palette: $('#trace3d_thumbnail_palette').get(0),
                renderer: new THREE.WebGLRenderer(),
                model,
                material: new THREE.MeshBasicMaterial({ color: appleCrayonColorThreeJS('salmon') })
            };

        thumbnailPanel = new ThumbnailPanel(thumbnailPanelConfig);

        setup(scene, camera, orbitControl);
        renderLoop();
    };

    const onProgress = () => { };

    const onError = (error) => {
        console.log(error.message)
    };

    textureLoader.load( 'texture/uv.png', onLoad, onProgress, onError );

};

let target;
let planeMesh;
let setup = (scene, camera, orbitControl) => {

    const { target:_t, position } = model.getNiceCameraPose();
    target = _t;

    camera.position.copy(position);
    camera.lookAt( target );

    orbitControl.screenSpacePanning = false;
    orbitControl.target = target;
    orbitControl.update();

    scene.add(model.mesh);

    planeMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry( 2, 2, 8, 8 ), textureMaterial);
    // planeMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry( 2, 2, 8, 8 ), showSTMaterial);
    planeMesh.matrixAutoUpdate = false;
    scene.add( planeMesh );

    window.addEventListener( 'resize', onWindowResize, false );

};

let setRendererSize = ({ renderer, containerSize }) => {
    const { width: cw, height: ch } = containerSize;
    renderer.setSize(cw, ch);
};

let matrix4Factory = new THREE.Matrix4();
matrix4Factory.identity();

let vector3factory = new THREE.Vector3();
vector3factory.set(0, 0, 0);

let renderLoop = () => {

    requestAnimationFrame( renderLoop );

    orbitControl.update();
    camera.updateMatrixWorld();

    const distanceFromCamera = 0.9 * far;
    // const distanceFromCamera = camera.position.length();

    // A - Scale camera plane to fill viewing frustrum
    const dimension = distanceFromCamera * Math.tan( THREE.Math.degToRad( camera.fov/2 ) );
    const A = matrix4Factory.clone().makeScale(camera.aspect * dimension, dimension, 1);

    // B - Extract rotation by zeroing out translation. Invert resultant orthonormal matrix by transpose.
    const B = camera.matrixWorldInverse.clone().setPosition(vector3factory).transpose();

    // C - Translate rotated camera plane to camera origin
    const C = matrix4Factory.clone().makeTranslation(camera.position.x, camera.position.y, camera.position.z);

    // D - Position camera plane by translating it along camera look-at vector direction.
    const translation = vector3factory.clone().subVectors(target, camera.position).normalize().multiplyScalar(distanceFromCamera);
    const D = matrix4Factory.clone().makeTranslation(translation.x, translation.y, translation.z);

    // B * A
    // const BA = A.clone().premultiply(B);

    // C * B * A
    // const CBA = BA.clone().premultiply(C);

    // D * C * B * A
    // const DCBA = CBA.clone().premultiply(D);

    const cameraPlaneTransform = A.clone().premultiply(B).premultiply(C).premultiply(D).clone();
    // const cameraPlaneTransform = A.clone().premultiply(B).clone();

    // prettyMatrix4Print('A', A);
    // prettyMatrix4Print('B', B);
    // prettyMatrix4Print('C', C);
    // prettyMatrix4Print('D', D);

    // prettyMatrix4Print('BA', BA);
    // prettyMatrix4Print('CBA', CBA);
    // prettyMatrix4Print('DCBA', DCBA);

    // prettyMatrix4Print('camera - matrixWorld', camera.matrixWorld);
    // prettyMatrix4Print('matrixWorldInverse', camera.matrixWorldInverse);

    planeMesh.matrix.copy( cameraPlaneTransform );

    renderer.render(scene, camera);

    thumbnailPanel.renderOneTime();

};

let onWindowResize = () => {

    const { offsetWidth: cw, offsetHeight: ch } = rootContainer;

    setRendererSize({ renderer, containerSize: { width: cw, height: ch } });

    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();

};

export { main };
