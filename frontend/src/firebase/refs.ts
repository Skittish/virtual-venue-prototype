import {database, storage} from "./client";
import {getEventId} from "../state/event/event";
import {getCurrentRoomId} from "../state/event/users";

export const getDatabaseRef = () => {
    return database.ref()
}

export const getVirtualVenueAdminsRef = () => {
    return database.ref('admins')
}

export const getDataRef = () => {
    return database.ref('data')
}

export const getAssetsRef = () => {
    return getDataRef().child('assets')
}

export const getAssetRef = (assetKey: string) => {
    return getAssetsRef().child(assetKey)
}

export const getUsersRef = () => {
    return database.ref('users')
}

export const getUserRef = (userId: string) => {
    return getUsersRef().child(userId)
}

export const getUserBadgeInfoRef = (userId: string) => {
    return getUserRef(userId).child('badge')
}

export const getUserJoinedEventsRef = (userId: string) => {
    return getUserRef(userId).child('joinedEvents')
}

export const getEventsRef = () => {
    return database.ref('events')
}

export const getEventRef = (eventId: string) => {
    return getEventsRef().child(eventId)
}

export const getEventChatReactionsRef = (eventId: string) => {
    return getEventRef(eventId).child('globalChatReactions').child('users')
}

export const getEventChatRef = (eventId: string) => {
    return getEventRef(eventId).child('globalChat')
}

export const getEventChatSettingsRef = (eventId: string) => {
    return getEventRef(eventId).child('globalChatSettings')
}

export const getEventUsersRef = (eventId: string) => {
    return getEventRef(eventId).child("users")
}

export const getEventUserRef = (eventId: string, userId: string) => {
    return getEventUsersRef(eventId).child(userId)
}

export const getEventUserBadgeInfoRef = (eventId: string, userId: string) => {
    return getEventUserRef(eventId, userId).child('badge')
}

export const getEventUserConnectionsRef = (eventId: string, userId: string) => {
    return getEventUserRef(eventId, userId).child('connectionRequests')
}

export const getEventUsersDataRef = (eventId: string) => {
    return getEventRef(eventId).child("usersData")
}

export const getEventUserDataRef = (eventId: string, userId: string) => {
    return getEventUsersDataRef(eventId).child(userId)
}

export const getEventSessionDataRef = (eventId: string) => {
    return getEventRef(eventId).child("sessionData")
}

export const getEventSessionVideosDataRef = (eventId: string) => {
    return getEventSessionDataRef(eventId).child('videos')
}

export const getEventSessionVideoDataRef = (eventId: string, videoId: string) => {
    return getEventSessionDataRef(eventId).child('videos').child(videoId)
}

export const getVideoDataRef = (videoId: string) => {
    return getEventSessionVideoDataRef(getEventId(), videoId)
}

export const getEventSessionDataVideoUrlRef = (eventId: string) => {
    return getEventRef(eventId).child("sessionData").child("video/url")
}

export const getEventRoomsDataRef = (eventId: string) => {
    return getEventRef(eventId).child("roomsData")
}

export const getEventRoomDataRef = (eventId: string, roomId: string) => {
    return getEventRoomsDataRef(eventId).child(roomId)
}

export const getEventSceneryInstanceRef = (id: string) => {
    const eventId = getEventId()
    const roomRef = getEventRoomDataRef(eventId, getCurrentRoomId())
    const sceneryRef = roomRef.child('scenery')
    return sceneryRef.child(id)
}

export const getEventRoomDataVideosRef = (eventId: string, roomId: string) => {
    return getEventRoomsDataRef(eventId).child(roomId).child('videos')
}

export const getUserStorageRef = (userId: string) => {
    return storage.ref('users').child(userId)
}

export const getUserImagesStorageRef = (userId: string) => {
    return getUserStorageRef(userId).child('images')
}

export const getModelsStorageRef = () => {
    return storage.ref().child('models');
}

export const getRawModelStorageRef = (modelPath: string) => {
    return storage.ref(modelPath)
}

export const getEventChannelsRef = (eventId: string) => {
    return getEventRef(eventId).child('channels')
}

export const getEventChannelRef = (eventId: string, channelId: string) => {
    return getEventChannelsRef(eventId).child(channelId)
}

export const getEventGlobalChannelsRef = (eventId: string) => {
    return getEventRef(eventId).child('globalChannels')
}

export const getEventGlobalChannelRef = (eventId: string, channelId: string) => {
    return getEventGlobalChannelsRef(eventId).child(channelId)
}

export const getEventGlobalStageRef = (eventId: string) => {
    return getEventRef(eventId).child('globalStage')
}

export const getSecureEventsDataRef = () => {
    return database.ref(`secureEventData`)
}

export const getSecureEventDataRef = (eventId: string) => {
    return getSecureEventsDataRef().child(eventId)
}

export const getEventPasswordRef = (eventId: string) => {
    return getSecureEventDataRef(eventId).child('password')
}

export const getEventApprovedAccessRef = (eventId: string) => {
    return getSecureEventDataRef(eventId).child('approvedAccess')
}

export const getSecureEventDataGoogleSheetIdRef = (eventId: string) => {
    return getSecureEventDataRef(eventId).child('googleSheetId')
}

export const getEventAccessSettingsRef = (eventId: string) => {
    return getEventRef(eventId).child("eventData/accessSettings")
}

export const getSecureEventDataUsersWithAccessRef = (eventId: string) => {
    return getSecureEventDataRef(eventId).child('usersWithAccess')
}

export const getEventUserRoleRef = (eventId: string, userId: string) => {
    return getEventRef(eventId).child(`eventData/userRoles/${userId}`)
}
