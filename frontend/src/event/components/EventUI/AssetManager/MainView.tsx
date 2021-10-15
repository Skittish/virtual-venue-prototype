import React, {useEffect} from "react";
import {useProxy} from "valtio";
import {
    clearEditingAddingAsset, EDIT_CONTROL_MODE, EDIT_MODE, editingProxy,
    exitEditMode, setEditControlMode,
    setEditingAddingAsset, setEditMode,
    useAddingAssetKey, useAddingSpecialAssetKey, useEditControlMode, useSelectedAsset
} from "../../../../state/editing";
import {SelectedView} from "./data";
import {StyledBody, StyledContainer, StyledFooter, StyledHeader} from "./CreateAssetView";
import {StyledHeading} from "../../../../ui/typography/headings";
import {StyledRoundButton, StyledSmallRoundButton} from "../../../../ui/buttons";
import {SimpleList} from "../../../../ui/SimpleList";
import {SPECIAL_ASSETS} from "../../../../3d/scenery/config";
import {AssetListing, SpecialAssetListing} from "./AssetListing";
import {assetManagerProxy, assetsProxy} from "./AssetManager";
import styled from "styled-components";
import {FaMinus, FaPencilAlt, FaPlus, FaTimes} from "react-icons/fa";
import {BiMove, BiRotateLeft, BiExpand} from "react-icons/bi";
import {THEME} from "../../../../ui/theme";
import {SelectedAssetInstance} from "./SelectedAssetInstance";
import {useIsVirtualVenueAdmin} from "../../../../screens/createEvent/CreateEventForm";

const StyledOptions = styled.div`
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  column-gap: ${THEME.spacing.$1}px;
`

const StyledCloseWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  
  > button {
    transform: translate(20%, -20%);
  }
  
`

export const AssetManagerCloseButton: React.FC = () => {

    return (
        <StyledCloseWrapper>
            <StyledRoundButton small onClick={() => {
                exitEditMode()
            }}>
                <FaTimes size={12}/>
            </StyledRoundButton>
        </StyledCloseWrapper>
    )

}

const MainBody: React.FC = () => {

    const isVirtualVenueAdmin = useIsVirtualVenueAdmin()

    const assets = useProxy(assetsProxy).assets

    useEffect(() => {

        const defaultAsset = '-MVoaoiTEvmUOn4MmkHO'
        const asset = assets[defaultAsset]

        if (asset) {
            setEditingAddingAsset(defaultAsset, asset)
        }

        return () => {
            clearEditingAddingAsset()
        }
    }, [])

    const addingAssetKey = useAddingAssetKey()
    const addingSpecialAssetKey = useAddingSpecialAssetKey()

    const createAsset = () => {
        assetManagerProxy.selectedView = SelectedView.CREATE
    }

    const editAsset = (assetKey: string) => {
        clearEditingAddingAsset()
        assetManagerProxy.editAssetKey = assetKey
        assetManagerProxy.selectedView = SelectedView.EDIT
    }

    return (
        <>
            <StyledBody>
                <SimpleList>
                    {
                        isVirtualVenueAdmin && (
                            <StyledSmallRoundButton onClick={createAsset} fullWidth>
                                Create asset
                            </StyledSmallRoundButton>
                        )
                    }
                    {
                        Object.values(SPECIAL_ASSETS).map((asset) => (
                            <SpecialAssetListing selected={addingSpecialAssetKey === asset.key} data={asset} key={asset.key}/>
                        ))
                    }
                    {
                        Object.entries(assets).map(([key, asset]) => (
                            <AssetListing selected={addingAssetKey === key} asset={asset} assetKey={key} key={key}
                                          onEdit={() => editAsset(key)} canEdit={isVirtualVenueAdmin}/>
                        ))
                    }
                </SimpleList>
            </StyledBody>
            <StyledFooter>
                <StyledSmallRoundButton medium fullWidth onClick={exitEditMode}>
                    {
                        addingAssetKey ? "Done" : "Close"
                    }
                </StyledSmallRoundButton>
            </StyledFooter>
        </>
    )

}

const StyledEditOptions = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${THEME.spacing.$1}px;
  
  > * {
    &:not(:first-child) {
      margin-left: ${THEME.spacing.$1}px;
    }
  }
  
`

const EditBody: React.FC = () => {

    const controlMode = useEditControlMode()
    const selectedAsset = useSelectedAsset()

    return (
        <>
            <StyledBody>
                <div>
                    Edit Mode
                </div>
                <StyledEditOptions>
                    <StyledRoundButton small alert={controlMode === EDIT_CONTROL_MODE.translate} onClick={() => {
                        setEditControlMode(EDIT_CONTROL_MODE.translate)
                    }}>
                        <BiMove size={16}/>
                    </StyledRoundButton>
                    <StyledRoundButton small alert={controlMode === EDIT_CONTROL_MODE.rotate} onClick={() => {
                        setEditControlMode(EDIT_CONTROL_MODE.rotate)
                    }}>
                        <BiRotateLeft size={16}/>
                    </StyledRoundButton>
                    {/*<StyledRoundButton small alert={controlMode === EDIT_CONTROL_MODE.scale} onClick={() => {*/}
                    {/*    setEditControlMode(EDIT_CONTROL_MODE.scale)*/}
                    {/*}}>*/}
                    {/*    <BiExpand size={16}/>*/}
                    {/*</StyledRoundButton>*/}
                </StyledEditOptions>
                {
                    selectedAsset && (
                        <SelectedAssetInstance assetKey={selectedAsset}/>
                    )
                }
            </StyledBody>
            <StyledFooter>
                <StyledSmallRoundButton medium fullWidth onClick={exitEditMode}>
                    Done
                </StyledSmallRoundButton>
            </StyledFooter>
        </>
    )

}

export const MainView: React.FC = () => {

    const editMode = useProxy(editingProxy).editMode

    return (
        <StyledContainer>
            <AssetManagerCloseButton/>
            <StyledHeader>
                <StyledHeading>Assets</StyledHeading>
                <StyledOptions>
                    <div>
                        <StyledRoundButton small alert={editMode === EDIT_MODE.add} onClick={() => {
                            setEditMode(EDIT_MODE.add)
                        }}>
                            <FaPlus size={11}/>
                        </StyledRoundButton>
                    </div>
                    <div>
                        <StyledRoundButton small alert={editMode === EDIT_MODE.edit} onClick={() => {
                            setEditMode(EDIT_MODE.edit)
                        }}>
                            <FaPencilAlt size={11}/>
                        </StyledRoundButton>
                    </div>
                    <div>
                        <StyledRoundButton small alert={editMode === EDIT_MODE.remove} onClick={() => {
                            setEditMode(EDIT_MODE.remove)
                        }}>
                            <FaMinus size={11}/>
                        </StyledRoundButton>
                    </div>
                </StyledOptions>
            </StyledHeader>
            {
                (editMode === EDIT_MODE.edit) ? (
                    <EditBody/>
                ) : (
                    <MainBody/>
                )
            }
        </StyledContainer>
    )
}
