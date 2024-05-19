import * as THREE from 'three'

const group = new THREE.Group()
group.matrixAutoUpdate = false

const video = document.createElement('video')
video.src = '/assets/videos/raumzeitdiagramme.mp4'
var texture = new THREE.VideoTexture(video);

var screen = new THREE.Mesh(
new THREE.PlaneGeometry(.16 * 0.8, .09 * 0.8),
new THREE.MeshBasicMaterial({
    map: texture
}))
video.load()
screen.geometry.translate(0, 0.09, 0)
screen.geometry.rotateX(-Math.PI / 4)

group.add(screen)

let isVisible = false

function init(renderer, camera, scene, pose = null) {
    if (!isVisible) {
        video.play()
        scene.add(group)
    }
    if (pose !== null) {
        group.matrix.fromArray(pose.transform.matrix)
    }
    isVisible = true
}


function update() {

}

function destroy(scene) {
    isVisible = false
    scene.remove(group)
    video.pause()
}

export default {
    init,
    update,
    destroy
}