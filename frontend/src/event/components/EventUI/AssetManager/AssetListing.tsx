import React from "react"
import styled, {css} from "styled-components";
import {THEME} from "../../../../ui/theme";
import {DatabaseAsset} from "../../../../firebase/assets";
import {FaPencilAlt} from "react-icons/fa";
import {cssResetButton, StyledRoundButton} from "../../../../ui/buttons";
import {setEditingAddingAsset, setEditingAddingSpecialAsset} from "../../../../state/editing";
import {SpecialAssetData} from "../../../../3d/scenery/config";

const StyledAssetListingThumb = styled.div`
  width: 36px;
  height: 36px;
  background-color: rgba(0,0,0,0.1);
  border-radius: ${THEME.radii.$1}px;
`

const cssSelected = css`
  
    ${StyledAssetListingThumb} {
      box-shadow: 0 0 0 3px ${THEME.colors.red};
    }

`

const cssNotSelected = css`
    
    &:hover {
      ${StyledAssetListingThumb} {
        box-shadow: 0 0 0 3px ${THEME.colors.blue};
      }
    }
    
`

const StyledAssetListing = styled.div<{
    selected: boolean,
}>`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-column-gap: ${THEME.spacing.$1b}px;
  align-items: center;
  
  ${props => props.selected ? cssSelected : cssNotSelected};
  
`

const StyledContent = styled.button`
  ${cssResetButton};
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: ${THEME.spacing.$1b}px;
  align-items: center;
  text-align: left;
  cursor: pointer;
`

export const AssetListing: React.FC<{
    selected: boolean,
    asset: DatabaseAsset,
    assetKey: string,
    onEdit: () => void,
    canEdit: boolean,
}> = ({asset, assetKey, onEdit, selected, canEdit}) => {
    return (
        <StyledAssetListing selected={selected}>
            <StyledContent onClick={() => {
                setEditingAddingAsset(assetKey, asset)
            }}>
                <StyledAssetListingThumb/>
                <div>
                    {asset.name}
                </div>
            </StyledContent>
            {
                canEdit && (
                    <div>
                        <StyledRoundButton small onClick={onEdit} hide={!selected}>
                            <FaPencilAlt size={12}/>
                        </StyledRoundButton>
                    </div>
                )
            }
        </StyledAssetListing>
    )
}

export const SpecialAssetListing: React.FC<{
    data: SpecialAssetData,
    selected: boolean,
}> = ({data, selected}) => {
    return (
        <StyledAssetListing selected={selected}>
            <StyledContent onClick={() => {
                setEditingAddingSpecialAsset(data.key)
            }}>
                <StyledAssetListingThumb/>
                <div>
                    {data.name}
                </div>
            </StyledContent>
        </StyledAssetListing>
    )
}
