import React, {ChangeEvent} from "react"
import styled from "styled-components";
import {useProxy} from "valtio";
import {EDIT_MODE, editingProxy} from "../../../state/editing";
import {FaMinus, FaPencilAlt, FaPlus} from "react-icons/fa";
import {StyledRoundButton} from "../../../ui/buttons";
import {SCENERY_ASSETS, SPECIAL_ASSETS} from "../../../3d/scenery/config";

const StyledContainer = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const StyledList = styled.ul`
    display: flex;
  
  > li {
    &:not(:first-child) {
      margin-left: 4px;
    }
  }
  
`

const EventUIScenery: React.FC = () => {

    const value = useProxy(editingProxy).selectedModel
    const editMode = useProxy(editingProxy).editMode

    const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        editingProxy.selectedModel = value
    }

    return (
        <StyledContainer>
            <StyledList>
               <li>
                   <StyledRoundButton small alert={editMode === EDIT_MODE.add} onClick={() => {
                       editingProxy.editMode = EDIT_MODE.add
                   }}>
                       <FaPlus size={12}/>
                   </StyledRoundButton>
               </li>
               <li>
                   <StyledRoundButton small alert={editMode === EDIT_MODE.remove} onClick={() => {
                       editingProxy.editMode = EDIT_MODE.remove
                   }}>
                       <FaMinus size={12}/>
                   </StyledRoundButton>
               </li>
               <li>
                   <StyledRoundButton small alert={editMode === EDIT_MODE.edit} onClick={() => {
                       editingProxy.editMode = EDIT_MODE.edit
                   }}>
                       <FaPencilAlt size={12}/>
                   </StyledRoundButton>
               </li>
            </StyledList>
            {
                editMode === EDIT_MODE.add && (
                    <div>
                        <select value={value} onChange={onChange}>
                            {
                                Object.values(SCENERY_ASSETS).map((asset) => (
                                    <option key={asset.key} value={asset.key}>{asset.name}</option>
                                ))
                            }
                            {
                                Object.values(SPECIAL_ASSETS).map((asset) => (
                                    <option key={asset.key} value={asset.key}>{asset.name}</option>
                                ))
                            }
                        </select>
                    </div>
                )
            }
        </StyledContainer>
    )
}

export default EventUIScenery