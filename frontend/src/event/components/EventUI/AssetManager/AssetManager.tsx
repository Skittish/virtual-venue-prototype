import React, {useEffect} from "react"
import {getAssetsRef} from "../../../../firebase/refs";
import {proxy, ref, useProxy} from "valtio";
import {DatabaseAsset} from "../../../../firebase/assets";
import {
    clearAddingAsset,
    clearSelectedAssets,
    EDIT_MODE,
    editingProxy,
    exitEditMode, setEditMode
} from "../../../../state/editing";
import {CreateAssetView} from "./CreateAssetView";
import {SelectedView} from "./data";
import {MainView} from "./MainView";

export const assetManagerProxy = proxy<{
    modelPath: string,
    editAssetKey: string,
    selectedView: SelectedView,
}>({
    modelPath: '',
    editAssetKey: '',
    selectedView: SelectedView.MAIN,
})

export const assetsProxy = proxy<{
    assets: Record<string, DatabaseAsset>
}>({
    assets: {},
})

export const useAssetsLoader = () => {

    useEffect(() => {

        getAssetsRef().on('value', (data) => {
            const value = data.val() ?? {}
            assetsProxy.assets = ref(value) as Record<string, DatabaseAsset>
        })

    }, [])
}

export const useAssets = () => {
    return useProxy(assetsProxy).assets
}

export const AssetManager: React.FC = () => {

    const {selectedView, editAssetKey} = useProxy(assetManagerProxy)
    const editMode = useProxy(editingProxy).editMode

    useEffect(() => {
        clearSelectedAssets()
    }, [selectedView, editMode])

    useEffect(() => {

        return () => {
            setEditMode(EDIT_MODE.add)
            clearAddingAsset()
            exitEditMode()
        }

    }, [])

    if (selectedView === SelectedView.CREATE) {
        return (
            <CreateAssetView/>
        )
    }

    if (selectedView === SelectedView.EDIT) {
        const editAsset = assetsProxy.assets[editAssetKey]
        if (editAsset) {
            return (
                <CreateAssetView assetKey={editAssetKey} asset={editAsset} editMode/>
            )
        }
    }

    return (
        <MainView/>
    )
}
