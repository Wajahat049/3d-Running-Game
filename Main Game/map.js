import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js"
import { VirtualWorld } from "./virtualWorld.js"
import {FBXLoader} from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/FBXLoader.js'

class Map{
    constructor(){
        this.radius = 15
        this.length = 20
        this.radialSegments = 32
        this.divisions = 32
        this.meshCount = 10000
        this.obstacleHitBoxes = {}
        this.meshDistance
        this.obstacles
    }    
        
    createTunnel(){
        this.geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.length, this.radialSegments, this.divisions, true)
        this.geometry.rotateX(-Math.PI/2)
        this.geometry.rotateZ(-Math.PI/4)
    
        const caveTexture = new THREE.TextureLoader().load('./resources/caveText.jpg')
        this.material = new THREE.MeshLambertMaterial({map: caveTexture, side: THREE.DoubleSide})

        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.meshCount)
        this.mesh.receiveShadow = true
        let dummy = new THREE.Object3D()
        for ( let i = 0; i < this.mesh.count; i ++ ) {
            let zStaticPosition = -this.length * (i - 1)
            dummy.position.set(0, 0, zStaticPosition)
            dummy.updateMatrix()
            this.mesh.setMatrixAt( i, dummy.matrix )
          }
        this.mesh.instanceMatrix.needsUpdate = true
        
        const {array} = this.mesh.geometry.attributes.position
        for (let i = 0; i < array.length; i+=3) {
            if (array[i+1] < 0){
                array[i+1] = 0
            }
            
        }

        this.group.add(this.mesh)
        console.log(this.mesh)

    }
    createGroup(){
        this.group = new THREE.Group()
    }
    spreadInMap(obj){
        const hitBoxes = []
        this.obstacleGap = 40
        const possibleXValues = [-1,0,1]
        for (let i=0; i < Math.floor(this.length*this.meshCount/this.obstacleGap); i++){
            const clone = obj.model.clone()
            let y = 0
            let x = possibleXValues[Math.floor(Math.random() * possibleXValues.length)] * 2/3*this.radius
            let z = -50 -i * this.obstacleGap
            const pos = new THREE.Vector3(x,y,z)
            this.placeModel(clone, pos)
            //Creating HitBoxes using Box3
            const hitBox = new THREE.Box3()
            hitBox.setFromObject(clone)
            hitBoxes.push(hitBox)
            //Box3 Helper
            const helper = new THREE.Box3Helper( hitBox, 0xffff00 );
            this.group.add( helper )
        }
        this.obstacleHitBoxes[obj.type] = hitBoxes
        console.log(this.obstacleHitBoxes)
    }
    placeModel(model, pos){
        model.position.copy(pos)
        this.group.add(model)
    }
    getFloorY(){
        for (let i = 0; i < this.geometry.position.length; i+=3){

        }
        function mode(arr){
            return arr.sort((a,b) =>
                  arr.filter(v => v===a).length
                - arr.filter(v => v===b).length
            ).pop();
        }
    }

    addToWorld(scene, camera, renderer){
        scene.add(this.group)
    }
}



class Obstacle{
    constructor(modelPath, modelSize = 0.01, type = 'spike'){
        this.type = type
        this.modelSize = modelSize
        this.loadModel(modelPath)
    }
    loadModel(path){
        const fbxLoader = new FBXLoader()
        this.loadPromise = new Promise((resolve, reject) => {
            fbxLoader.load(path, (model) => {
                this.model = model
                this.model.scale.setScalar(this.modelSize)
                this.position = this.model.position
                resolve()
            })
        })
    }
}



export {Map, Obstacle}