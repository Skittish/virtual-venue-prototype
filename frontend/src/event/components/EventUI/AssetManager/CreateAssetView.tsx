import React, {SetStateAction, useEffect, useRef, useState} from "react";
import {createNewAsset, DatabaseAsset, ModifiedMaterials, updateAsset} from "../../../../firebase/assets";
import {useProxy} from "valtio";
import {assetPreviewProxy, V3} from "../../AssetPreview";
import {SimpleList} from "../../../../ui/SimpleList";
import {ModelMaterial} from "./ModelMaterial";
import styled from "styled-components";
import {THEME} from "../../../../ui/theme";
import {getDatabaseRef, getModelsStorageRef, getRawModelStorageRef} from "../../../../firebase/refs";
import {useIsEditMode} from "../../../../state/editing";
import {ModelPhysics, PhysicsData} from "./ModelPhysics";
import {StyledInput} from "../../../../ui/inputs";
import {StyledSmallRoundButton} from "../../../../ui/buttons";
import {StyledHeading} from "../../../../ui/typography/headings";
import {assetManagerProxy} from "./AssetManager";
import {SelectedView} from "./data";
import {AssetManagerCloseButton} from "./MainView";

export const StyledContainer = styled.div`
  position: absolute;
  top: 75px;
  right: 20px;
  bottom: 20px;
  background-color: ${THEME.colors.shadeLighter};
  padding: ${THEME.spacing.$2}px 0;
  border-radius: ${THEME.radii.$3}px;
  width: 240px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  row-gap: ${THEME.spacing.$1b}px;
  z-index: 99999999;
`

export const StyledHeader = styled.header`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: ${THEME.spacing.$1b}px;
  min-height: 40px;
  padding: 0 ${THEME.spacing.$2}px;
`

export const StyledFooter = styled.footer`
  padding: 0 ${THEME.spacing.$2}px;
`

export const StyledInputWrapper = styled.div`

  &:not(:first-child) {
    margin-top: ${THEME.spacing.$2}px;
  }

`

export const StyledBody = styled.div`
  padding: ${THEME.spacing.$1b}px ${THEME.spacing.$2}px ${THEME.spacing.$2}px ${THEME.spacing.$2}px;
  margin-top: -${THEME.spacing.$1b}px;
  overflow-y: auto;
  overflow-x: visible;
`

const StyledHiddenInput = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`

const StyledUploadButton = styled(StyledSmallRoundButton)`

  label:focus + {

  }
`

export const StyledLabel = styled.label`
  margin-bottom: 4px;
  padding-left: 14px;
  display: block;
`

const StyledFileWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: ${THEME.spacing.$1b}px;
`

const ModelInput: React.FC<{
    loading: boolean,
    metadata: any,
    modelPath: string,
    setModelPath: (modelPath: string) => void,
}> = ({loading, metadata, modelPath, setModelPath}) => {

    const [uploading, setUploading] = useState(false)
    const [name, setName] = useState('')

    useEffect(() => {
        if (metadata) {
            setName(metadata.name)
        }
    }, [metadata])

    const clearModel = () => {
        setName('')
        setModelPath('')
    }

    const uploadModel = (file: File) => {
        if (uploading) return
        setUploading(false)
        console.log('upload file...', file)
        const key = getDatabaseRef().push().key ?? ''
        getModelsStorageRef().child(key).child(file.name).put(file)
            .then(async (response) => {
                setName(file.name)
                setModelPath(response.ref.fullPath)
            })
            .finally(() => {
                setUploading(false)
            })
    }

    return (
        <StyledInputWrapper>
            <StyledLabel htmlFor="model">3D Model</StyledLabel>
            {
                loading ? (
                    <div>
                        loading...
                    </div>
                ) : !name ? (
                    <div>
                        <StyledHiddenInput
                            type="file"
                            id="model"
                            name="model"
                            onChange={(e) => {
                                if (e.target.files) {
                                    uploadModel(e.target.files[0])
                                }
                            }}
                        />
                        <StyledUploadButton as="label" htmlFor="model" fullWidth>Upload .gltf /
                            .glb</StyledUploadButton>
                    </div>
                ) : (
                    <StyledFileWrapper>
                        <div>
                            {name}
                        </div>
                        <div>
                            <button onClick={clearModel} type="button">
                                x
                            </button>
                        </div>
                    </StyledFileWrapper>
                )
            }
        </StyledInputWrapper>
    )

}

const StyledMultiInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: ${THEME.spacing.$1}px;
`

export const useDisplayAssetPreview = () => {
    const {selectedView} = useProxy(assetManagerProxy)
    const isEditMode = useIsEditMode()
    return isEditMode && (selectedView === SelectedView.EDIT || selectedView === SelectedView.CREATE)
}

const ModelMaterials: React.FC<{
    updateMaterials: (action: SetStateAction<ModifiedMaterials>) => void,
    modifiedMaterials: ModifiedMaterials,
}> = ({updateMaterials, modifiedMaterials}) => {

    const materials = useProxy(assetPreviewProxy).modelMaterials ?? {}

    const onMaterialUpdate = (key: string, value: string) => {
        updateMaterials(state => ({
            ...state,
            [key]: value,
        }))
    }

    return (
        <StyledInputWrapper>
            <StyledLabel htmlFor="materials">Materials</StyledLabel>
            <SimpleList>
                {
                    Object.entries(materials).map(([key, material]) => (
                        <div key={key}>
                            <ModelMaterial material={material} overriddenValue={modifiedMaterials[key]}
                                           onChange={(value: string) => onMaterialUpdate(key, value)}/>
                        </div>
                    ))
                }
            </SimpleList>
        </StyledInputWrapper>
    )
}

const ModelFields: React.FC<{
    modelPath: string,
    position: V3,
    scale: V3,
    rotation: V3,
    setPosition: (v3: any) => void,
    setScale: (v3: any) => void,
    setRotation: (v3: any) => void,
    updateMaterials: (action: SetStateAction<ModifiedMaterials>) => void,
    modifiedMaterials: ModifiedMaterials,
    physicsData: PhysicsData,
    setPhysicsData: (action: SetStateAction<PhysicsData>) => void,
}> = ({
          position, scale, rotation, setPosition,
          setScale,
          setRotation,
          updateMaterials,
          modifiedMaterials,
          physicsData,
          setPhysicsData,
      }) => {

    const updatePosition = (value: string, property: string) => {
        if (!value) return
        setPosition((state: any) => ({
            ...state,
            [property]: parseFloat(value),
        }))
    }

    const updateRotation = (value: string, property: string) => {
        if (!value) return
        setRotation((state: any) => ({
            ...state,
            [property]: parseFloat(value),
        }))
    }

    const updateScale = (value: string, property: string) => {
        if (!value) return
        setScale((state: any) => ({
            ...state,
            [property]: parseFloat(value),
        }))
    }

    return (
        <>
            <StyledInputWrapper>
                <StyledInputWrapper>
                    <StyledLabel htmlFor="position">Position</StyledLabel>
                    <StyledMultiInputs>
                        <div>
                            <StyledInput onChange={event => {
                                updatePosition(event.target.value, 'x')
                            }} value={position.x} id="position" placeholder="x" smaller fullWidth smallestFont slimmer
                                         type="number" step="any"/>
                        </div>
                        <div>
                            <StyledInput onChange={event => {
                                updatePosition(event.target.value, 'y')
                            }} value={position.y} id="position-y" placeholder="y" smaller fullWidth smallestFont slimmer
                                         type="number" step="any"/>
                        </div>
                        <div>
                            <StyledInput onChange={event => {
                                updatePosition(event.target.value, 'z')
                            }} value={position.z} id="position-z" placeholder="z" smaller fullWidth smallestFont slimmer
                                         type="number" step="any"/>
                        </div>
                    </StyledMultiInputs>
                </StyledInputWrapper>
                <StyledInputWrapper>
                    <StyledLabel htmlFor="rotation">Rotation</StyledLabel>
                    <StyledMultiInputs>
                        <div>
                            <StyledInput onChange={event => {
                                updateRotation(event.target.value, 'x')
                            }} value={rotation.x} id="rotation" placeholder="x" smaller fullWidth smallestFont slimmer
                                         type="number" step="any"/>
                        </div>
                        <div>
                            <StyledInput onChange={event => {
                                updateRotation(event.target.value, 'y')
                            }} value={rotation.y} id="rotation-y" placeholder="y" smaller fullWidth smallestFont slimmer
                                         type="number" step="any"/>
                        </div>
                        <div>
                            <StyledInput onChange={event => {
                                updateRotation(event.target.value, 'z')
                            }} value={rotation.z} id="rotation-z" placeholder="z" smaller fullWidth smallestFont slimmer
                                         type="number" step="any"/>
                        </div>
                    </StyledMultiInputs>
                </StyledInputWrapper>
                <StyledInputWrapper>
                    <StyledLabel htmlFor="scale">Scale</StyledLabel>
                    <StyledMultiInputs>
                        <div>
                            <StyledInput onChange={event => {
                                updateScale(event.target.value, 'x')
                            }} value={scale.x} id="scale" placeholder="x" smaller fullWidth smallestFont slimmer
                                         type="number" step="any"/>
                        </div>
                        <div>
                            <StyledInput onChange={event => {
                                updateScale(event.target.value, 'y')
                            }} value={scale.y} id="scale-y" placeholder="y" smaller fullWidth smallestFont slimmer
                                         type="number" step="any"/>
                        </div>
                        <div>
                            <StyledInput onChange={event => {
                                updateScale(event.target.value, 'z')
                            }} value={scale.z} id="scale-z" placeholder="z" smaller fullWidth smallestFont slimmer
                                         type="number" step="any"/>
                        </div>
                    </StyledMultiInputs>
                </StyledInputWrapper>
            </StyledInputWrapper>
            <ModelMaterials updateMaterials={updateMaterials} modifiedMaterials={modifiedMaterials}/>
            <ModelPhysics data={physicsData} updateData={setPhysicsData}/>
        </>
    )
}

export const CreateAssetView: React.FC<{
    assetKey?: string,
    asset?: DatabaseAsset,
    editMode?: boolean,
}> = ({asset, assetKey, editMode = false}) => {

    const [name, setName] = useState(asset ? asset.name : '')
    const [thumbnail, setThumbnail] = useState('')
    const [modelPath, setModelPath] = useState(asset ? asset.modelPath : '')
    const [busy, setBusy] = useState(false)
    const [metadata, setMetadata] = useState(null)
    const [loadingMetadata, setLoadingMetadata] = useState(editMode && !!asset)
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    const [saved, setSaved] = useState(false)
    const [position, setPosition] = useState<V3>(asset?.position ?? {
        x: 0,
        y: 0,
        z: 0,
    })
    const [scale, setScale] = useState<V3>(asset?.scale ?? {
        x: 1,
        y: 1,
        z: 1,
    })
    const [rotation, setRotation] = useState<V3>(asset?.rotation ?? {
        x: 0,
        y: 0,
        z: 0,
    })
    const [physicsData, setPhysicsData] = useState<PhysicsData>(asset?.physicsData ?? {
        enabled: false,
    })
    const [modifiedMaterials, setModifiedMaterials] = useState<ModifiedMaterials>(asset?.materials ?? {})

    const updateMaterials = (action: SetStateAction<ModifiedMaterials>) => {
        unsavedChangeMade()
        setModifiedMaterials(action)
    }

    const updatePhysicsData = (action: SetStateAction<PhysicsData>) => {
        unsavedChangeMade()
        setPhysicsData(action)
    }

    const firstEffectRef = useRef(true)

    useEffect(() => {
        if (firstEffectRef.current) {
            firstEffectRef.current = false
        } else {
            unsavedChangeMade()
        }
        assetPreviewProxy.modelPath = modelPath
        assetPreviewProxy.position = position
        assetPreviewProxy.scale = scale
        assetPreviewProxy.rotation = rotation
    }, [modelPath, scale, rotation, position])

    const canSave = !!name && !!modelPath

    const unsavedChangeMade = () => {
        setSaved(false)
        setUnsavedChanges(true)
    }

    useEffect(() => {
        assetManagerProxy.modelPath = modelPath
        if (!modelPath) return
        const ref = getRawModelStorageRef(modelPath)
        setMetadata(null)
        setLoadingMetadata(true)
        ref.getMetadata()
            .then((metadata) => {
                setMetadata(metadata)
                setLoadingMetadata(false)
            })
    }, [modelPath])

    const createAsset = () => {
        console.log('createAsset')
        if (!canSave) return
        if (busy) return
        if (saved) {
            close()
        }
        setBusy(true)
        const onComplete = () => {
            if (!editMode) {
                close()
            } else {
                setBusy(false)
                setSaved(true)
            }
        }
        if (editMode) {
            console.log('updating!')
            updateAsset(assetKey as string, name, modelPath, {
                position,
                scale,
                rotation,
                materials: modifiedMaterials,
                physicsData,
            })
                .then(onComplete)
        } else {
            createNewAsset(name, modelPath, {
                position,
                scale,
                rotation,
                materials: modifiedMaterials,
                physicsData,
            })
                .then(onComplete)
        }
    }

    const close = () => {
        assetManagerProxy.selectedView = SelectedView.MAIN
    }

    const message = (() => {
        if (editMode) {
            if (busy) {
                return 'Saving'
            }
            if (saved) {
                return 'Done'
            }
            return 'Save'
        } else {
            if (busy) {
                return 'Creating'
            }
            return 'Create'
        }
    })()

    return (
        <StyledContainer as="form" onSubmit={(event: any) => {
            event.preventDefault()
            createAsset()
        }}>
            <AssetManagerCloseButton/>
            <StyledHeader>
                <StyledHeading>{
                    editMode ? 'Edit Mode' : 'Create Asset'
                }</StyledHeading>
                {
                    !saved && (
                        <StyledSmallRoundButton onClick={close} type="button">
                            Cancel
                        </StyledSmallRoundButton>
                    )
                }
            </StyledHeader>
            <StyledBody>
                <StyledInputWrapper>
                    <StyledLabel htmlFor="name">Name</StyledLabel>
                    <StyledInput value={name} onChange={event => {
                        setName(event.target.value)
                        unsavedChangeMade()
                    }} id="name" placeholder="Name" smaller fullWidth smallerFont slim/>
                </StyledInputWrapper>
                {/*<StyledInputWrapper>*/}
                {/*    <StyledLabel htmlFor="thumbnail">Thumbnail</StyledLabel>*/}
                {/*    <div>*/}
                {/*        <StyledSmallRoundButton fullWidth onClick={uploadImage}>Upload image</StyledSmallRoundButton>*/}
                {/*    </div>*/}
                {/*</StyledInputWrapper>*/}
                <ModelInput loading={loadingMetadata} metadata={metadata} modelPath={modelPath}
                            setModelPath={(newPath: string) => {
                                setModelPath(newPath)
                                unsavedChangeMade()
                            }}/>
                {
                    modelPath && (
                        <ModelFields modelPath={modelPath}
                                     position={position}
                                     setPosition={setPosition}
                                     scale={scale}
                                     setScale={setScale}
                                     rotation={rotation}
                                     setRotation={setRotation}
                                     updateMaterials={updateMaterials}
                                     modifiedMaterials={modifiedMaterials}
                                     physicsData={physicsData}
                                     setPhysicsData={updatePhysicsData}
                        />
                    )
                }
            </StyledBody>
            <StyledFooter>
                <StyledSmallRoundButton medium fullWidth disabled={!canSave} type="submit">
                    {message}
                </StyledSmallRoundButton>
            </StyledFooter>
        </StyledContainer>
    )
}