import React, {MutableRefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react"
import {get, set} from "local-storage";
import {useCurrentUserId, useIsAuthenticated} from "../../../state/auth";
import {getEventUserDataRef, getEventUserRef} from "../../../firebase/refs";
import {getEventId, useEventStoreEventId} from "../../../state/event/event";
import {updateUserData} from "../../../firebase/database";
import Player from "../../../3d/Player";
import {
    BodyApi,
    BodyType, createBoxFixture,
    createCircleFixture,
    useBody,
    useCollisionEvents,
    useFixedUpdate,
    useStoreMesh
} from "react-three-game-engine";
import {Object3D, AudioListener, MathUtils} from "three";
import {Vec2} from "planck-js";
import {inputsProxy, inputsRawState} from "../../../gameplay/inputs/state";
import {lerpRadians, vectorToAngle} from "../../../utils/angles";
import {useFrame} from "react-three-fiber";
import {useStoreObject} from "../../../state/objects";
import {audioState, setAudioListener, useIsMicMuted, useIsMuted} from "../../../state/audio";
import {useProxy} from "valtio";
import {useBox} from "@react-three/cannon";
import CurrentUserInteractivePlane from "./CurrentUserInteractivePlane";
import {calculateVectorBetweenVectors, calculateVectorsDistance} from "../../../utils/vectors";
import CurrentUserTargetPosition from "./CurrentUserTargetPosition";
import {useCurrentSessionIsActiveSession, useUser, useUserAnimalKey} from "../../../state/event/users";
import {useCurrentPlayerAnimal, useShowDebug} from "../../../state/ui";
import { playerProxy } from "../../../state/player";
import {COLLISION_FILTER_GROUPS} from "../../../physics/collisions";
import {useCollisionsHandler} from "./useCollisionsHandler";
import EventUserUI from "../EventUser/EventUserUI";
import {usePlayerState} from "../EventUser/usePlayerState";
import {EventUserContext} from "../EventUser/context";
import EventUserVolumeDetector from "../EventUser/EventUserVolumeDetector";
import {hifiApi} from "../../audio/EventHifiAudioHandler";
import {Box, Cylinder, Sphere} from "@react-three/drei";
import { AssetPreview } from "../AssetPreview";
import {useAudioAdjustmentHandler} from "./useAudioAdjustmentHandler";
import {useDisplayAssetPreview} from "../EventUI/AssetManager/CreateAssetView";
const radToDeg = MathUtils.radToDeg;

const velocity = Vec2(0, 0)
const v2 = Vec2(0, 0)

const getEventPlayerPositionStorageKey = () => {
    return `${getEventId()}-playerPosition`
}

export const getPlayerEventInitialPosition = () => {
    const key = getEventPlayerPositionStorageKey()
    const storedValue = get(key)
    if (storedValue) {
        return storedValue as {
            x: number,
            y: number,
        }
    }
    return {
        x: 0,
        y: 0,
    }
}

const locallyStorePlayerPosition = (x: number, y: number) => {
    const key = getEventPlayerPositionStorageKey()
    set(key, {
        x,
        y,
    })
}

const useUpdates = (playerRef: MutableRefObject<Object3D>) => {

    const isAuthenticated = useIsAuthenticated()
    const userId = useCurrentUserId()
    const lastUpdateRef = useRef({
        x: 0,
        y: 0,
        angle: 0,
    })

    const eventId = useEventStoreEventId()

    const userDataRef = useMemo(() => {
        return getEventUserDataRef(eventId, userId)
    }, [userId, eventId])

    const handleUpdate = useCallback(() => {

        const playerObject = playerRef.current

        const x = Number(playerObject.position.x.toFixed(2))
        const y = Number(playerObject.position.y.toFixed(2))
        const angle = playerObject.rotation.z

        const unchanged = lastUpdateRef.current.x === x && lastUpdateRef.current.y === y && lastUpdateRef.current.angle === angle

        if (unchanged) return

        updateUserData(userDataRef, x, y, angle)

        lastUpdateRef.current.x = x
        lastUpdateRef.current.y = y
        lastUpdateRef.current.angle = angle

        locallyStorePlayerPosition(x, y)


    }, [userDataRef, playerRef])

    useEffect(() => {

        if (!isAuthenticated) return

        const interval = setInterval(() => {
            const playerObject = playerRef.current
            if (!playerObject) return
            const x = Number(playerObject.position.x.toFixed(2))
            const y = Number(playerObject.position.y.toFixed(2))
            if (hifiApi.updatePlayerPosition) {
                hifiApi.updatePlayerPosition(x, y, radToDeg(playerObject.rotation.z))
            }
        }, 100)

        return () => {
            clearInterval(interval)
        }

    }, [isAuthenticated])

    useEffect(() => {

        if (!isAuthenticated || !userId) return

        const interval = setInterval(handleUpdate, 1000)

        return () => clearInterval(interval)

    }, [isAuthenticated, userId, handleUpdate])

    const isMuted = useIsMuted()
    const isMicMuted = useIsMicMuted()

    const userRef = useMemo(() => {
        return getEventUserRef(eventId, userId)
    }, [userId, eventId])

    useEffect(() => {
        userRef.update({
            volumeMuted: isMuted,
        })
    }, [userRef, isMuted])

    useEffect(() => {
        const update: any = {
            micMuted: isMicMuted,
        }
        if (!isMicMuted) {
            update.forceMuted = false
        }
        userRef.update(update)
    }, [userRef, isMicMuted])

}

const UpdateHandler: React.FC<{
    playerRef: MutableRefObject<Object3D>
}> = ({playerRef}) => {
    useUpdates(playerRef)
    return null
}

const useController = (api: BodyApi, ref: MutableRefObject<Object3D>, rotationRef: MutableRefObject<Object3D>) => {

    const localRef = useRef({
        angle: 0,
    })

    const getMoveVelocity = useCallback((): [number, number, number] => {
        let xVel = 0
        let yVel = 0
        let speed = 1

        if (!inputsRawState.active && inputsProxy.targetPosition) {
            const x = ref.current.position.x
            const y = ref.current.position.y
            const [targetX, targetY] = inputsProxy.targetPosition
            const vector = calculateVectorBetweenVectors(targetX, x, targetY, y)
            const distance = calculateVectorsDistance(x, targetX, y, targetY)
            speed = inputsProxy.targetPositionSpeed
            if (distance > 0.5) {
                xVel = vector[0]
                yVel = vector[1]
            } else {
                inputsProxy.targetPosition = null
                inputsProxy.running = false
            }
        } else if (!inputsRawState.active && inputsProxy.targetVelocity) {
            xVel = inputsProxy.targetVelocity[0]
            yVel = inputsProxy.targetVelocity[1]
            speed = inputsProxy.targetPositionSpeed
        } else {
            xVel = inputsRawState.horizontal
            yVel = inputsRawState.vertical
            speed = inputsRawState.running ? 1.5 : 1
        }


        return [xVel, yVel, speed]
    }, [])

    const onFrame = useCallback((state: any, delta: number) => {

        const [xVel, yVel] = getMoveVelocity()

        const moving = xVel !== 0 || yVel !== 0

        let newAngle = localRef.current.angle

        if (moving) {
            const angle = vectorToAngle(xVel, yVel * -1)
            localRef.current.angle = angle
            newAngle = angle
        }

        rotationRef.current.rotation.z = lerpRadians(rotationRef.current.rotation.z, newAngle, delta * 10)

        playerProxy.isMoving = moving

    }, [rotationRef, localRef, getMoveVelocity])

    const onFixedUpdate = useCallback((delta: number) => {

        const [xVel, yVel, speedMultiplier] = getMoveVelocity()

        // const speed = 8.5
        const speed = 6 * speedMultiplier

        velocity.set((xVel) * speed, (yVel) * speed)

        api.setLinearVelocity(velocity)

    }, [api, getMoveVelocity])

    useFrame(onFrame)
    useFixedUpdate(onFixedUpdate)

}

const CurrentUser: React.FC = () => {

    const ref = useRef<Object3D>(null!)
    const rotationRef = useRef<Object3D>(null!)
    const userId = useCurrentUserId()
    useStoreObject('player', ref)
    useStoreObject('playerRotation', rotationRef)
    useCollisionsHandler()
    const [initialPosition] = useState(() => getPlayerEventInitialPosition())

    const [, api] = useBody(() => ({
        type: BodyType.dynamic,
        position: Vec2(initialPosition.x, initialPosition.y),
        linearDamping: 15,
        fixtures: [
            createCircleFixture({radius: 0.55, fixtureOptions: {
                    density: 20,
                    filterCategoryBits: COLLISION_FILTER_GROUPS.player,
                }}),
            createBoxFixture({
                width: 40,
                height: 40,
                fixtureOptions: {
                    isSensor: true,
                    filterCategoryBits: COLLISION_FILTER_GROUPS.otherPlayers,
                    filterMaskBits: COLLISION_FILTER_GROUPS.otherPlayers,
                }
            }),
            createBoxFixture({
                width: 110,
                height: 80,
                center: [0, 10],
                fixtureOptions: {
                    isSensor: true,
                    filterCategoryBits: COLLISION_FILTER_GROUPS.otherPlayers,
                    filterMaskBits: COLLISION_FILTER_GROUPS.otherPlayers,
                }
            }),
        ],
    }), {
        uuid: 'player',
        fwdRef: ref,
        listenForCollisions: true,
    })


    useController(api, ref, rotationRef)
    useAudioAdjustmentHandler()

    const {siteInteracted} = useProxy(audioState)

    const audioListenerRef = useRef<AudioListener>()

    useEffect(() => {
        if (siteInteracted && audioListenerRef.current) {
            setAudioListener(audioListenerRef.current)
        }
    }, [audioListenerRef, siteInteracted])

    const animal = useCurrentPlayerAnimal()
    const isMoving = useProxy(playerProxy).isMoving
    const userData = useUser(userId)
    const playerState = usePlayerState()
    const showDebug = false

    const isActive = useCurrentSessionIsActiveSession()
    const editingAsset = useDisplayAssetPreview()

    return (
        <EventUserContext.Provider value={{playerState, userData}}>
            {
                userId && isActive && (
                    <UpdateHandler playerRef={ref}/>
                )
            }
            <group ref={ref}>
                {
                    editingAsset && (
                        <AssetPreview/>
                    )
                }
                {
                    showDebug && (
                        <>
                            <Box args={[40, 1, 40]} rotation={[-Math.PI / 2, 0, 0]}>
                                <meshBasicMaterial color="red" transparent opacity={0.5} />
                            </Box>
                            <Box args={[110, 0.25, 80]} position={[0, 10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                <meshBasicMaterial color="purple" transparent opacity={0.5} />
                            </Box>
                        </>
                    )
                }
                <group ref={rotationRef} visible={!editingAsset}>
                    <Player userId={userId} currentUser animal={animal} isMoving={isMoving}/>
                </group>
                {
                    !editingAsset && (
                        <EventUserUI userId={userId} self/>
                    )
                }
                {
                    siteInteracted && (
                        <>
                            <audioListener ref={audioListenerRef}/>
                            <EventUserVolumeDetector userId={userId}/>
                        </>
                    )
                }
                {
                    isActive && (
                        <CurrentUserInteractivePlane playerRef={ref}/>
                    )
                }
            </group>
            <CurrentUserTargetPosition/>
        </EventUserContext.Provider>
    )
}

export default CurrentUser
