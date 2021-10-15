
import create from "zustand";
import {getCurrentUserId, useCurrentUserId} from "../auth";
import {ANIMALS} from "../../3d/animals/animals";
import {DEFAULT_ROOM_KEY} from "../../data/config";
import {useUserSessionId} from "../user";
import {proxy} from "valtio";

export type FirebaseUserData = {
    online: boolean,
    joined: boolean,
    animal?: string,
    name?: string,
    socketId?: string,
    currentRoom?: string,
    volumeMuted?: boolean,
    micMuted?: boolean,
    sessionId?: string,
    forceMuted?: boolean,
    banned?: boolean,
    kicked?: boolean,
    userRole?: string,
    isSelectingAnimal?: boolean,
}

export type StoredUserData = FirebaseUserData & {
    id: string,
}

export type Users = {
    [id: string]: FirebaseUserData
}

export type StoredUsers = {
    [id: string]: StoredUserData
}

type StoreState = {
    users: StoredUsers
}

export const useUsersStore = create<StoreState>(set => ({
    users: {},
}))

export const useUser = (userId: string): FirebaseUserData => {
    return useUsersStore(state => state.users[userId]) ?? {}
}

export const useCurrentUserRole = () => {
    const userId = useCurrentUserId()
    const user = useUser(userId)
    return user?.userRole ?? ''
}

export const useUserAnimalKey = (userId: string): string => {
    const user = useUser(userId)
    return user && user.animal ? user.animal : ANIMALS.Chick.key
}

export const getUser = (userId: string): FirebaseUserData | null => {
    return useUsersStore.getState().users[userId] ?? null
}

export const getCurrentUser = (): FirebaseUserData | null => {
    return getUser(getCurrentUserId())
}

export const useCurrentUser = () => {
    const currentUserId = useCurrentUserId()
    return useUser(currentUserId)
}

export const useCurrentSessionIsActiveSession = () => {
    const sessionId = useUserSessionId()
    const currentUser = useCurrentUser()
    if (!sessionId) return false
    return currentUser.sessionId === sessionId
}

export const useCurrentRoomId = () => {
    const user = useCurrentUser()
    if (!user) return DEFAULT_ROOM_KEY
    return user.currentRoom || DEFAULT_ROOM_KEY
}

export const getCurrentRoomId = () => {
    const user = getCurrentUser()
    if (!user) return DEFAULT_ROOM_KEY
    return user.currentRoom || DEFAULT_ROOM_KEY
}

export const getUserRoom = (user: FirebaseUserData) => {
    return user.currentRoom || DEFAULT_ROOM_KEY
}

export const useUsersWithSocketsList = (): [string, string][] => {
    const currentId = useCurrentUserId()
    const users = useUsersStore(state => state.users)
    const currentRoom = useCurrentRoomId()
    return Object.entries(users).filter(([key, user]) => {
        return (user.online && key !== currentId) && (currentRoom === getUserRoom(user)) && !!user.socketId
    }).map(([key, {socketId}]) => [key, socketId as string])
}

export const useEventUsers = () => {
    return useUsersStore(state => state.users)
}

export const useEventUser = (userId: string) => {
    return useEventUsers()[userId]
}

export const useAvailableUsers = (requireSameRoom: boolean = true): StoredUserData[] => {
    const currentId = useCurrentUserId()
    const users = useUsersStore(state => state.users)
    const currentRoom = useCurrentRoomId()
    return Object.entries(users).filter(([key, user]) => {
        return (user.online && key !== currentId && !user.isSelectingAnimal) && (requireSameRoom ? (currentRoom === getUserRoom(user)) : true) && user.joined
    }).map(([key, user]) => user)
}

export const useUsersList = (): string[] => {
    return useAvailableUsers().map(({id}) => id)
}

export const addUsers = (users: Users) => {
    useUsersStore.setState(state => {
        const updatedUsers = {
            ...state.users,
        }
        Object.entries(users).forEach(([id, user]) => {
            if (updatedUsers[id]) {
                updatedUsers[id] = {
                    ...updatedUsers[id],
                    ...user,
                }
            } else {
                updatedUsers[id] = {
                    id,
                    ...user,
                }
            }
        })
        return {
            users: updatedUsers,
        }
    })
}
