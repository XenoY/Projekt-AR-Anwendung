// To start an AR scene with webXR, we can use a handy button provided by three.js
// We first have to import it because it is a javascript module
import { ARButton } from 'https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js'
import * as THREE from 'three'

import page42 from './page42'
import page44 from './page44'
import page48 from './page48'

let camera, scene, renderer
let mesh

await init()
animate()

async function init() {
	const container = document.createElement('div')
	document.body.appendChild(container)

	scene = new THREE.Scene()

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 50000)

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)
	// This next line is important to to enable the renderer for WebXR
	renderer.xr.enabled = true // New!
	container.appendChild(renderer.domElement)

	var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
	light.position.set(0.5, 1, 0.25)
	scene.add(light)

	const geometry = new THREE.IcosahedronGeometry(0.1, 1)
	geometry.translate(0, 0, 0)
	const material = new THREE.MeshPhongMaterial({
		color: new THREE.Color("rgb(226,35,213)"),
		shininess: 6,
		flatShading: true,
		transparent: 1,
		opacity: 0.8
	})

	mesh = new THREE.Mesh(geometry, material)
	// scene.add(mesh)
	mesh.matrixAutoUpdate = false


	function  loadImages(files, onAllLoaded) {
		var i = 0, numLoading = files.length
		const images = []
		const onload = () => --numLoading === 0 && onAllLoaded(images)
		while (i < files.length) {
			const img = images[i] = new Image
			img.src = files[i++]
			img.onload = onload
		}   
		return images
	}

	loadImages([
		'/assets/images/page_42.png',
		'/assets/images/page_44.png',
		'/assets/images/page_48.png'
	], async images => {
		const trackedImages = await Promise.all(
			images.map(
				async image => ({
					image: await createImageBitmap(image),
					widthInMeters: 0.093,
				})
			)
		) 
		
		document.body.appendChild(ARButton.createButton(renderer, {
			requiredFeatures: ['image-tracking'],
			trackedImages,
			optionalFeatures: ['dom-overlay'],
			domOverlay: {
				root: document.body
			}
		}))
	})

	// Add the AR button to the body of the DOM
	window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
	renderer.setAnimationLoop(render)
}

let matching = false

const pageMapping = [
	page42,
	page44,
	page48,
]

function render(timestamp, frame) {
	if (frame) {
		const results = frame.getImageTrackingResults()
		for (const result of results) {
			const referenceSpace = renderer.xr.getReferenceSpace()
			const pose = frame.getPose(result.imageSpace, referenceSpace)
			const state = result.trackingState
			const page = pageMapping[result.index]

			if (state === 'tracked') {
				page.init(renderer, camera, scene, pose)
			}
			else {
				page.destroy(scene)
			}
		}
	}
	pageMapping.forEach(page => page.update())
	renderer.render(scene, camera)
}
