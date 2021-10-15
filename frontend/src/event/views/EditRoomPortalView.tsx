import React from "react"
import { StyledSmallRoundButton } from "../../ui/buttons"
import { StyledMediumHeading } from "../../ui/typography/headings"
import { StyledContainer } from "../components/EventUI/EventUIVideoModal"
import {useRoomPortalDestinationUid, useRooms} from "../../state/event/rooms";
import styled from "styled-components";
import {createNewRoom, setRoomPortalDestination} from "../../state/actions";
import {setCreatingNewRoom, uiProxy} from "../../state/ui";

const StyledMain = styled.div`
  margin: 15px 0;
`

const Styledlist = styled.ul`
  max-height: 300px;
  overflow-y: auto;

  > li {
    
    &:not(:first-child) {
      margin-top: 4px;
    }
    
  }
    
`

const StyledFooter = styled.footer`
  padding-top: 15px;
  border-top: 1px solid rgba(255,255,255,0.5);
`

const EditRoomPortalView: React.FC<{
    uid: string,
}> = ({uid}) => {
    const rooms = Object.entries(useRooms())
    const destination = useRoomPortalDestinationUid(uid)

    const onCreateNewRoom = () => {
        setCreatingNewRoom(true)
    }

    return (
        <StyledContainer>
            <header>
                <StyledMediumHeading>set room destination</StyledMediumHeading>
            </header>
            <StyledMain>
                <Styledlist>
                    {
                        rooms.map(([key, room]) => (
                            <li key={key}>
                                <StyledSmallRoundButton alert={key === destination} onClick={() => {
                                    setRoomPortalDestination(uid, key)
                                    uiProxy.editingRoomPortal = ''
                                }}>
                                    <span>
                                        {room.name ?? key}
                                    </span>
                                </StyledSmallRoundButton>
                            </li>
                        ))
                    }
                </Styledlist>
            </StyledMain>
            <StyledFooter>
                <StyledSmallRoundButton onClick={onCreateNewRoom}>
                    create new room
                </StyledSmallRoundButton>
            </StyledFooter>
        </StyledContainer>
    )
}

export default EditRoomPortalView