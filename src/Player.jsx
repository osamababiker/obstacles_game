import { useRapier, RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei' 
import { useState,   useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Player() {

    /* get the ball */
    const bodyRef = useRef()

    /** get access to rapier to cast the array */
    const { rapier, world } = useRapier()
    const rapierWorld = world

    /** to smoothe the camera movment */
    const [ smoothedCameraPosition ] = useState(() => new THREE.Vector3( 10, 10, 10 ))
    const [ smoothedCameraTarget ] = useState(() => new THREE.Vector3())

    /* 
    * subscribe and get the presed keyboard
    */
    const [ subscribeKeys, getKeys ] = useKeyboardControls()

    /* 
    * handel the jump action 
    */
    const jump = () => {
        /**
         * Cast array to check if the ball aready jump
         */
        const origin = bodyRef.current.translation()
        origin.y  -= 0.31 
        const direction = { x: 0, y: -1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        /** to make the floor solid to get acuracte ray casting */ 
        const hit = rapierWorld.castRay(ray, 10, true)

        /** test the time of imapact "toi" 
         * so we dont apply the jump if the ball 
         * already in the air 
         */

        if(hit.toi < 0.15)
            bodyRef.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
    }
    useEffect(() => { 
        /**
         * the function will subscribe and return function to unsbscribe to
         */
        const unsubscribeJump =  subscribeKeys(
            // the selector function
            (state) => {
                return state.jump
            },
            // action when the selector been trigger
            (value) => {
                if(value)
                    jump()
            }
        )

        /** 
         * to clean up 
         *  
         */
        return () => {
            unsubscribeJump()
        }
    }, [])

    useFrame((state, delta) => {

        /**
         * Controlls 
         */
        const { forward, backward, leftward, rightward } = getKeys()

        const implulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const implulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta

        /** apply forward move */
        if(forward){
            implulse.z -= implulseStrength
            torque.x -= torqueStrength
        }

        /** apply right move */
        if(rightward){
            implulse.x += implulseStrength
            torque.z -= torqueStrength
        }

        /** apply backward move */
        if(backward){
            implulse.z += implulseStrength
            torque.x += torqueStrength
        }

        /** apply left move */
        if(leftward){
            implulse.x -= implulseStrength
            torque.z += torqueStrength
        }

        bodyRef.current.applyImpulse(implulse)
        bodyRef.current.applyTorqueImpulse(torque)

        /**
         * Camera
         */

        /** Create the camera position  */
        const bodyPosition = bodyRef.current.translation()
        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 2.25
        cameraPosition.y += 0.65

        /** Create the camera target  */
        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        /** to smooth the movement of the camera first */
        smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.lookAt(smoothedCameraTarget)
    })

    return <RigidBody 
        ref={ bodyRef } 
        canSleep={ false } 
        colliders="ball" 
        restitution={ 0.2 } 
        friction={ 1 } 
        linearDamping={ 0.5 }
        angularDamping={ 0.5 }
        position={[ 0, 1, 0 ]}
    >
            <mesh castShadow>
                <icosahedronGeometry args={ [ 0.3, 1 ] } />
                <meshStandardMaterial flatShading color="mediumpurple" />
            </mesh>
        </RigidBody>
  
}
