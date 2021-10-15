import React from "react"
import {useAddingAsset} from "../../../state/editing";
import { MappedAsset } from "../AssetPreview";

export const AddingAssetPreview: React.FC = () => {

    const asset = useAddingAsset()

    if (!asset) return null

    return <MappedAsset asset={asset} disablePhysics/>
}
