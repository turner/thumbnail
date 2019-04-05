import * as THREE from './threejs_es6/three.module.js';
import OrbitControls from './threejs_es6/orbit-controls-es6.js';
import { appleCrayonColorThreeJS, appleCrayonColorHexValue } from './color.js';

let scene;
let renderer;
let camera;
let orbitControl;

let showSTMaterial;

const showSTConfig =
    {
        uniforms: {},
        vertexShader: document.getElementById( 'show_st_vert' ).textContent,
        fragmentShader: document.getElementById( 'show_st_frag' ).textContent,
        side: THREE.DoubleSide
    };

showSTMaterial = new THREE.ShaderMaterial( showSTConfig );

let containerThreeJS;

const [ fov, near, far ] = [ 40, 1e-1, 7e2 ];

let [ viewport_width, viewport_height, scratchSpaceYOffset ] = [ 0, 0, 512 ];
let [ canvas_width, canvas_height ] = [ 0, 0 ];
let [ x, y, w, h ] = [ 0, 0, 0, 0 ];
let main = async(container) => {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    container.appendChild(renderer.domElement);
    containerThreeJS = container;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(appleCrayonColorHexValue('snow'));

    [ canvas_width, canvas_height ] = [ container.offsetWidth, container.offsetHeight + scratchSpaceYOffset ];
    [ viewport_width, viewport_height ] = [ container.offsetWidth, container.offsetHeight ];

    renderer.setSize(canvas_width, canvas_height);

    // sub-region of container
    [ x, y, w, h ] = [ viewport_width/3, scratchSpaceYOffset + viewport_height/3, viewport_width/3, viewport_height/3 ];
    renderer.setViewport(x, y, w, h);

    camera = new THREE.PerspectiveCamera(fov, viewport_width / viewport_height, near, far);
    orbitControl = new OrbitControls(camera, renderer.domElement);
    scene = new THREE.Scene();

    setup(scene, camera, orbitControl);

    renderLoop();

};

let poseViewport = ({ renderer, x, y, w, h }) => {

};

let target;
let planeMesh;
let setup = (scene, camera, orbitControl) => {

    scene.background = appleCrayonColorThreeJS('magnesium');

    const [ targetX, targetY, targetZ ] = [ 0, 0, 0 ];
    target = new THREE.Vector3(targetX, targetY, targetZ);

    const dimen = 16;

    let [ locationX, locationY, locationZ ] = [ dimen, dimen, dimen ];

    camera.position.set(locationX, locationY, locationZ);
    camera.lookAt( target );

    orbitControl.screenSpacePanning = false;
    orbitControl.target = target;
    orbitControl.update();

    const texture = new THREE.TextureLoader().load( 'texture/uv.png' );
    const textureMaterial = new THREE.MeshBasicMaterial( { map: texture } );

    const boxMesh = new THREE.Mesh(new THREE.BoxBufferGeometry( dimen, dimen/4, dimen/2, 4, 4, 4 ), showSTMaterial);
    scene.add( boxMesh );

    // const sphereMesh = new THREE.Mesh(new THREE.SphereBufferGeometry( dimen/2, 32, 16 ), showSTMaterial);
    // scene.add( sphereMesh );

    planeMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry( 2, 2, 8, 8 ), textureMaterial);
    planeMesh.matrixAutoUpdate = false;
    scene.add( planeMesh );

    window.addEventListener( 'resize', onWindowResize, false );

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

};

let onWindowResize = () => {

    [ canvas_width, canvas_height ] = [ containerThreeJS.offsetWidth, containerThreeJS.offsetHeight + scratchSpaceYOffset ];
    [ viewport_width, viewport_height ] = [ containerThreeJS.offsetWidth, containerThreeJS.offsetHeight ];

    renderer.setSize(canvas_width, canvas_height);

    // sub-region of container
    [ x, y, w, h ] = [ viewport_width/3, scratchSpaceYOffset + viewport_height/3, viewport_width/3, viewport_height/3 ];
    renderer.setViewport(x, y, w, h);

    camera.aspect = viewport_width / viewport_height;
    camera.updateProjectionMatrix();

};

export { main };
