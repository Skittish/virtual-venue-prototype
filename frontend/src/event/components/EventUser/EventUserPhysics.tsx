import React, {MutableRefObject, useEffect} from "react"
import {Object3D} from "three";
import {BodyType, createCircleFixture, useBody} from "react-three-game-engine";
import {Vec2} from "planck-js";
import {COLLISION_FILTER_GROUPS, COLLISION_GROUP_TYPE} from "../../../physics/collisions";
import {useStoredObjectRef} from "../../../state/objects";
import {getApproximateDistanceBetweenObjects, getDistanceBetweenObjects} from "../../../utils/distance";
import {setPlayerCollisionDistant} from "../CurrentUser/useCollisionsHandler";

const v2 = Vec2(0, 0)
const v2b = Vec2(0, 0)

export const playersDistance: Record<string, number> = {}

export const EventUserPhysics: React.FC<{
    userId: string,
    groupRef: MutableRefObject<Object3D>,
}> = ({userId, groupRef}) => {

    const playerObjectRef = useStoredObjectRef('player')

    useEffect(() => {

        const interval = setInterval(() => {

            const playerObject = playerObjectRef?.current

            if (!playerObject) return

            const distance = getApproximateDistanceBetweenObjects(playerObject, groupRef.current)
            setPlayerCollisionDistant(userId, distance <= 4500)
            playersDistance[userId] = distance

        }, 100)

        return () => {
            clearInterval(interval)
        }

    }, [playerObjectRef])

    useEffect(() => {

        return () => {
            delete playersDistance[userId]
        }

    }, [])

    return null
}
