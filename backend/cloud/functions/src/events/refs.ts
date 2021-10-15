import {app} from "../app";

export const getAdminsRef = () => {
    return app.database().ref('admins')
}

export const getEventsRef = () => {
    return app.database().ref(`events`)
}

export const getEventRef = (eventId: string) => {
    return getEventsRef().child(eventId)
}

export const getEventRoomsDataRef = (eventId: string) => {
    return getEventRef(eventId).child("roomsData")
}

export const getEventRoomRef = (eventId: string, roomId: string) => {
    return getEventRoomsDataRef(eventId).child(roomId)
}

export const getEventRoomSceneryRef = (eventId: string, roomId: string) => {
    return getEventRoomRef(eventId, roomId).child('scenery')
}

export const getEventChannelsRef = (eventId: string) => {
    return getEventRef(eventId).child("channels")
}

export const getEventDataRef = (eventId: string) => {
    return getEventRef(eventId).child("eventData")
}

export const getEventAccessSettingsRef = (eventId: string) => {
    return getEventDataRef(eventId).child("accessSettings")
}

export const getEventGlobalStageRef = (eventId: string) => {
    return getEventRef(eventId).child("globalStage")
}

export const getEventGlobalChannelsRef = (eventId: string) => {
    return getEventRef(eventId).child("globalChannels")
}

export const getGlobalChannelRef = (eventId: string, channelId: string) => {
    return getEventGlobalChannelsRef(eventId).child(channelId)
}

export const getChannelRef = (eventId: string, channelId: string) => {
    return getEventChannelsRef(eventId).child(channelId)
}

export const getChannelActiveMembersRef = (eventId: string, channelId: string) => {
    return getChannelRef(eventId, channelId).child('activeMembers')
}

export const getChannelQueuedMembersRef = (eventId: string, channelId: string) => {
    return getChannelRef(eventId, channelId).child('queuedMembers')
}

export const getSecureEventsDataRef = () => {
    return app.database().ref(`secureEventData`)
}

export const getSecureEventDataRef = (eventId: string) => {
    return getSecureEventsDataRef().child(eventId)
}

export const getSecureEventDataGoogleSheetIdRef = (eventId: string) => {
    return getSecureEventDataRef(eventId).child('googleSheetId')
}

export const getSecureEventDataPasswordRef = (eventId: string) => {
    return getSecureEventDataRef(eventId).child('password')
}

export const getSecureEventDataApprovedAccessRef = (eventId: string) => {
    return getSecureEventDataRef(eventId).child('approvedAccess')
}

export const getSecureEventDataUsersWithAccessRef = (eventId: string) => {
    return getSecureEventDataRef(eventId).child('usersWithAccess')
}

export const getEventCreatorRef = (eventId: string) => {
    return getEventRef(eventId).child('eventData/creator')
}

export const getEventUserRef = (eventId: string, userId: string) => {
    return getEventRef(eventId).child('users').child(userId)
}
