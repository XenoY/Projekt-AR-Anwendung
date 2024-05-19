import * as THREE from 'three'

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 50000 );
const group = new THREE.Group();
group.matrixAutoUpdate = false


//0.093

const vertexShader =  `
#define WAVESCOUNT __WAVESCOUNT__;

varying vec2 vUv;
varying float vStrength;

uniform float uOffset[max(1, __WAVESCOUNT__)];
uniform vec2 uFocus[max(1, __WAVESCOUNT__)];

void main()
{
    float elevation = 0.05 * 0.5;
    // float strength = min(1.0, abs((distance(uv, focus) - offset) * 10.0));
    float strength = 0.0;

    if (__WAVESCOUNT__ > 0) {
        for (int i = 0; i < __WAVESCOUNT__; i++) {
            vec2 focus = uFocus[i];
            float offset = uOffset[i];
            strength = max(strength, pow(smoothstep(0.8, 1.0, 1.0 - min(1.0, abs(distance(uv, focus) - offset))), 2.0) * (1.0 - offset));
        }
    }

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // float elevation = sin(modelPosition.x) * 3.0;
    modelPosition.y += strength * elevation;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    vUv = uv;
    vStrength = strength;
}
`

const material = new THREE.ShaderMaterial({
    wireframe: false,
    vertexShader: vertexShader.replaceAll('__WAVESCOUNT__', 0),
    fragmentShader: `
        varying vec2 vUv;
        varying float vStrength;

        void main()
        {
            float strength = abs(distance(vUv, vec2(0.5, 0.5)) - 0.5);
            vec3 color = vec3(3.0 / 255.0, 120.0 / 255.0, 166.0 / 255.0);
            gl_FragColor = vec4(mix(color, vec3(0.5019607843137255, 0.8666666666666667, 0.9490196078431373), max(0.0, vStrength - 0.8) / 0.2), 1.0);
            gl_FragColor = vec4(mix(color, vec3(0.5019607843137255, 0.8666666666666667, 0.9490196078431373), vStrength / 2.0), 0.9);
        }
    `,
    uniforms: {
        uOffset: { value: [] },
        uFocus: { value: [] }
    },
    transparent: true
})

const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.1, 0.1, 128, 128),
    material
)
mesh.rotateX( - Math.PI / 2)
group.add(mesh)


const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

let deltas = []


function onClick(event, renderer, camera, scene) {
    pointer.x = ( event.offsetX / renderer.domElement.clientWidth ) * 2 - 1
    pointer.y = - ( event.offsetY / renderer.domElement.clientHeight ) * 2 + 1
    raycaster.setFromCamera( pointer, camera )

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true)
    if (!intersects.length) {
        return
    }

    const material = group.children[0].material
    
    const offsets = material.uniforms.uOffset.value
    const focuses = material.uniforms.uFocus.value

    offsets.push(0)
    deltas.push(0)
    focuses.push(intersects[0].uv)

    material.uniforms.uOffset.value = offsets
    material.uniforms.uFocus.value = focuses

    material.vertexShader = vertexShader.replaceAll('__WAVESCOUNT__', deltas.length)
    material.needsUpdate = true

    console.log(material.uniforms)

    lastTime = Date.now()
}

let isVisible = false

function init(renderer, camera, scene, pose = null) {
    if (!isVisible) {
        scene.add(group)
        renderer.domElement.removeEventListener('click', event => onClick(event, renderer, camera, scene))
        renderer.domElement.addEventListener('click', event => onClick(event, renderer, camera, scene))
    }
    if (pose !== null) {
        group.matrix.fromArray(pose.transform.matrix)
    }
    isVisible = true
}



let lastTime = 0

function update() {
    if (!isVisible) {
        return
    }
    let offsets = group.children[0].material.uniforms.uOffset.value
	let focuses = group.children[0].material.uniforms.uFocus.value

    const currentTime = Date.now()
	const toDelete = []
	for(let index in deltas) {
		deltas[index] += (currentTime - lastTime) / 1000
		offsets[index] = easeOut(deltas[index], 0, 1, 3)

		if (deltas[index] > 3) {
			toDelete.push(index)
		}
	}
    lastTime = currentTime
	
	toDelete.forEach(index => {
		delete deltas[index]
		delete offsets[index]
		delete focuses[index]
	})

	deltas = deltas.filter(value => true)
	offsets = offsets.filter(value => true)
	focuses = focuses.filter(value => true)
	
	group.children[0].material.uniforms.uOffset.value = offsets
	group.children[0].material.uniforms.uFocus.value = focuses

	if (toDelete.length) {
		group.children[0].material.vertexShader = vertexShader.replaceAll('__WAVESCOUNT__', deltas.length)
	}

	group.children[0].material.needsUpdate = true

}

function destroy(scene) {
    scene.remove(group)
    isVisible = false
}

function easeOut(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b
}


export default {
    init,
    update,
    destroy
}