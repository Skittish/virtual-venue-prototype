import {Box, Circle, Cylinder, Html, Sphere, TransformControls, useHelper} from "@react-three/drei"
import React, {MutableRefObject, Suspense, useEffect, useMemo, useRef, useState} from "react"
import {proxy, ref, useProxy} from "valtio";
import {createAsset} from "use-asset";
import {getRawModelStorageRef} from "../../firebase/refs";
import {useGLTF} from "@react-three/drei/useGLTF";
import {degToRad} from "../../utils/angles";
import {BoxHelper, Color, Material, Object3D, Vector3} from "three";
import {ColliderShapes, PhysicsData} from "./EventUI/AssetManager/ModelPhysics";
import {SkeletonUtils} from "three/examples/jsm/utils/SkeletonUtils";
import {useAssets} from "./EventUI/AssetManager/AssetManager";
import {DatabaseAsset} from "../../firebase/assets";
import {
    deleteSceneryInstance, EDIT_CONTROL_MODE,
    setSelectedAssets, useEditControlMode,
    useIsAssetSelected,
    useIsEditEditingMode, useIsEditEditMode,
    useIsEditRemoveMode
} from "../../state/editing";
import {inputsProxy} from "../../state/inputs";
import {ErrorBoundary} from "../../components/ErrorBoundary";
import {SPECIAL_ASSETS} from "../../3d/scenery/config";
import SceneryAsset from "../../3d/scenery/SceneryAsset";
import {BodyType, createBoxFixture, createCircleFixture, useBody} from "react-three-game-engine";
import {Vec2} from "planck-js";
import {updateSceneryInstancePosition} from "../../firebase/rooms";

const getDownloadUrl = createAsset(async (modelPath: string) => {
    const modelRef = getRawModelStorageRef(modelPath)
    const downloadUrl = await modelRef.getDownloadURL()
    return Promise.resolve(downloadUrl)
})

export type V3 = {
    x: number,
    y: number,
    z: number,
}

export const assetPreviewProxy = proxy<{
    modelPath: string,
    position: V3,
    rotation: V3,
    scale: V3,
    modelMaterials: Record<string, Material> | null,
    physicsData: PhysicsData | null,
}>({
    modelPath: '',
    position: {
        x: 0,
        y: 0,
        z: 0,
    },
    rotation: {
        x: 0,
        y: 0,
        z: 0,
    },
    scale: {
        x: 1,
        y: 1,
        z: 1,
    },
    modelMaterials: null,
    physicsData: null,
})

const convertedColors: {
    [key: string]: boolean,
} = {}

const AssetModel: React.FC<{
    modelPath: string,
    mappedColors: Record<string, string>
}> = ({modelPath, mappedColors}) => {

    const downloadUrl = getDownloadUrl.read(modelPath)

    const model = useGLTF(downloadUrl)

    const [cloned]: any = useState(() => {
        const clonedScene = SkeletonUtils.clone(model.scene)
        // @ts-ignore
        clonedScene.traverse(obj => {
            obj.castShadow = true
            obj.receiveShadow = true
        })
        return clonedScene
    })

    useEffect(() => {
        Object.entries(model.materials).forEach(([key, material]) => {
            if (mappedColors[key]) {
                ((material as any).color as Color).set(mappedColors[key]).convertSRGBToLinear()
                convertedColors[material.uuid] = true;
            } else if (!convertedColors[material.uuid]) {
                ((material as any).color as Color).convertSRGBToLinear();
                convertedColors[material.uuid] = true;
            }
            // @ts-ignore
            material.metalness = 0;
        })
        // @ts-ignore
        assetPreviewProxy.modelMaterials = ref(model.materials)
        return () => {
            assetPreviewProxy.modelMaterials = null
        }
    }, [model])

    return (
        <primitive object={cloned} dispose={null}/>
    )
}

const CircleCollider: React.FC<{
    x: number,
    y: number,
    radius: number,
}> = ({x, y, radius}) => {

    useBody(() => ({
        type: BodyType.static,
        position: Vec2(x, y),
        fixtures: [
            createCircleFixture({
                radius,
            }),
        ],
    }))

    return null
}

const BoxCollider: React.FC<{
    angle: number,
    x: number,
    y: number,
    hx: number,
    hy: number,
}> = ({angle, x, y, hx, hy}) => {

    useBody(() => ({
        type: BodyType.static,
        angle,
        position: Vec2(x, y),
        fixtures: [
            createBoxFixture({
                width: hx,
                height: hy,
            }),
        ],
    }))

    return null
}

const AssetPhysics: React.FC<{
    disablePhysics: boolean,
    physicsData: PhysicsData,
    showColliders: boolean,
    x: number,
    y: number,
    angle: number,
}> = ({physicsData, showColliders, disablePhysics, x, y, angle}) => {

    const includePhysics = !disablePhysics
    const shape = physicsData?.shape ?? ColliderShapes.CIRCLE
    const radius = physicsData?.radius || 1
    const hx = physicsData?.hx || 0.5
    const hy = physicsData?.hy || 0.5

    if (!physicsData?.enabled) return null

    if (shape === ColliderShapes.CIRCLE) {
        return (<>
            {
                includePhysics && (
                    <CircleCollider x={x} y={y} radius={radius} key={[x, y, radius].join('')}/>
                )
            }
            {
                showColliders && (
                    <Cylinder args={[radius, radius, 1, 32]} rotation={[Math.PI / 2, 0, 0]}>
                        <meshBasicMaterial color="purple" transparent opacity={0.5}/>
                    </Cylinder>
                )
            }
        </>)
    }

    if (shape === ColliderShapes.BOX) {
        return (
            <>
                {
                    includePhysics && (
                        <BoxCollider angle={angle} x={x} y={y} hx={hx} hy={hy}/>
                    )
                }
                {
                    showColliders && (
                        <Box args={[hx, 1, hy]} rotation={[Math.PI / 2, 0, 0]}>
                            <meshBasicMaterial color="purple" transparent opacity={0.5}/>
                        </Box>
                    )
                }
            </>
        )
    }

    return null
}

export const Asset: React.FC<{
    position: V3,
    scale: V3,
    rotation: V3,
    modelPath: string,
    mappedColors?: Record<string, string>,
    physicsData?: PhysicsData | null,
    showColliders?: boolean,
    disablePhysics?: boolean,
    angle: number,
    x: number,
    y: number,
}> = ({
          position,
          angle,
          scale,
          rotation,
          disablePhysics = false,
          modelPath,
          mappedColors = {},
          physicsData,
          showColliders = false,
          x,
          y
      }) => {

    const pos = useMemo<[number, number, number]>(() => {
        return [position.x, position.y, position.z]
    }, [position])

    const rot = useMemo<[number, number, number]>(() => {
        return [degToRad(rotation.x) + Math.PI / 2, degToRad(rotation.y), degToRad(rotation.z)]
    }, [rotation])

    const sca = useMemo<[number, number, number]>(() => {
        return [scale.x, scale.y, scale.z]
    }, [scale])

    return (
        <ErrorBoundary fallback={null}>
            <Suspense fallback={<Sphere/>}>
                <group position={pos}
                       scale={sca} rotation={rot}>
                    <AssetModel modelPath={modelPath} key={modelPath} mappedColors={mappedColors}/>
                </group>
            </Suspense>
            {
                (physicsData) && (
                    <AssetPhysics disablePhysics={disablePhysics} physicsData={physicsData}
                                  showColliders={showColliders} x={x} y={y} angle={angle}/>
                )
            }
            {
                showColliders && (
                    <Circle position={[0, 0, 0.01]} args={[0.5]}/>
                )
            }
        </ErrorBoundary>
    )
}

export const AssetPreview: React.FC = () => {

    const {modelPath, position, rotation, scale, physicsData} = useProxy(assetPreviewProxy)

    if (!modelPath) return null

    return <Asset position={position} rotation={rotation} scale={scale} modelPath={modelPath} physicsData={physicsData}
                  showColliders disablePhysics angle={0} x={0} y={0}/>
}

export const MappedAsset: React.FC<{
    asset: DatabaseAsset,
    disablePhysics?: boolean,
    showColliders?: boolean,
    x?: number,
    y?: number,
    rotation?: number,
}> = ({asset, disablePhysics = false, showColliders = false, x = 0, y = 0, rotation = 0}) => {

    const materials = asset.materials ?? {}

    const position = asset.position ?? {
        x: 0,
        y: 0,
        z: 0,
    }
    const scale = asset.scale ?? {
        x: 1,
        y: 1,
        z: 1,
    }
    const assetRotation = asset.rotation ?? {
        x: 0,
        y: 0,
        z: 0,
    }

    const physicsData = asset.physicsData ?? {
        enabled: false,
    }

    return (
        <Asset position={position}
               scale={scale}
               rotation={assetRotation}
               modelPath={asset.modelPath}
               mappedColors={materials}
               physicsData={physicsData}
               showColliders={showColliders}
               disablePhysics={disablePhysics}
               x={x}
               y={y}
               angle={rotation}
        />
    )
}

const Interactive: React.FC<{
    id: string,
    isSelected: boolean,
    hovered: boolean,
    isRemoveMode: boolean,
    groupRef: MutableRefObject<Object3D>
}> = ({id, isSelected, hovered, isRemoveMode, groupRef}) => {

    const showHelper = (hovered || (isSelected && !isRemoveMode))

    useHelper(groupRef, showHelper ? BoxHelper : undefined, isRemoveMode ? 'red' : 'blue')

    return null
}

const EditAsset: React.FC<{
    id: string,
    initialX: number,
    initialY: number,
    initialRotation: number,
}> = ({children, id, initialX, initialY, initialRotation}) => {

    const [{x, y, rotation}] = useState({
        x: initialX,
        y: initialY,
        rotation: initialRotation,
    })

    const controlsRef = useRef<any>()
    const controlMode = useEditControlMode()
    const showZ = controlMode !== EDIT_CONTROL_MODE.translate
    const showX = controlMode !== EDIT_CONTROL_MODE.rotate
    const showY = controlMode !== EDIT_CONTROL_MODE.rotate

    useEffect(() => {
        const controls = controlsRef.current
        if (!controls) return
        controls.addEventListener('dragging-changed', (event: any) => {
            if (event.value) return
            const target: Object3D = controls.object as Object3D
            const position = target.getWorldPosition(new Vector3())
            updateSceneryInstancePosition(id, position.x, position.y, target.rotation.z)
        })
    }, [])

    return (
        <TransformControls ref={controlsRef} mode={controlMode} position={[x, y, 0]} rotation={[0, 0, rotation]}
                           showX={showX} showY={showY} showZ={showZ}>
            {(children as any)}
        </TransformControls>
    )
}

export const PlacedAsset: React.FC<{
    assetKey: string,
    id: string,
    x: number,
    y: number,
    rotation?: number,
}> = ({assetKey, x, y, rotation, id}) => {

    const groupRef = useRef<Object3D>(null!)
    const [hovered, setHovered] = useState(false)
    const isRemoveMode = useIsEditRemoveMode()
    const isEditMode = useIsEditEditMode()
    const isSelected = useIsAssetSelected(id) && isEditMode

    rotation = rotation ?? 0

    useEffect(() => {
        setHovered(false)
    }, [isRemoveMode, isEditMode])

    const specialAsset = !!SPECIAL_ASSETS[assetKey]
    const asset = useAssets()[assetKey]

    const {
        onPointerOver,
        onPointerOut,
        onPointerDown,
    } = useMemo(() => ({
        onPointerOver: (event: any) => {
            if (!isRemoveMode && !isEditMode) return
            event.stopPropagation()
            setHovered(true)
        },
        onPointerOut: (event: any) => {
            if (!isRemoveMode && !isEditMode) return
            event.stopPropagation()
            setHovered(false)
        },
        onPointerDown: (event: any) => {
            if (!isRemoveMode && !isEditMode) return
            event.stopPropagation()
            if (isEditMode) {
                setSelectedAssets(id)
            } else {
                deleteSceneryInstance(id)
            }
        }
    }), [isRemoveMode, isEditMode])

    if (!asset && !specialAsset) return null

    const disablePhysics = isSelected

    const child = (
        <group ref={groupRef} position={isSelected ? [0, 0, 0] : [x, y, 0]}
               rotation={isSelected ? [0, 0, 0] : [0, 0, rotation]} onPointerDown={onPointerDown}
               onPointerOver={onPointerOver}
               onPointerOut={onPointerOut}>
            {
                specialAsset ? (
                    <SceneryAsset model={assetKey} uid={id} x={x} y={y}/>
                ) : (
                    <MappedAsset disablePhysics={disablePhysics} asset={asset} x={x} y={y} rotation={rotation}
                                 showColliders={isSelected}/>
                )
            }
        </group>
    )

    return (
        <>
            {
                isSelected ? (
                    <EditAsset id={id} initialX={x} initialY={y} initialRotation={rotation}>
                        <>
                            {child}
                        </>
                    </EditAsset>
                ) : child
            }
            <Interactive id={id} isSelected={isSelected} groupRef={groupRef} isRemoveMode={isRemoveMode}
                         hovered={(isRemoveMode || isEditMode) && hovered}/>
        </>
    )
}
