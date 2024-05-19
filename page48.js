import * as THREE from 'three'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/Addons.js';


// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 50000 );
const group = new THREE.Group()
group.matrixAutoUpdate = false

const innerGroup = new THREE.Group()
innerGroup.scale.set(0.01, 0.01, 0.01)
group.add(innerGroup)

/**
 * Loader
 */

const loader = new GLTFLoader()

/**
 * Light
 */

const light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
innerGroup.add( light )

/**
 * Earth
 */


// const geometry = new THREE.SphereGeometry(1);
// const material = new THREE.MeshBasicMaterial( { color: 0x0000FF, wireframe: false } );
// const earths = new THREE.Mesh( geometry, material );

const earth = new THREE.Group()
innerGroup.add( earth );

loader.load(
    'assets/models/earth/scene.gltf',
    function(gltf) {
        const box = new THREE.Box3().setFromObject( gltf.scene )
        const center = box.getCenter( new THREE.Vector3() )

        gltf.scene.position.x += ( gltf.scene.position.x - center.x )
        gltf.scene.position.y += ( gltf.scene.position.y - center.y )
        gltf.scene.position.z += ( gltf.scene.position.z - center.z )
        earth.add(gltf.scene)
    }
)

/**
 * Sun
 */

// const sun = new THREE.Mesh(
    // new THREE.SphereGeometry(8),
//     new THREE.MeshBasicMaterial( { color: 0xFFFF00, wireframe: false } )
// );
const sun = new THREE.Group()
innerGroup.add(sun);
sun.position.x = 50


loader.load(
    'assets/models/sun/scene.gltf',
    function(gltf) {
        const box = new THREE.Box3().setFromObject( gltf.scene )
        const center = box.getCenter( new THREE.Vector3() )

        gltf.scene.position.x += ( gltf.scene.position.x - center.x )
        gltf.scene.position.y += ( gltf.scene.position.y - center.y )
        gltf.scene.position.z += ( gltf.scene.position.z - center.z )
        
        const sunSize = new THREE.Vector3()
        box.getSize(sunSize)
        sun.add(gltf.scene)
        sun.scale.set(0.8, 0.8, 0.8)
    }
)

/**
 * Star
 */

const star = new THREE.Mesh(
    new THREE.SphereGeometry(3),
    new THREE.MeshBasicMaterial( { color: 0xFFFF00 } )
);
innerGroup.add(star);
star.position.x = 100
star.position.z = -20

const sunRadius = 8 

const point = new THREE.Mesh( 
    new THREE.SphereGeometry(2),
    new THREE.MeshBasicMaterial( { color: 0xFF0000, wireframe: true } )
)
const offset = new THREE.Vector3(-8, 0, 12)
point.position.copy(
    sun.position.clone().add(
        new THREE.Vector3(sunRadius + offset.x , 0, sunRadius + offset.z)))
point.visible = false
innerGroup.add(point)


const line = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial( { color: 0xFFFF00, linewidth: 3 })
)
innerGroup.add( line )

let pointsShown = 0
let totalPoints = 0

function updateLine() {
    if (!earth) {
        return
    }
    totalPoints = 0
    const startPoint = star.position.clone()
    const startCurve = sun.position.clone().add(new THREE.Vector3(sunRadius + 7, 0, sunRadius))
    const endCurve = sun.position.clone().add(new THREE.Vector3(sunRadius - 25, 0, sunRadius + 5))
   
    const endPoint = earth.position.clone()

    const curve = new THREE.QuadraticBezierCurve3(
        startCurve,
        point.position,
        endCurve
    );
    
    const points = [];
    points.push( startPoint );

    const distanceStart = startPoint.distanceTo(startCurve)
    const distanceStartV = startCurve.clone().sub(startPoint)
    const startPointCount = distanceStart * 1.5
    for(let i = 1; i < startPointCount; i++) {
        points.push(startPoint.clone().add(
            distanceStartV.clone().multiply(new THREE.Vector3(i / startPointCount, i / startPointCount, i / startPointCount))))
    }
    
    points.push(...curve.getPoints( 50 ))

    const distanceEnd = endCurve.distanceTo(endPoint)
    const distanceEndV = endPoint.clone().sub(endCurve)
    const endPointCount = distanceEnd * 1.5
    for(let i = 1; i < endPointCount; i++) {
        points.push(endCurve.clone().add(
            distanceEndV.clone().multiply(new THREE.Vector3(i / endPointCount, i / endPointCount, i / endPointCount))))
    }

    points.push( endPoint );

    totalPoints = points.length + 20

    line.geometry.setFromPoints(points.slice(Math.max(0, pointsShown - 20), pointsShown))
    line.needsUpdate = true

}
updateLine()



let isVisible = false

function init(renderer, camera, scene, pose = null) {
    if (!isVisible) {
        scene.add(group)
        startTime = Date.now()
    }
    isVisible = true
    if (pose !== null) {
        group.matrix.fromArray(pose.transform.matrix)
    }
}



function destroy(scene) {
    scene.remove(group)
    isVisible = false
}


let startTime = 0
let duration = 5000

let visiblePoints = 0

function update() {
    if (!isVisible) {
        return
    }
    const currentTime = Date.now()
    const delta = (currentTime - startTime)
    const state = delta / duration
    pointsShown = Math.floor(totalPoints * state)
    updateLine()
    if (state > 1) {
        startTime = Date.now()
    }
    earth.rotation.y -= 0.005
    sun.rotation.y -= 0.001
}


export default {
    init,
    update,
    destroy
}