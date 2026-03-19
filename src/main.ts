import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { Visualizer } from './visualizer'
import { Manager } from './manager'

let visualizer: Visualizer
let manager: Manager

let videoMenu: HTMLElement

let pointer: THREE.Vector3
let isPointerDown: boolean
let center: THREE.Vector3

let controlsHideTimeout: NodeJS.Timeout | null = null

let hideMenuTime = 2000

const gui = new GUI()

const DEFAULT_VALUES = {
  
  far: 6436,
  near: .1,
  nearClipping: 1,
  farClipping: 7000,
  fov: 63.5,
  sphereMode: false,
  offsetZ: 545,
}

init()

function init() {

  isPointerDown = false

  const container = document.createElement('div')
  document.body.appendChild(container)

  videoMenu = document.getElementById('video-controls') as HTMLElement

  const video = document.getElementById('video') as HTMLVideoElement

  manager = new Manager(container)
  visualizer = new Visualizer(video, 1920 / 1, 1080 / 1, DEFAULT_VALUES.nearClipping, DEFAULT_VALUES.farClipping)
  manager.scene.add(visualizer.mesh)

  manager.camera.position.set(0, 0, 545)
  manager.camera.far = DEFAULT_VALUES.far

  center = new THREE.Vector3()
  center.z = -1000

  gui.add(visualizer.material.uniforms.sphereMode, 'value').name('Sphere Mode')
  gui.add(visualizer.material.uniforms.sphereRadius, 'value', 50, 1000, 10).name('Sphere Radius')
  gui.add(visualizer.material.uniforms.nearClipping, 'value', 1, 10000, 1.0).name('nearClipping')
  gui.add(visualizer.material.uniforms.farClipping, 'value', 1, 10000, 1.0).name('farClipping')
  gui.add(visualizer.material.uniforms.pointSize, 'value', 1, 10, 1.0).name('pointSize')
  gui.add(visualizer.material.uniforms.zOffset, 'value', 0, 4000, 1.0).name('zOffset')
  gui.add(manager.camera, 'far', 0, 10000, 1.0).name('far').onChange((v: number) => {

    manager.camera.far = v
    manager.camera.updateProjectionMatrix()
  })
  gui.add(manager.camera, 'fov', 0, 150, .5).name('fov').onChange((v: number) => {

    manager.camera.fov = v
    manager.camera.updateProjectionMatrix()
  })
  gui.add(manager.camera.position, 'z', 0, 1000, 1.0).name('z').onChange((v: number) => {

    manager.camera.position.z = v
  })

  const playPromise = manager.video?.play()
  
  if (playPromise !== undefined) {
    playPromise.then(() => console.log('video playing')).catch((e) => {
      console.log('play failed:', e)
      document.addEventListener('click', () => {
        console.log('click, playing')
        manager.video.play()
      }, { once: true })
    })
  }

  pointer = new THREE.Vector3(0, 0, 1)

  manager.renderer.domElement.addEventListener('pointerdown', onDocumentPointerDown)
  manager.renderer.domElement.addEventListener('pointermove', onDocumentPointerMove)
  manager.renderer.domElement.addEventListener('pointerup', onDocumentPointerUp)
  window.addEventListener('resize', onWindowResize)
  
  // Keyboard controls
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault()
      if (manager.video.paused) {
        manager.video.play()
      } else {
        manager.video.pause()
      }
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault()
      manager.video.currentTime = Math.max(0, manager.video.currentTime - 10)
    } else if (e.code === 'ArrowRight') {
      e.preventDefault()
      manager.video.currentTime = Math.min(manager.video.duration, manager.video.currentTime + 10)
    }
  })

  // Update progress bar
  manager.video.addEventListener('timeupdate', updateProgress)
  manager.video.addEventListener('loadedmetadata', updateProgress)
  
  // Click on progress bar to seek
  const progressContainer = document.getElementById('progress-container') as HTMLElement
  if (progressContainer) {
    progressContainer.addEventListener('click', (e: MouseEvent) => {
      if (!manager.video.duration) return
      const rect = progressContainer.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percent = clickX / rect.width
      manager.video.currentTime = percent * manager.video.duration
    })
  }

  // Hide controls after 5 seconds of no mouse movement
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseenter', onMouseMove)

  manager.setAnimationLoop(animate)
}

function onWindowResize() {

  manager.resize()
}

function onDocumentPointerDown(event: PointerEvent) {

  isPointerDown = true
}

function onDocumentPointerUp(event: PointerEvent) {

  isPointerDown = false
}

function onDocumentPointerMove(event: PointerEvent) {

  pointer.x = (event.clientX - manager.w / 2) * 8
  pointer.y = (event.clientY - manager.h / 2) * 8
}

function animate(time?: number) {

  manager.render()
}

function formatTime(seconds: number): string {

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function updateProgress() {

  const timeDisplay = document.getElementById('video-time') as HTMLElement
  const progressBar = document.getElementById('progress-bar') as HTMLElement
  
  if (timeDisplay) {
    const currentTime = manager.video.currentTime || 0
    const duration = manager.video.duration || 0
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`
  }
  
  if (progressBar && manager.video.duration) {
    const percent = (manager.video.currentTime / manager.video.duration) * 100
    progressBar.style.width = `${percent}%`
  }
}

function onMouseMove() {

  showMenu()
  
  // Clear existing timeout
  if (controlsHideTimeout) {
    clearTimeout(controlsHideTimeout)
  }
  
  // Hide controls after 5 seconds
  controlsHideTimeout = setTimeout(() => {

    hideMenu()

  }, hideMenuTime)
}

function hideMenu() {

  // Show controls
  videoMenu.classList.add('hidden')

  gui.hide()
}

function showMenu() {

  // Show controls
  videoMenu.classList.remove('hidden')

  gui.show()
}
