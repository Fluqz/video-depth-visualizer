
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

export class Manager {

    w: number
    h: number

    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls

    video: HTMLVideoElement
    
    container: HTMLElement


    constructor(container?: HTMLElement) {

        this.container = container || document.createElement('div')

        this.w = window.innerWidth
        this.h = window.innerHeight

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(70, this.w / this.h, 0.1, 10000)
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.container.appendChild(this.renderer.domElement)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        
        this.video = document.getElementById('video') as HTMLVideoElement
    }
    
    setAnimationLoop(callback: (time: number) => void) {
        this.renderer.setAnimationLoop(callback)
    }

    render() {

        this.renderer.render(this.scene, this.camera)
    }

    resize() {

        this.w = window.innerWidth
        this.h = window.innerHeight

        this.camera.aspect = this.w / this.h
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.w, this.h)
    }
}
