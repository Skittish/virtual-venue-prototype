import React, {useEffect, useRef} from "react"
import {subscribe, useProxy} from "valtio";
import {uiProxy} from "../../../state/ui";
import {
    EDIT_MODE,
    editingProxy,
    useEditModeAddingAssetKey,
    useEditModeAddingSpecialAssetKey
} from "../../../state/editing";
import {Cylinder} from "@react-three/drei";
import {Group} from "three";
import SceneryAsset from "../../../3d/scenery/SceneryAsset";
import {AddingAssetPreview} from "./AddingAssetPreview";

const EditingMode: React.FC = () => {

    const groupRef = useRef<Group>(null)

    const editMode = useProxy(editingProxy).editMode

    const specialAssetKey = useEditModeAddingSpecialAssetKey()
    const assetKey = useEditModeAddingAssetKey()

    useEffect(() => {
        subscribe(editingProxy.position, () => {
            if (!groupRef.current) return
            groupRef.current.position.x = editingProxy.position.x
            groupRef.current.position.y = editingProxy.position.y
        })
    }, [])

    if (editMode === EDIT_MODE.edit) return null

    return (
        <group ref={groupRef}>
            {
                (editMode === EDIT_MODE.add) && (
                    <>
                        {
                            specialAssetKey && (
                                <SceneryAsset uid="" model={specialAssetKey} temporary/>
                            )
                        }
                        {
                            assetKey && (
                                <AddingAssetPreview key={assetKey}/>
                            )
                        }
                        <Cylinder args={[1, 1, 0.2, 20]} rotation={[Math.PI / 2, 0, 0]}>
                            <meshBasicMaterial transparent opacity={0.5} color={editMode ===  EDIT_MODE.add ? "white" : "red"}/>
                        </Cylinder>
                    </>
                )
            }
        </group>
    )
}

const EditingModeWrapper: React.FC = () => {
    const isEditingMode = useProxy(uiProxy).editMode
    if (!isEditingMode) return null
    return (
        <EditingMode/>
    )
}

export default EditingModeWrapper
