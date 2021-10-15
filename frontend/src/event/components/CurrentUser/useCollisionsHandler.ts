import {useCollisionEvents} from "react-three-game-engine";
import {useCallback, useEffect} from "react";
import {COLLISION_GROUP_TYPE} from "../../../physics/collisions";
import {
    setChannelZoneCollided,
    setRoomPortalCollided,
    setStageCollided,
    setVideoScreenCollided
} from "../../../state/collisions";
import {proxy, useProxy} from "valtio";
import {setClosePlayer, setDistantPlayer} from "../EventListeners";

type CollisionData = {
    uuid: string,
    fixtureIndex: number,
    collidedFixtureIndex: number,
    groupType: number,
    [key: string]: any,
}

enum FixtureIndex {
    BODY,
    CLOSE_RANGE,
    DISTANT_RANGE,
}

const playerCollisionsProxy = proxy<Record<string, {
    close: boolean,
    distant: boolean,
}>>({})

export const setPlayerCollisionClose = (id: string, collided: boolean) => {
    if (!playerCollisionsProxy[id]) {
        playerCollisionsProxy[id] = {
            close: collided,
            distant: false,
        }
    } else {
        playerCollisionsProxy[id].close = collided
    }
}

export const setPlayerCollisionDistant = (id: string, collided: boolean) => {
    if (playerCollisionsProxy[id] && playerCollisionsProxy[id].distant === collided) return
    if (!playerCollisionsProxy[id]) {
        playerCollisionsProxy[id] = {
            distant: collided,
            close: false,
        }
    } else {
        playerCollisionsProxy[id].distant = collided
    }
}

const handleOtherPlayerCollision = (started: boolean, data: any, fixtureIndex: number) => {
    switch (fixtureIndex) {
        case FixtureIndex.CLOSE_RANGE:
            if (started) {
                setPlayerCollisionClose(data.userId, true)
            } else {
                setPlayerCollisionClose(data.userId, false)
            }
            break;
        case FixtureIndex.DISTANT_RANGE:
            if (started) {
                setPlayerCollisionDistant(data.userId, true)
            } else {
                setPlayerCollisionDistant(data.userId, false)
            }
            break;
    }
}

export const usePlayerCollision = (id: string) => {
    const collisionResult = useProxy(playerCollisionsProxy)[id] ?? {
        close: true,
        distant: true,
    }
    return collisionResult
}

export const useCollisionsHandler = () => {

    const onCollideStart = useCallback(({uuid, groupType, ...data}: CollisionData, fixtureIndex: number) => {
        switch (groupType) {
            case COLLISION_GROUP_TYPE.ROOM_PORTAL:
                setRoomPortalCollided(data.roomId, true)
                break;
            case COLLISION_GROUP_TYPE.VIDEO_MAIN_AREA:
                setVideoScreenCollided(data.videoId, true)
                break;
            case COLLISION_GROUP_TYPE.STAGE:
                setStageCollided(data.uid, true)
                break;
            case COLLISION_GROUP_TYPE.CHANNEL_ZONE:
                setChannelZoneCollided(data.uid, true)
                break;
            case COLLISION_GROUP_TYPE.OTHER_PLAYER:
                handleOtherPlayerCollision(true, data, fixtureIndex)
                break;
        }
    }, [])

    const onCollideEnd = useCallback(({uuid, groupType, ...data}: CollisionData, fixtureIndex) => {
        switch (groupType) {
            case COLLISION_GROUP_TYPE.ROOM_PORTAL:
                setRoomPortalCollided(data.roomId, false)
                break;
            case COLLISION_GROUP_TYPE.VIDEO_MAIN_AREA:
                setVideoScreenCollided(data.videoId, false)
                break;
            case COLLISION_GROUP_TYPE.STAGE:
                setStageCollided(data.uid, false)
                break;
            case COLLISION_GROUP_TYPE.CHANNEL_ZONE:
                setChannelZoneCollided(data.uid, false)
                break;
            case COLLISION_GROUP_TYPE.OTHER_PLAYER:
                handleOtherPlayerCollision(false, data, fixtureIndex)
                break;
        }
    }, [])

    useCollisionEvents('player', onCollideStart, onCollideEnd)
}
