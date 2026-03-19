import * as THREE from "three";
import { vertexshader_sphere_pointcloud, fragmentshader_sphere_pointcloud } from "./shaders.config"

export class Visualizer {

  video: HTMLVideoElement

  texture: THREE.VideoTexture
  width: number
  height: number
  nearClipping: number
  farClipping: number

  mesh: THREE.Points
  geometry: THREE.BufferGeometry
  material: THREE.ShaderMaterial

  constructor(video: HTMLVideoElement, w:number, h:number, nearClipping: number, farClipping: number) {
    
    this.video = video
    this.width = w
    this.height = h
    this.nearClipping = nearClipping
    this.farClipping = farClipping

    this.texture = new THREE.VideoTexture(video)
    this.texture.minFilter = THREE.NearestFilter
    this.texture.generateMipmaps = false

    this.geometry = new THREE.BufferGeometry()

    const vertices = new Float32Array(this.width * this.height * 3)

    for (let i = 0, j = 0, l = vertices.length; i < l; i += 3, j++) {
      vertices[i] = j % this.width
      vertices[i + 1] = Math.floor(j / this.width)
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: this.texture },
        width: { value: this.width },
        height: { value: this.height },
        nearClipping: { value: this.nearClipping },
        farClipping: { value: this.farClipping },
        pointSize: { value: 1 },
        zOffset: { value: 804 },
        far: { value: 5000 },
        sphereMode: { value: false },
        sphereRadius: { value: 300 },
      },
      vertexShader: vertexshader_sphere_pointcloud,
      fragmentShader: fragmentshader_sphere_pointcloud,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })

    this.mesh = new THREE.Points(this.geometry, this.material)
  }
}
