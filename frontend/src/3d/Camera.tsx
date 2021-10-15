import React, {MutableRefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react"
import {DirectionalLight, Group, PerspectiveCamera, Vector3} from "three";
import {useWindowSize} from "@react-hook/window-size";
import {useFrame, useThree} from "react-three-fiber";
import {useStoredObjectRef} from "../state/objects";
import {useCollidedVideo} from "../state/collisions";
import {useSpring} from "react-spring";
import {lerp} from "../utils/numbers";
import {degToRad} from "../utils/angles";
import { cameraStateProxy } from "../event/components/EventCSSCanvas";
import {proxy, ref, useProxy} from "valtio";
import {useFocusedVideo} from "../state/ui";
import {getPlayerEventInitialPosition} from "../event/components/CurrentUser/CurrentUser";

const useCameraTarget = () => {

    const collidedVideo = useCollidedVideo()
    const focusedVideo = useFocusedVideo()

    const videoObjectRef = useStoredObjectRef(`${collidedVideo}-video`)

    const targetPositionRef = useMemo(() => {
        if (!collidedVideo || !videoObjectRef) return null
        return videoObjectRef
    }, [videoObjectRef, collidedVideo])

    return {
        collidedVideo,
        focusedVideo,
        targetPositionRef
    }

}

const v3 = new Vector3(0,0,0)

const defaultFov = 40
const zoomedFov = 30

export const randomDataProxy = proxy({
    numberOfUsersInRoomExceedsLimit: false,
})

const useFovSpring = () => {

    const exceedsLimit = useProxy(randomDataProxy).numberOfUsersInRoomExceedsLimit

    const {
        zoomedIn,
    } = useSpring({
       zoomedIn: exceedsLimit ? 1 : 0,
        config: {
            mass: 1,
            tension: 170,
            friction: 150,
        }
    })

    return zoomedIn

}

const useFollow = (cameraGroupRef: MutableRefObject<Group>, lightRef: MutableRefObject<DirectionalLight>, cameraRef: MutableRefObject<PerspectiveCamera>) => {

    const {
        focusedVideo,
        targetPositionRef
    } = useCameraTarget()
    const playerObjectRef = useStoredObjectRef('player')
    const cameraGroup = cameraGroupRef.current

    const {targetWeight, rotateWeight} = useSpring({
        targetWeight: !!targetPositionRef ? 1 : 0,
        rotateWeight: !!focusedVideo ? 1 : 0,
        config: {
            mass: 1,
            tension: 170,
            friction: 150,
        }
    })
    const fovSpring = useFovSpring()

    const onFrame = useCallback((state, delta) => {

        let targetX = cameraGroup.position.x
        let targetY = cameraGroup.position.y
        let playerX = cameraGroup.position.x
        let playerY = cameraGroup.position.y

        const targetPosition = targetPositionRef?.current
        const playerObject = playerObjectRef?.current

        if (targetPosition) {
            const worldPos = targetPosition.getWorldPosition(v3)
            targetX = worldPos.x
            targetY = worldPos.y
        } else if (playerObject) {
            playerX = playerObject.position.x
            playerY = playerObject.position.y
        }

        const weight = targetWeight.getValue() as number
        const rWeight = rotateWeight.getValue() as number

        const fovDefaultValue = lerp(defaultFov, zoomedFov, fovSpring.getValue() as number)

        cameraRef.current.fov = lerp(fovDefaultValue, 30, rWeight)
        cameraRef.current.updateProjectionMatrix()

        const finalX = lerp(playerX, targetX, weight)
        const finalY = lerp(playerY, targetY, weight)

        let lerpDelta = delta * 5
        if (lerpDelta > 1) {
            lerpDelta = 1
        }

        cameraGroup.position.x = lerp(cameraGroup.position.x, finalX, lerpDelta)
        cameraGroup.position.y = lerp(cameraGroup.position.y, finalY, lerpDelta)

        cameraGroup.position.z = lerp(0, 9, rWeight)
        cameraGroup.rotation.x = lerp(0, degToRad(50), rWeight)

        const light = lightRef.current
        if (!light) return
        light.target.position.x = cameraGroup.position.x
        light.target.position.y = cameraGroup.position.y
        light.target.position.z = cameraGroup.position.z
        light.target.updateMatrixWorld()

    }, [playerObjectRef, cameraGroup, targetPositionRef, targetWeight, rotateWeight, fovSpring])

    useFrame(onFrame)

}

type Config = {
    top: number,
    left: number,
    right: number,
    bottom: number,
    horizontalRatio: number,
    verticalRation: number,
}

const portraitConfig: Config = {
    top: 20,
    left: -10,
    right: 10,
    bottom: -8,
    horizontalRatio: 7,
    verticalRation: 4,
}

const landscapeConfig: Config = {
    top: -12,
    left: 24,
    right: -50,
    bottom: 70,
    horizontalRatio: 1,
    verticalRation: 1,
}

const Camera: React.FC = () => {

    const groupRef = useRef<Group>(null as unknown as Group)
    const lightRef = useRef<DirectionalLight>(null as unknown as DirectionalLight)
    const cameraRef = useRef<PerspectiveCamera>(null as unknown as PerspectiveCamera)
    const {setDefaultCamera} = useThree()

    useFollow(groupRef, lightRef, cameraRef)

    useLayoutEffect(() => {
        const initialPosition = getPlayerEventInitialPosition()
        groupRef.current.position.x = initialPosition.x
        groupRef.current.position.y = initialPosition.y
        cameraRef.current.up.set(0,0,1);
        cameraRef.current.lookAt(initialPosition.x, initialPosition.y, 1)
        void setDefaultCamera(cameraRef.current)
        cameraStateProxy.camera = ref(cameraRef.current) as PerspectiveCamera
    }, [])

    const [width, height] = useWindowSize()


    const ratio = width / height

    const config = width > height ? landscapeConfig : portraitConfig
    const {
        top,
        left,
        right,
        bottom,
        horizontalRatio,
        verticalRation,
    } = config

    useEffect(() => {
        lightRef.current.shadow.needsUpdate = true
    })

    return (
        <group ref={groupRef}>
            <perspectiveCamera ref={cameraRef} position={[0, -40, 40]}>
                <directionalLight ref={lightRef}
                                  position={[30, 30, 40]}
                                  intensity={0.4}
                                  castShadow
                                  shadowBias={-0.001}
                                  shadowCameraTop={top * verticalRation * ratio}
                                  shadowCameraLeft={left * horizontalRatio * ratio}
                                  shadowCameraBottom={bottom * verticalRation}
                                  shadowCameraRight={right * horizontalRatio}
                                  shadow-mapSize-width={2048}
                                  shadow-mapSize-height={2048} key={Date.now()} />
            </perspectiveCamera>
        </group>
    )
}

export default Camera
