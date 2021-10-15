import React, {memo, MutableRefObject, useEffect, useMemo, useRef, useState} from "react"
import {useUser, useUserAnimalKey} from "../../../state/event/users";
import Player from "../../../3d/Player";
import {PlayerPositions} from "../EventUsers";
import {Object3D, Vector3} from "three";
import {useFrame} from "react-three-fiber";
import { lerp } from "../../../utils/numbers";
import {calculateAngleBetweenVectors, lerpRadians} from "../../../utils/angles";
import {useStoreObject} from "../../../state/objects";
import EventUserAudio from "./EventUserAudio";
import {audioState, useAudioListener} from "../../../state/audio";
import {proxy, useProxy} from "valtio";
import EventUserVolumeDetector from "./EventUserVolumeDetector";
import { usePlayerState } from "./usePlayerState";
import { EventUserContext } from "./context";
import EventUserUI from "./EventUserUI";
import {useIsPlayerMoving} from "./useIsPlayerMoving";
import {useIsChangingAnimal} from "../../../state/ui";
import {getUserSnapshot, userHasRecentSnapshot} from "../../../state/event/snapshots";
import { EventUserPhysics } from "./EventUserPhysics";
import {usePlayerCollision} from "../CurrentUser/useCollisionsHandler";
import {useIsPlayerModelHidden} from "../EventListeners";
import LoadingAnimalPlaceholder from "../../../3d/LoadingAnimalPlaceholder";

const useUpdateUserPosition = (userId: string, ref: MutableRefObject<Object3D>, playerPositions: PlayerPositions) => {

    const localStateRef = useRef({
        previousX: 0,
        previousY: 0,
    })

    const {
        interpolateSnapshotPosition,
        interpolateFirebasePosition,
    } = useMemo(() => ({
        interpolateSnapshotPosition: () => {

            if (!ref.current) return

            const snapshot = getUserSnapshot(userId)

            if (!snapshot) return

            let newX = snapshot.x
            let newY = snapshot.y
            let newAngle = snapshot.a

            if (Math.abs(ref.current.position.x - newX) > 0.5 || Math.abs(ref.current.position.y - newY) > 0.5) {
                newX = lerp(ref.current.position.x, newX, 0.05)
                newY = lerp(ref.current.position.y, newY, 0.05)
                newAngle = lerpRadians(ref.current.rotation.z, newAngle, 0.05)
            }

            ref.current.position.x = newX
            ref.current.position.y = newY
            ref.current.rotation.z = newAngle

        },
        interpolateFirebasePosition: (delta: number) => {
            if (!ref.current) return

            // todo - determine whether to use snapshot data

            const playerData = playerPositions[userId]
            if (!playerData) return
            const {previousX, previousY, x, y, lastUpdated, targetAngle} = playerData


            const endTime = lastUpdated + 1000
            const currentDuration = endTime - Date.now()

            let progress = Math.abs((currentDuration - 1000) / 1000)

            progress = progress < 0 ? 0 : progress > 1 ? 1 : progress

            const newX = lerp(previousX, x, progress)
            const newY = lerp(previousY, y, progress)

            const {previousX: previousXPos, previousY: previousYPos} = localStateRef.current

            const xDiff = Math.abs(previousXPos - newX)
            const yDiff = Math.abs(previousYPos - newY)
            const movedSufficiently = xDiff > (delta) || yDiff > (delta)

            if (movedSufficiently) {
                const angle = calculateAngleBetweenVectors(previousXPos, newX, previousYPos, newY) * -1
                ref.current.rotation.z = lerpRadians(ref.current.rotation.z, angle, delta * 10)
            } else {
                const angle = targetAngle
                if (angle) {
                    ref.current.rotation.z = lerpRadians(ref.current.rotation.z, angle, delta * 10)
                }
            }

            ref.current.position.x = newX
            ref.current.position.y = newY

            localStateRef.current.previousX = newX
            localStateRef.current.previousY = newY
        }
    }), [playerPositions])

    useFrame((_, delta) => {

        if (userHasRecentSnapshot(userId)) {
            interpolateSnapshotPosition()
        } else {
            interpolateFirebasePosition(delta)
        }


    })

}

export const useUserPointerHandler = () => {

    const [pointerActive, setPointerActive] = useState(false)
    const [showBadge, setShowBadge] = useState(false)

    useEffect(() => {
        if (pointerActive) {
            const timeout = setTimeout(() => {
                setShowBadge(true)
            }, 100)
            return () => {
                clearTimeout(timeout)
            }
        } else {
            const timeout = setTimeout(() => {
                setShowBadge(false)
            }, 100)
            return () => {
                clearTimeout(timeout)
            }
        }
    }, [pointerActive])

    const {
        onPointerOver,
        onPointerOut,
    } = useMemo(() => ({
        onPointerOver: () => {
            // todo - check if user is dragging mouse, if so, ignore
            setPointerActive(true)
        },
        onPointerOut: () => {
            setPointerActive(false)
        },
    }), [])

    return {
        onPointerOut,
        onPointerOver,
        showBadge,
    }

}

const EventUser: React.FC<{
    userId: string,
    playerPositions: PlayerPositions,
}> = ({userId, playerPositions}) => {

    const ref = useRef<Object3D>(null!)
    useStoreObject(userId, ref)
    useUpdateUserPosition(userId, ref, playerPositions)
    const {siteInteracted} = useProxy(audioState)
    const userData = useUser(userId)
    const playerState = usePlayerState()
    const animal = useUserAnimalKey(userId)
    const isMoving = useIsPlayerMoving(ref)
    const isChangingAnimal = useIsChangingAnimal()
    const {close: isClose, distant: isDistant} = usePlayerCollision(userId)
    const isModelHidden = useIsPlayerModelHidden(userId)
    const isInRange = isClose || isDistant

    const {
        showBadge,
        onPointerOver,
        onPointerOut,
    } = useUserPointerHandler()

    return (
        <EventUserContext.Provider value={{playerState, userData}}>
            <group ref={ref} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
                <EventUserPhysics userId={userId} groupRef={ref}/>
                <Player userId={userId} hidden={isModelHidden || isChangingAnimal} animal={animal} isMoving={isMoving}/>
                {
                    isModelHidden && (
                        <LoadingAnimalPlaceholder animal='' showText={false}/>
                    )
                }
                {
                    (showBadge || (isInRange && !isChangingAnimal)) && (
                        <EventUserUI userId={userId} showBadge={showBadge}/>
                    )
                }
                {
                    siteInteracted && (
                        <>
                            <EventUserAudio userId={userId}/>
                            <EventUserVolumeDetector userId={userId}/>
                        </>
                    )
                }
            </group>
        </EventUserContext.Provider>
    )
}

export default memo(EventUser)
