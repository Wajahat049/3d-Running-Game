import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js"
import { VirtualWorld } from "./virtualWorld.js"
import {GLTFLoader} from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js'
import {FBXLoader} from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/FBXLoader.js';


class State {
    constructor(animPath, movement, repetitions = Infinity){
        this.animationSpeed = 1
        this.characterVelocity = movement
        this.repetitions = repetitions
        this.loadAnimation(animPath)
        
    }
    loadAnimation(path){
        const fbxLoader = new FBXLoader()
        this.loadPromise = new Promise((resolve, reject) =>{
            fbxLoader.load(path, (anim) => {
                this.clip = anim.animations[0]
                resolve()
            })
        })
        
}
    useState(characterRef){
        this.character = characterRef
        this.action = this.character.mixer.clipAction(this.clip)
        this.action.timeScale = this.animationSpeed 
    }
    setPriority(pr){
        this.priority = pr
    }
    enter(){
        if (!(this.character.activeStates.includes(this))){
            this.count = 0
            this.character.activeStates.push(this)
            this.action.play()
        }
    }
    exit(){
        if (this.character.activeStates.includes(this)){
            let index = this.character.activeStates.indexOf(this)
            this.character.activeStates.splice(index)
            this.action.stop()
        }
    }
}


class Character{
    constructor(modelPath){
        this.modelSize = 0.04
        this.loadModel(modelPath)
        this.states = {}
        this.activeStates = []
        this.hitBox = new THREE.Box3()
    }
    loadModel(path){
        const fbxLoader = new FBXLoader()
        this.loadPromise = new Promise((resolve, reject) => {
            fbxLoader.load(path, (model) => {
                this.model = model
                this.model.scale.setScalar(this.modelSize)
                this.model.traverse(child => {
                    child.castShadow = true;
                })
                this.position = this.model.position
                this.model.lookAt(0,0,-1)
                this.hitBox.setFromObject(this.model)
                this.helper = new THREE.Box3Helper( this.hitBox, 0xffff00 )
                resolve()
            })
        })
    }
    createAnimationMixer(renderer){
        this.mixer = new THREE.AnimationMixer(this.model)
        const clock = new THREE.Clock()
        const animate = () => {
            const delta = clock.getDelta()
            this.mixer.update(delta)
            requestAnimationFrame(animate)
        }
        animate()
    }
    addState(name, state, keyBind){
        state.useState(this)
        this.states[name] = {state: state, keyBind: keyBind}
    }
    createModifier(gui){
        const characterFolder = gui.addFolder('Character')
        characterFolder.add(this, 'size').min(0).max(5).step(0.01)
    }
    move(dist){
        this.position.add(dist)
        this.hitBox.setFromObject(this.model, true)
    }
    enablePlayerControls(){
        addEventListener('keydown', (e) => {
            switch(e.key){
                case this.states['jump'].keyBind:
                    this.states['jump'].state.enter()
                    break;
                case this.states['leftStrafe'].keyBind:
                    this.states['leftStrafe'].state.enter()
                    break;
                case this.states['rightStrafe'].keyBind:
                    this.states['rightStrafe'].state.enter()
                    break;
            }
        })
    }
    addToWorld(scene, camera, renderer, pos){
        this.position.copy(pos)
        scene.add(this.model)
        scene.add( this.helper )
        this.createAnimationMixer(renderer)
    }
}

export {State, Character}