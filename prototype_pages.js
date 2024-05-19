import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import group, { init, update } from './page48'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 500 );


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


camera.position.z = 5


scene.add(group)

const controls = new OrbitControls( camera, renderer.domElement )


init(renderer, camera, scene)

function animate() {
	requestAnimationFrame( animate )
    controls.update()
	renderer.render( scene, camera )
	
	update()
}
animate()