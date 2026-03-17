import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { fragmentshader_default_pointcloud, vertexshader_default_pointcloud, vertexshader_sphere_pointcloud, fragmentshader_sphere_pointcloud } from '../shaders.config'

let scene, camera, renderer
let geometry, mesh, material
let pointer, isPointerDown, center

init()

function init() {
  isPointerDown = false
  const container = document.createElement('div')
  document.body.appendChild(container)

  const far = 6436

  camera = new THREE.PerspectiveCamera(63.5, window.innerWidth / window.innerHeight, 1, far)
  camera.position.set(0, 0, 545)

  scene = new THREE.Scene()
  center = new THREE.Vector3()
  center.z = -1000

  const video = document.getElementById('video')

  const texture = new THREE.VideoTexture(video)
  texture.minFilter = THREE.NearestFilter
  texture.generateMipmaps = false

  const width = 640, height = 480
  const nearClipping = 1, farClipping = 9263

  geometry = new THREE.BufferGeometry()

  const vertices = new Float32Array(width * height * 3)

  for (let i = 0, j = 0, l = vertices.length; i < l; i += 3, j++) {
    vertices[i] = j % width
    vertices[i + 1] = Math.floor(j / width)
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

  material = new THREE.ShaderMaterial({
    uniforms: {
      'map': { value: texture },
      'width': { value: width },
      'height': { value: height },
      'nearClipping': { value: nearClipping },
      'farClipping': { value: farClipping },
      'pointSize': { value: 2 },
      'zOffset': { value: 804 },
      'far': { value: 5000 },
      'sphereMode': { value: false },
      'sphereRadius': { value: 300 }
    },
    vertexShader: vertexshader_sphere_pointcloud,
    fragmentShader: fragmentshader_sphere_pointcloud,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true
  })

  mesh = new THREE.Points(geometry, material)
  scene.add(mesh)

  const gui = new GUI()
  gui.add(material.uniforms.sphereMode, 'value').name('Sphere Mode')
  gui.add(material.uniforms.sphereRadius, 'value', 50, 1000, 10).name('Sphere Radius')
  gui.add(material.uniforms.nearClipping, 'value', 1, 10000, 1.0).name('nearClipping')
  gui.add(material.uniforms.farClipping, 'value', 1, 10000, 1.0).name('farClipping')
  gui.add(material.uniforms.pointSize, 'value', 1, 10, 1.0).name('pointSize')
  gui.add(material.uniforms.zOffset, 'value', 0, 4000, 1.0).name('zOffset')
  gui.add(camera, 'far', 0, 10000, 1.0).name('far').onChange((v) => {

    camera.far = v
    camera.updateProjectionMatrix()
  })
  gui.add(camera, 'fov', 0, 150, .5).name('fov').onChange((v) => {

    camera.fov = v
    camera.updateProjectionMatrix()
  })
  gui.add(camera.position, 'z', 0, 1000, 1.0).name('z').onChange((v) => {

    camera.position.z = v
  })

  // Try to play, fall back to click if blocked
  const playPromise = video.play()
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      document.addEventListener('click', () => video.play(), { once: true })
    })
  }

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)
  container.appendChild(renderer.domElement)

  pointer = new THREE.Vector3(0, 0, 1)

  renderer.domElement.addEventListener('pointerdown', onDocumentPointerDown)
  renderer.domElement.addEventListener('pointermove', onDocumentPointerMove)
  renderer.domElement.addEventListener('pointerup', onDocumentPointerUp)
  window.addEventListener('resize', onWindowResize)
  
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault()
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
    }
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
function onDocumentPointerDown(event) {

  isPointerDown = true
}
function onDocumentPointerUp(event) {

  isPointerDown = false
}

function onDocumentPointerMove(event) {

  pointer.x = (event.clientX - window.innerWidth / 2) * 8
  pointer.y = (event.clientY - window.innerHeight / 2) * 8
}

function animate() {

  if(isPointerDown) {

    camera.position.x += ( pointer.x - camera.position.x ) * 0.05;
    camera.position.y += ( - pointer.y - camera.position.y ) * 0.05;
    camera.lookAt( center );
  }
  else {
    camera.position.x = 0
    camera.position.y = 0
    camera.lookAt( center );
  }

  renderer.render(scene, camera)
}
