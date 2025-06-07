import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();

// incorrect way to do this VVV
// loader.loadAsync( 'public/quack.glb', function ( gltf ) {
//     scene.add( gltf.scene );
// }, undefined, function ( error ) {
//     console.error( error );
// } );

camera.position.z = 5;

function animate() {
    // quack.rotation.x += 0.01;
    // quack.rotation.y += 0.01;
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );