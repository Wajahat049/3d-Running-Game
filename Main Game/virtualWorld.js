import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js"
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js"
import * as dat from "./node_modules/dat.gui/build/dat.gui.module.js"


class VirtualWorld {
    constructor(){
        // this.gui = new dat.GUI()
        this.createScene()
        this.createCamera()
        this.createRenderer()
        // this.enableOrbitControls()
    }
    createScene(){
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color( 0x000000 )
        // this.scene.add(new THREE.AxesHelper(20))
    }
    createCamera(){
        let fov = 75
        let aspect = innerWidth/innerHeight
        let near = 0.1
        let far = 200
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.scene.add(this.camera)
        this.camera.position.z = 50
        // this.camera.castShadow = true

        //Dat.GUI
        // const cameraFolder = this.gui.addFolder('Camera')
        // cameraFolder.add(this.camera.position, 'x').min(-50).max(50).step(0.1)
        // cameraFolder.add(this.camera.position, 'y').min(-50).max(50).step(0.1)
        // cameraFolder.add(this.camera.position, 'z').min(-50).max(50).step(0.1)
    }
    createRenderer(){
        this.renderer = new THREE.WebGLRenderer({antialias: true})
        this.renderer.setSize(innerWidth, innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        document.body.appendChild(this.renderer.domElement)
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    }
    enableOrbitControls(){
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
        this.orbitControls.addEventListener( 'change', ()=>{this.renderer.render(this.scene, this.camera)} );
    }
    addLights(){
        this.lightDirectional = new THREE.DirectionalLight(0xffffff, 1)
        this.scene.add(this.lightDirectional)
        this.lightDirectional.position.set(5, 5, 5)

        this.lightAmbient = new THREE.AmbientLight(0x9eaeff, 0.2)
        this.scene.add(this.lightAmbient)
    }
    addSpotLight(target=''){
        let color = 0xffffff
        let intensity = 1.5
        let distance = 0
        let angle = Math.PI/3
        let penumbra = 0.1
        let decay = 1
        this.spotLight = new THREE.SpotLight( color, intensity, distance, angle, penumbra, decay )
        this.spotLight.position.set( 5, 5, 5 );
        this.spotLight.castShadow = true
        this.scene.add(this.spotLight)

        // const spotLightHelper = new THREE.SpotLightHelper( this.spotLight );
        // this.scene.add( spotLightHelper );
    }
    addReferencePlane(){
        const planeGeometry = new THREE.PlaneGeometry(20,20,10,10)

        const planeMaterial = new THREE.MeshPhongMaterial({color: 0x00ffff, flatShading: THREE.FlatShading, side: THREE.DoubleSide})

        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
        planeMesh.rotation.x = -Math.PI/2+0.05
        this.scene.add(planeMesh)
    }
    initialize(){
        this.renderer.render(this.scene, this.camera)
        const tick = () =>
        {
            // Render
            this.renderer.render(this.scene, this.camera)
            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }
        tick()
    }
}

export {VirtualWorld}