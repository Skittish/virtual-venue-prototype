import {proxy, useProxy} from "valtio";
import {useUserAnimalKey} from "./event/users";
import {useCurrentUserId} from "./auth";

export const uiProxy = proxy({
    showUsers: false,
    showMicSettings: false,
    editRoomAudio: false,
    editingRooms: false,
    editAccessSettings: false,
    showDebug: false,
    temporaryAnimal: '',
    changingAnimal: false,
    settingsOpen: false,
    editMode: false,
    editingRoomPortal: '',
    editingSignPost: '',
    creatingNewRoom: false,
    focusedVideo: '',
    hasConnectionError: false,
    hasNonPrimaryConnectionError: false,
})

export const signPostMessageProxy = proxy({
    message: '',
})

export const setSignPostMessage = (message: string) => {
    signPostMessageProxy.message = message
}

export const useSignPostMessage = () => {
    return useProxy(signPostMessageProxy).message
}

export const setEditingSignPost = (id: string) => {
    uiProxy.editingSignPost = id
}

export const useHasConnectionError = () => {
    const state = useProxy(uiProxy)
    return state.hasConnectionError || state.hasNonPrimaryConnectionError
}

export const setHasNonPrimaryConnectionError = (hasConnectionError: boolean) => {
    uiProxy.hasNonPrimaryConnectionError = hasConnectionError
}

export const setHasConnectionError = (hasConnectionError: boolean) => {
    uiProxy.hasConnectionError = hasConnectionError
}

export const useShowDebug = () => {
    return useProxy(uiProxy).showDebug
}

export const setEditAccessSettings = (editing: boolean) => {
    uiProxy.editAccessSettings = editing
}

export const useIsEditingAccessSettings = () => {
    return useProxy(uiProxy).editAccessSettings
}

export const setFocusedVideo = (id: string) => {
    uiProxy.focusedVideo = id
}

export const useIsChangingAnimal = () => {
    return useProxy(uiProxy).changingAnimal
}

export const setCreatingNewRoom = (creatingNewRoom: boolean) => {
    uiProxy.creatingNewRoom = creatingNewRoom
}

export const useIsCreatingNewRoom = () => {
    return useProxy(uiProxy).creatingNewRoom
}

export const useEditingRoomPortal = () => {
    return useProxy(uiProxy).editingRoomPortal
}

export const useHideUi = () => {
    return useProxy(uiProxy).changingAnimal
}

export const useCurrentPlayerAnimal = () => {
    const userId = useCurrentUserId()
    const animal = useUserAnimalKey(userId)
    const {
        temporaryAnimal,
        changingAnimal,
    } = useProxy(uiProxy)
    if (changingAnimal && temporaryAnimal) {
        return temporaryAnimal
    }
    return animal
}

export const useFocusedVideo = () => {
    return useProxy(uiProxy).focusedVideo
}

export const useIsVideoFocused = (uid: string): boolean => {
    return (useFocusedVideo() === uid && !!uid)
}
