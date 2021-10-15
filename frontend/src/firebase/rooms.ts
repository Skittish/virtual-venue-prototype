import {getEventId} from "../state/event/event";
import {getEventRoomDataRef, getEventSceneryInstanceRef} from "./refs";
import {SceneryInstance} from "../state/event/rooms";
import {getCurrentRoomId} from "../state/event/users";
import {createNewChannel} from "./events";

export const updateRoomName = (roomId: string, name: string) => {
    const eventId = getEventId()
    const roomRef = getEventRoomDataRef(eventId, roomId)
    return roomRef.update({
        name,
    })
}

export const createNewChannelAndAddToSceneryInstance = async (sceneryId: string) => {

    const channel = await createNewChannel(getEventId())

    const {channelId} = channel as {
        channelId: string,
    }

    const sceneryInstanceRef = getEventSceneryInstanceRef(sceneryId)

    return sceneryInstanceRef.update({
        channelId,
    })

}

export const addSceneryInstance = (roomId: string, assetKey: string, x: number, y: number) => {

    const eventId = getEventId()
    const roomRef = getEventRoomDataRef(eventId, roomId)

    const key = roomRef.child('scenery').push().key ?? ''

    const instance: SceneryInstance = {
        key,
        assetKey,
        x,
        y,
        scale: 1,
        rotation: 0,
    }

    const update = roomRef.child('scenery').update({
        [key]: instance,
    })

    return {
        id: key,
        promise: update,
    }

}

export const updateSceneryInstancePosition = (id: string, x: number, y: number, angle: number) => {

    const instanceRef = getEventSceneryInstanceRef(id)

    return instanceRef.update({
        x,
        y,
        rotation: angle,
    })

}

export const deleteSceneryInstances = (ids: string[]) => {

    const eventId = getEventId()
    const roomRef = getEventRoomDataRef(eventId, getCurrentRoomId())
    const sceneryRef = roomRef.child('scenery')

    const update: Record<string, any> = {}

    ids.forEach(id => {
        update[id] = null
    })

    return sceneryRef.update(update)

}

export const setRoomConfigAudio = (userAttenuation: number, userRolloff: number) => {
    const eventId = getEventId()
    const roomRef = getEventRoomDataRef(eventId, getCurrentRoomId())
    return roomRef.update({
        ['config/audio']: {
            userAttenuation,
            userRolloff,
        }
    })
}
