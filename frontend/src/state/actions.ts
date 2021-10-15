import {getEventId} from "./event/event";
import {
    getEventRoomsDataRef,
    getEventSessionDataRef,
    getEventUserRef
} from "../firebase/refs";
import {getCurrentUserId} from "./auth";

export const createNewRoom = (name: string) => {
    const eventId = getEventId()
    const ref = getEventRoomsDataRef(eventId)
    return ref.push({
        name,
        scenery: {},
    })
}

export const setRoomPortalDestination = (uid: string, roomUid: string) => {
    const eventId = getEventId()
    const ref = getEventSessionDataRef(eventId)
    return ref.update({
        [`roomPortals/${uid}`]: roomUid,
    })
}

export const joinRoom = (roomId: string) => {
    const eventId = getEventId()
    const userId = getCurrentUserId()
    const ref = getEventUserRef(eventId, userId)
    return ref.update({
        currentRoom: roomId,
    })
}