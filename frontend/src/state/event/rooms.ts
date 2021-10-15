import create from "zustand";
import {useSessionData} from "./sessionData";
import {useAvailableUsers, useCurrentRoomId, useUsersList} from "./users";

export type SceneryInstance = {
    key: string,
    model?: string,
    assetKey?: string,
    x: number,
    y: number,
    scale: number,
    rotation: number,
    channelId?: string,
    [key: string]: any,
}

export type RoomConfigAudioData = {
    userAttenuation: number,
    userRolloff: number,
}

export type RoomData = {
    name?: string,
    channelId?: string,
    hifi?: {
        spaceId: string,
    },
    scenery: {
        [key: string]: SceneryInstance
    },
    config?: {
        audio?: RoomConfigAudioData
    }
}

export const getRoomConfigAudioData = (roomData: RoomData): RoomConfigAudioData | undefined => {
    return roomData.config?.audio
}

export const getRoomName = (room: RoomData, defaultName?: string) => {
    return room.name || (defaultName || '')
}

export type RoomsData = {
    [key: string]: RoomData
}

type Store = {
    rooms: RoomsData
}

export const useRoomsStore = create<Store>(() => ({
    rooms: {},
}))

export const setRoom = (uid: string, data: RoomData) => {
    useRoomsStore.setState(state => ({
        rooms: {
            ...state.rooms,
            [uid]: data,
        }
    }))
}

export const useRoom = (uid: string): RoomData => {
    return useRoomsStore(state => state.rooms[uid]) ?? {
        scenery: {}
    }
}

export const useCurrentRoom = (): RoomData => {
    const roomId = useCurrentRoomId()
    return useRoom(roomId)
}

export const useCurrentRoomScenery = () => {
    const currentRoom = useCurrentRoom()
    return currentRoom?.scenery ?? null
}

export const useSceneryInstance = (id: string) => {
    const scenery = useCurrentRoomScenery()
    return scenery?.[id]
}

const DEFAULT_CHANNEL_ID = 'default'

export const useCurrentRoomDefaultChannelId = () => {
    const currentRoom = useCurrentRoom()
    return currentRoom?.channelId ?? DEFAULT_CHANNEL_ID
}

export const useCurrentRoomAudioConfig = () => {
    const currentRoom = useCurrentRoom()
    return currentRoom ? getRoomConfigAudioData(currentRoom) : undefined
}

export const useRooms = () => {
    return useRoomsStore(state => state.rooms)
}

export const useRoomPortalDestinationUid = (uid: string): string => {
    const sessionData = useSessionData()
    return sessionData.roomPortals ? sessionData.roomPortals[uid] : ''
}

export const getRoom = (uid: string): RoomData => {
    return useRoomsStore.getState().rooms[uid] ?? {
        scenery: {}
    }
}

export const useRoomPortalDestination = (uid: string) => {
    const destination = useRoomPortalDestinationUid(uid)
    const room = useRoom(destination)
    return room
}

export const useNumberOfUsersInRoom = (id: string) => {
    const users = useAvailableUsers(false)
    const usersInRoom = users.filter(user => {
        return user.currentRoom === id
    })
    return usersInRoom.length
}
