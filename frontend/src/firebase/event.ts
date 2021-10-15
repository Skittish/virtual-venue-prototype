import {getCurrentUserId} from "../state/auth";
import {
    getEventChannelRef,
    getEventGlobalChannelRef,
    getEventSessionDataRef,
    getEventUserRef,
    getEventUsersRef
} from "./refs";
import {getEventId} from "../state/event/event";

export const setEventUserSocketId = (eventId: string, socketId: string) => {
    const userId = getCurrentUserId()
    return getEventUserRef(eventId, userId).update({
        socketId,
    })
}

export const setEventUserSessionId = (eventId: string, sessionId: string) => {
    const userId = getCurrentUserId()
    return getEventUserRef(eventId, userId).update({
        sessionId,
    })
}

export const setEventUserConnectionRequest = (eventId: string, userId: string, socketId: string, initiator: boolean) => {
    const currentUserId = getCurrentUserId()
    const userRef = getEventUserRef(eventId, userId)
    return userRef.update({
        [`connectionRequests/${currentUserId}`]: {
            socketId,
            initiator,
        }
    })
}

export const setEventClosed = (closed: boolean) => {
    const eventId = getEventId()
    const sessionDataRef = getEventSessionDataRef(eventId)
    return sessionDataRef.update({
        ['eventConfig/eventIsClosed']: closed,
    })
}

export const setEventPublicEditingEnabled = (enabled: boolean) => {
    const eventId = getEventId()
    const sessionDataRef = getEventSessionDataRef(eventId)
    return sessionDataRef.update({
        ['eventConfig/publicEditingEnabled']: enabled,
    })
}

export const setUserMuted = (userId: string, muted: boolean) => {
    const userRef = getEventUserRef(getEventId(), userId)
    return userRef.update({
        forceMuted: muted,
    })
}

export const setUserBanned = (userId: string, banned: boolean) => {
    const userRef = getEventUserRef(getEventId(), userId)
    return userRef.update({
        banned,
    })
}

export const setUserRole = (userId: string, userRole: string) => {
    const userRef = getEventUserRef(getEventId(), userId)
    return userRef.update({
        userRole,
    })
}

export const kickUser = (userId: string) => {
    const userRef = getEventUserRef(getEventId(), userId)
    return userRef.update({
        joined: false,
        kicked: true,
    })
}

export const setUserOffline = () => {
    const userRef = getEventUserRef(getEventId(), getCurrentUserId())
    return userRef.update({
        online: false,
    })
}

export const getConnectedChannelRef = (channelId: string, isGlobalChannel: boolean) => {
    return isGlobalChannel ? getEventGlobalChannelRef(getEventId(), channelId) : getEventChannelRef(getEventId(), channelId)
}

export const setChannelConnected = (channelId: string, isConnected: boolean, isGlobalChannel: boolean) => {
    const ref = getConnectedChannelRef(channelId, isGlobalChannel)
    return ref.update({
        [`users/${getCurrentUserId()}/connected`]: isConnected,
    })
}
