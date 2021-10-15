import React from "react"
import Modal from "../../../components/Modal"
import { StyledSmallRoundButton } from "../../../ui/buttons"
import { StyledMediumHeading } from "../../../ui/typography/headings"
import styled from "styled-components";
import {THEME} from "../../../ui/theme";
import {useEventIsClosed} from "../../../state/event/sessionData";
import {setEventClosed} from "../../../firebase/event";

const StyledContainer = styled.div`
  display: grid;
  grid-template-rows: auto auto auto;
  justify-items: center;
  text-align: center;
  row-gap: ${THEME.spacing.$2}px;
`

export const CloseEventConfirmationModal: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {
    const eventIsClosed = useEventIsClosed()
    const toggle = () => {
        setEventClosed(!eventIsClosed)
        onClose()
    }
    return (
        <Modal isOpen onRequestClose={onClose}>
            <StyledContainer>
                <StyledMediumHeading>
                    {
                        eventIsClosed ? "Open this event" : "Close this event"
                    }
                </StyledMediumHeading>
                {
                    eventIsClosed ? (
                        <p>
                            Anybody with the URL will be able to join this event.
                        </p>
                    ) : (
                        <p>
                            Nobody will have access to this event until it is re-opened.
                        </p>
                    )
                }
                <StyledSmallRoundButton onClick={toggle}>
                    {
                        eventIsClosed ? "Open this event" : "Close this event"
                    }
                </StyledSmallRoundButton>
            </StyledContainer>
        </Modal>
    )
}