import {getAssetRef, getAssetsRef} from "./refs";
import {V3} from "../event/components/AssetPreview";
import {PhysicsData} from "../event/components/EventUI/AssetManager/ModelPhysics";


export type ModifiedMaterials = Record<string, string>

export type DatabaseAsset = {
    name: string,
    modelPath: string,
    position: V3,
    scale: V3,
    rotation: V3,
    materials: ModifiedMaterials,
    physicsData: PhysicsData,
}

export type UpdateValues = {
    position: V3,
    scale: V3,
    rotation: V3,
    materials: ModifiedMaterials,
    physicsData: PhysicsData,
}

export const createNewAsset = (name: string, modelPath: string, values: UpdateValues) => {
    return getAssetsRef().push({
        name,
        modelPath,
        ...values,
    })
}

export const updateAsset = (assetKey: string, name: string, modelPath: string, values: UpdateValues) => {
    return getAssetRef(assetKey).update({
        name,
        modelPath,
        ...values,
    })
}