import {proxy, ref, useProxy} from "valtio";
import create from "zustand";
import {uiProxy} from "./ui";
import {DatabaseAsset} from "../firebase/assets";
import {deleteSceneryInstances} from "../firebase/rooms";

export enum EDIT_MODE {
    add = 'add',
    remove = 'remove',
    edit = 'edit',
}

export enum EDIT_CONTROL_MODE {
    translate = 'translate',
    rotate = 'rotate',
    scale = 'scale',
}

export const editingProxy = proxy<{
    controlMode: EDIT_CONTROL_MODE,
    addingSpecialAssetKey: string,
    addingAsset: DatabaseAsset | null,
    addingAssetKey: string,
    selectedModel: string,
    editMode: EDIT_MODE,
    position: {
        x: number,
        y: number,
    },
    selectedAssets: Record<string, boolean>
}>({
    controlMode: EDIT_CONTROL_MODE.translate,
    addingSpecialAssetKey: '',
    addingAsset: null,
    addingAssetKey: '',
    selectedModel: '',
    editMode: EDIT_MODE.add,
    position: {
        x: 0,
        y: 0,
    },
    selectedAssets: {},
})

export const useEditControlMode = () => {
    return useProxy(editingProxy).controlMode
}

export const setEditControlMode = (mode: EDIT_CONTROL_MODE) => {
    editingProxy.controlMode = mode
}

export const clearAddingAsset = () => {
    editingProxy.addingAsset = null
    editingProxy.addingAssetKey = ''
}

export const setSelectedAssets = (id: string, replace: boolean = true) => {
    if (replace) {
        editingProxy.selectedAssets = {
            [id]: true,
        }
    } else {
        editingProxy.selectedAssets[id] = true
    }
}

export const clearSelectedAssets = () => {
    editingProxy.selectedAssets = {}
}

export const deleteSceneryInstance = (key: string) => {
    deleteSceneryInstances([key])
}

export const deleteSelectedAssets = () => {
    deleteSceneryInstances(Object.keys(editingProxy.selectedAssets))
    clearSelectedAssets()
}

export const useIsAssetSelected = (id: string) => {
    return useProxy(editingProxy).selectedAssets[id] ?? false
}

export const useSelectedAsset = () => {
    const {selectedAssets = {}} = useProxy(editingProxy)
    const keys = Object.keys(selectedAssets)
    return keys.length > 0 ? keys[0] : ''
}

export const useAddingSpecialAssetKey = () => {
    return useProxy(editingProxy).addingSpecialAssetKey
}

export const useAddingAssetKey = () => {
    return useProxy(editingProxy).addingAssetKey
}

export const useAddingAsset = () => {
    return useProxy(editingProxy).addingAsset
}

export const setEditMode = (mode: EDIT_MODE) => {
    editingProxy.editMode = mode
}

export const setEditingAddingSpecialAsset = (key: string) => {
    setEditMode(EDIT_MODE.add)
    editingProxy.addingSpecialAssetKey = key
    editingProxy.addingAssetKey = ''
}

export const setEditingAddingAsset = (key: string, asset: DatabaseAsset) => {
    setEditMode(EDIT_MODE.add)
    editingProxy.addingAssetKey = key
    editingProxy.addingSpecialAssetKey = ''
    editingProxy.addingAsset = ref(asset) as DatabaseAsset
}

export const clearEditingAddingAsset = () => {
    editingProxy.addingAsset = null
    editingProxy.addingAssetKey = ''
    editingProxy.addingSpecialAssetKey = ''
}

export const useEditModeAddingAssetKey = () => {
    return useProxy(editingProxy).addingAssetKey
}
export const useEditModeAddingSpecialAssetKey = () => {
    return useProxy(editingProxy).addingSpecialAssetKey
}

export const useIsEditMode = () => {
    return useProxy(uiProxy).editMode
}

export const exitEditMode = () => {
    uiProxy.editMode = false
}

export const useIsVideoScreenDisabled = () => {
    const isEditing = useIsEditMode()
    const editMode = useProxy(editingProxy).editMode
    return isEditing && (editMode === EDIT_MODE.add || editMode === EDIT_MODE.remove)
}

export const useIsEditEditingMode = () => {
    const isEditing = useIsEditMode()
    const editMode = useProxy(editingProxy).editMode
    return isEditing && editMode === EDIT_MODE.edit
}

export const useIsEditRemoveMode = () => {
    const isEditing = useIsEditMode()
    const editMode = useProxy(editingProxy).editMode
    return isEditing && editMode === EDIT_MODE.remove
}

export const useIsEditEditMode = () => {
    const isEditing = useIsEditMode()
    const editMode = useProxy(editingProxy).editMode
    return isEditing && editMode === EDIT_MODE.edit
}

export const useEditingOverlapStore = create<{
    assets: {
        [key: string]: boolean,
    }
}>(() => ({
    assets: {},
}))

export const setAssetEditingOverlapping = (uid: string, overlapping: boolean) => {
    useEditingOverlapStore.setState(state => ({
        assets: {
            ...state.assets,
            [uid]: overlapping,
        }
    }))
}

export const useIsActive = (uid: string) => {
    return useEditingOverlapStore(state => state.assets[uid]) ?? false
}

// export const deleteSelectedAssets = (roomId: string) => {
//     const selectedAssets = Object.entries(useEditingOverlapStore.getState().assets).filter(([, active]) => {
//         return active
//     }).map(([uid]) => uid)
//     if (selectedAssets.length === 0) return
//     const eventId = getEventId()
//     const ref = getEventRoomDataRef(eventId, roomId)
//     const update: {
//         [key: string]: any,
//     } = {}
//     selectedAssets.forEach((uid) => {
//         update[`scenery/${uid}`] = null
//     })
//     return ref.update(update)
// }
