import React from "react"
import {StyledSmallRoundButton} from "../../../ui/buttons";
import styled from "styled-components";
import {useIsEditEditingMode, useIsEditMode} from "../../../state/editing";
import {uiProxy} from "../../../state/ui";
import {
    useNumberOfUsersInRoom,
    useRoomPortalDestination,
    useRoomPortalDestinationUid
} from "../../../state/event/rooms";
import {joinRoom} from "../../../state/actions";

const StyledContainer = styled.div`
  white-space: nowrap;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  
  h3 {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 1.5rem;
    text-transform: capitalize;
    
    span {
      font-size: 0.9rem;
    }
    
  }
  
`

const StyledOptions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

const StyledButtonWrapper = styled.div`
  &:not(:first-child) {
    margin-top: 4px;
  }
`

const RoomPortalUI: React.FC<{
    uid: string,
    inRange: boolean,
}> = ({
        uid,
        inRange,
      }) => {

    const isEditMode = useIsEditMode()
    const destination = useRoomPortalDestinationUid(uid)
    const room = useRoomPortalDestination(uid)
    const numberOfUsers = useNumberOfUsersInRoom(destination)

    return (
        <StyledContainer>
            <h3>{room.name || destination} <span>({numberOfUsers})</span></h3>
            <StyledOptions>
                {
                    (inRange && destination) && (
                        <StyledButtonWrapper>
                            <StyledSmallRoundButton onClick={() => {
                                joinRoom(destination)
                            }}>enter room</StyledSmallRoundButton>
                        </StyledButtonWrapper>
                    )
                }
                {
                    isEditMode && (
                        <StyledButtonWrapper>
                            <StyledSmallRoundButton onClick={() => {
                                uiProxy.editingRoomPortal = uid
                            }}>set room destination</StyledSmallRoundButton>
                        </StyledButtonWrapper>
                    )
                }
            </StyledOptions>
        </StyledContainer>
    )
}

export default RoomPortalUI
