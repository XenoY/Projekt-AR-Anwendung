import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 50000 );
const group = new THREE.Group();

const factor = 0.01

const geometry = new THREE.SphereGeometry(1 * factor);
const material = new THREE.MeshBasicMaterial( { color: 0x0000FF, wireframe: true } );
const earth = new THREE.Mesh( geometry, material );
group.add( earth );


const sun = new THREE.Mesh(
    new THREE.SphereGeometry(109 * factor),
    new THREE.MeshBasicMaterial( { color: 0xFFFF00, wireframe: true } )
);
group.add(sun);
sun.position.x = 23605 * factor



const star = new THREE.Mesh(
    new THREE.SphereGeometry(109 * factor),
    new THREE.MeshBasicMaterial( { color: 0xFF0000, wireframe: true } )
);
group.add(star);
star.position.x = (23605 + 7000) * factor
star.position.z = -5000 * factor


// camera.position.x = -1.6768295121201533
// camera.position.y = 0.22937752654702673
// camera.position.z = 1.3026249532005179

// camera.position.x = 23605 / 2
// camera.position.y = 23605

const curve = new THREE.QuadraticBezierCurve3(
	sun.position.clone().add(new THREE.Vector3(sun.geometry.parameters.radius + 700 * factor, 0, sun.geometry.parameters.radius)),
	sun.position.clone().add(new THREE.Vector3(sun.geometry.parameters.radius + 100 * factor, 0, sun.geometry.parameters.radius + 500 * factor)),
	sun.position.clone().add(new THREE.Vector3(sun.geometry.parameters.radius - 500 * factor, 0, sun.geometry.parameters.radius + 500 * factor))
);

const points = [];
points.push( star.position );
points.push(...curve.getPoints( 50 ))
points.push( earth.position );


const line = new THREE.Line( new THREE.BufferGeometry().setFromPoints( points ), new THREE.LineBasicMaterial( { color: 0x00FF00 } ) )
group.add( line )

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );

// const controls = new OrbitControls( camera, renderer.domElement )

// const target = sun.position.clone()
// target.x = target.x / 2

// controls.target = sun.position.clone()
export default group



export function init() {
    
}

export function update() {
    
}