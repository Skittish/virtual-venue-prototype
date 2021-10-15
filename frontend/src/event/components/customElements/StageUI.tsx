import React from "react"
import styled from "styled-components";
import {StyledSmallRoundButton} from "../../../ui/buttons";
import {useChannelZone} from "./ChannelZone";
import {setStageIsPublic} from "../../../firebase/placedObjects";

const StyledContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
`

export const StageUI: React.FC<{
    id: string,
    isPublic: boolean,
    setHovered: (hovered: boolean) => void,
}> = ({setHovered, id, isPublic}) => {

    return (
        <StyledContainer onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <StyledSmallRoundButton onClick={() => {
                setStageIsPublic(id, !isPublic)
            }}>
                {
                    isPublic ? "close to public" : "open to public"
                }
            </StyledSmallRoundButton>
        </StyledContainer>
    )
}
