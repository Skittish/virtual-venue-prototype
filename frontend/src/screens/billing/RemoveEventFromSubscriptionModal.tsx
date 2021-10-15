import React, {useState} from "react"
import Modal from "../../components/Modal"
import { StyledSmallRoundButton } from "../../ui/buttons"
import {FirestoreEventData} from "../../firebase/firestore/types";
import {disconnectEventFromSubscription} from "../../firebase/events";
import {THEME} from "../../ui/theme";
import styled from "styled-components";

const StyledContainer = styled.div`

  p {
    margin: ${THEME.spacing.$1b}px 0;
  }
    
`

export const RemoveEventFromSubscriptionModal: React.FC<{
    id: string,
    event: FirestoreEventData,
    onClose: () => void,
}> = ({event, id, onClose}) => {

    const [busy, setBusy] = useState(false)

    const remove = () => {
        if (busy) return
        setBusy(true)
        disconnectEventFromSubscription(id)
            .then(() => {
                onClose()
            })
            .catch((error) => {
                console.error(error)
                setBusy(false)
            })
    }

    return (
        <Modal isOpen onRequestClose={onClose}>
            <StyledContainer>
                <header>
                    <p>
                        Are you sure you want to remove the event {id} from this subscription?
                    </p>
                </header>
                <div>
                    <StyledSmallRoundButton fullWidth onClick={remove}>
                        {
                            busy ? "Removing..." : "Remove from subscription"
                        }
                    </StyledSmallRoundButton>
                </div>
            </StyledContainer>
        </Modal>
    )
}
