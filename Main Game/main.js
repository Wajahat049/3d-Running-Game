import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js"
import { VirtualWorld } from "./virtualWorld.js"
import { State, Character} from "./character.js"
import {Map, Obstacle} from "./map.js"

let gameStarted = false
let score = 0
let gravity = new THREE.Vector3(0, -0.4, 0)
let charStartPos = new THREE.Vector3(0, 0, 0)
let lightStartPos = new THREE.Vector3(0, 15, 3)
let cameraStartPos = new THREE.Vector3(6, 10, 18)
let cameraStartLookAt = new THREE.Vector3(0, 0, -10)
let charLowerBound = new THREE.Vector3(-10, 0, -Infinity)
let charUpperBound = new THREE.Vector3(10, 40, 50)
let runForwardKey = 'w'
let jumpKey = 'w'
let leftStrafeKey = 'a'
let rightStrafeKey = 'd'

 async function main() {
    //Creating World
    const myWorld = new VirtualWorld()
    // myWorld.addLights()
    myWorld.addSpotLight()
    const {camera, scene, spotLight, renderer, gui} = myWorld
    camera.position.copy(cameraStartPos)
    camera.lookAt(cameraStartLookAt)
    spotLight.position.copy(lightStartPos)
    spotLight.angle = Math.PI/2.4

    //Organizing Canvas
    // const ctx = renderer.domElement.getContext('2d')
    // console.log(ctx)

    //Creating Obstacles
    const spikeObstacle = new Obstacle('./resources/SpikeTrap.fbx', 0.01)
    await spikeObstacle.loadPromise
    
    //Creating Map
    const map = new Map()
    map.createGroup()
    map.createTunnel()
    map.spreadInMap(spikeObstacle)
    map.addToWorld(scene, camera, renderer)

    //Creating States
    const runState = new State('./resources/Running.fbx', new THREE.Vector3(0,0,-0.5))
    await runState.loadPromise

    const jumpState = new State('./resources/Jumping.fbx', new THREE.Vector3(0,0.8,0), 20)
    await jumpState.loadPromise
    jumpState.animationSpeed = 1.5

    const leftStrafeState = new State('./resources/Left Strafe.fbx', new THREE.Vector3(-0.5,0,0), 5)
    await leftStrafeState.loadPromise
    leftStrafeState.animationSpeed = 1

    const rightStrafeState = new State('./resources/Right Strafe.fbx', new THREE.Vector3(0.5,0,0), 5)
    await rightStrafeState.loadPromise

    //Creating Character
    const mainChar = new Character('./resources/aj.fbx')
    await mainChar.loadPromise
    spotLight.target = mainChar.model
    mainChar.addToWorld(scene, camera, renderer, charStartPos)

    //Using States
    mainChar.addState('runForward', runState, runForwardKey)
    mainChar.addState('jump', jumpState, jumpKey)
    mainChar.addState('leftStrafe', leftStrafeState, leftStrafeKey)
    mainChar.addState('rightStrafe', rightStrafeState, rightStrafeKey)


    myWorld.initialize()

    const update = () => {
        manageStates(mainChar)
        applyGravity(mainChar)
        detectCollisions(mainChar, map)
        updateCameraAndLight(mainChar, camera, spotLight)
        updateScore()
        requestAnimationFrame(update)
    }
    update()

    addEventListener('resize', () => {
        // Update camera
        camera.aspect = innerWidth / innerHeight
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(innerWidth, innerHeight)
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    })

    addEventListener('click', () => {
        startGame(mainChar)
    })

}
main()



function detectCollisions(char, map) {
    for (let key in map.obstacleHitBoxes){
        for (let hb of map.obstacleHitBoxes[key]){
            let collision = char.hitBox.intersectsBox(hb)
            if (collision){
                if (key == 'spike'){
                    endGame(char)
                }
            }
        }
    }
    
}


function updateCameraAndLight(char, camera, light){
    const currentCamPos = cameraStartPos.clone()
    const currentCamLookAt = cameraStartLookAt.clone()
    const currentLightPos = lightStartPos.clone()

    //For Camera
    // currentCamPos.applyQuaternion(char.model.rotation)
    currentCamPos.add(new THREE.Vector3(0,0,char.position.getComponent(2)))
    // currentCamLookAt.applyQuaternion(char.model.rotation)
    currentCamLookAt.add(new THREE.Vector3(0,0,char.position.getComponent(2)))
    camera.position.copy(currentCamPos)
    camera.lookAt(currentCamLookAt)


    //For Light
    currentLightPos.add(new THREE.Vector3(0,0,char.position.getComponent(2)))
    light.position.copy(currentLightPos)
}

function applyGravity(obj){
    obj.position.clamp(charLowerBound, charUpperBound)
    obj.move(gravity)
}

function updateScore() {
    let scoreMultiplier = 1
    if (gameStarted){
        score += 1*scoreMultiplier
    }
}

function manageStates(mainChar){
    //Removing duplicates
    mainChar.activeStates = [...new Set(mainChar.activeStates)]
    //Removing left right conflict
    let left = mainChar.states['leftStrafe'].state
    let right = mainChar.states['rightStrafe'].state
    if (mainChar.activeStates.includes(left) && mainChar.activeStates.includes(right)){
        let index1 = mainChar.activeStates.indexOf(left)
        let index2 = mainChar.activeStates.indexOf(right)
        let removeIndex = index1 > index2 ? index1 : index2
        mainChar.activeStates[removeIndex].exit()
        // mainChar.activeStates[removeIndex].action.stop()
        // mainChar.activeStates.splice(removeIndex)
    }
    //Adding delay for jump

    //Executing States
    for (let state of mainChar.activeStates){
        if (state.count > state.repetitions){
            state.exit()
        }
        mainChar.move(state.characterVelocity)
        state.count+=1
    }
}

function startGame(mainChar) {
    gameStarted = true
    mainChar.states['runForward'].state.enter()
    mainChar.enablePlayerControls()
    removeEventListener('click', () => {})
}
function endGame(mainChar) {
  
    
    gameStarted = false
    mainChar.states['runForward'].state.exit()
    removeEventListener('keydown', () => {})
    const Player = localStorage.getItem("Player")
    const id = JSON.parse(Player).Email.split("@")
    db.collection("Scores").doc(`${id[0]}`).get().then((snap)=>{
            const AllTheScoresGet = snap.data().AllScores
            AllTheScoresGet.push(score)
            console.log("AAAAA",AllTheScoresGet)
    
            db.collection("Scores").doc(`${id[0]}`).set({
                AllScores:AllTheScoresGet
            })
    })
}