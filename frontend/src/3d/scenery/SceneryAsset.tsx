import React, {Suspense, useMemo, useState} from "react"
import {useGLTF} from "@react-three/drei/useGLTF";
import {setMaterials, setShadows} from "../../utils/models";
import {Material} from "three";
import {SkeletonUtils} from "three/examples/jsm/utils/SkeletonUtils";
import {BodyType, createCircleFixture, useBody} from "react-three-game-engine";
import {Vec2} from "planck-js";
import {useProxy} from "valtio";
import {useIsActive} from "../../state/editing";
import {uiProxy} from "../../state/ui";
import {Cylinder} from "@react-three/drei";
import {SCENERY_ASSETS, SPECIAL_ASSETS} from "./config";

const AssetPhysics: React.FC<{
    x: number,
    y: number
}> = ({x, y}) => {
    useBody(() => ({
        type: BodyType.static,
        position: Vec2(x, y),
        fixtures: [
            createCircleFixture({
                radius: 0.75,
            }),
        ],
    }))
    return null
}

const Asset: React.FC<{
    model: string,
    materials: {
        [key: string]: Material,
    }
}> = ({model, materials}) => {
    const gltf = useGLTF(model)

    const [cloned]: any = useState(() => {
        const clonedScene = SkeletonUtils.clone(gltf.scene)
        setMaterials(clonedScene, materials)
        setShadows(clonedScene)
        return clonedScene
    })

    return (
        <primitive object={cloned} dispose={null} />
    )
}

const EditVisualiser: React.FC<{
    uid: string,
}> = ({uid}) => {
    const active = useIsActive(uid)
    return (
        <Cylinder args={[1, 1, 2, 20]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color={active ? "red" : "white"} transparent opacity={active ? 1 : 0.15} wireframe />
        </Cylinder>
    )
}

const SceneryAsset: React.FC<{
    uid: string,
    model: string,
    x?: number,
    y?: number,
    scale?: number,
    rotation?: number,
    temporary?: boolean,
}> = ({
        uid,
        model,
        x = 0,
        y = 0,
        rotation = 0,
        scale = 1,
        temporary = false
}) => {

    const isEditing = useProxy(uiProxy).editMode

    const specialAsset = SPECIAL_ASSETS[model]

    const components = useMemo(() => {
        if (!specialAsset) return null
        return (
            <>
                {specialAsset.components.map((Component, index) => (
                    <Component temporary={temporary} uid={uid} x={x} y={y} key={index}/>
                ))}
            </>
        )
    }, [specialAsset, temporary, uid, x, y])

    if (specialAsset) {
        return (
            <>
                {components}
            </>
        )
    }

    const asset = SCENERY_ASSETS[model]

    if (!asset) return null

    return (
        <>
            {!temporary && <AssetPhysics x={x} y={y}/>}
            <group position={[x, y, 0]}>
                {(!temporary && isEditing) && <EditVisualiser uid={uid}/>}
                <group rotation={[Math.PI / 2, 0, 0]} scale={[4 * scale, 4 * scale, 4 * scale]}>
                    <Suspense fallback={null}>
                        <Asset model={asset.model} materials={asset.materials}/>
                    </Suspense>
                </group>
            </group>
        </>
    )
}

export default SceneryAsset
