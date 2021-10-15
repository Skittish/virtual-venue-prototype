import React, {useState} from "react";
import { StyledRoundedButton, StyledSmallRoundButton } from "../../../ui/buttons";
import {createNewEventRoom} from "../../../firebase/events";
import {getEventId} from "../../../state/event/event";
import {StyledInput} from "../../../ui/inputs";
import { StyledContainer } from "./EventUIVideoModal";
import { StyledButtonWrapper } from "./EventUIMicSettingsModal";

const EventUICreateRoomModal: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {

    const [roomName, setRoomName] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const canSubmit = !!roomName

    const onSubmit = () => {
        if (!canSubmit) return
        if (submitting) return
        setSubmitting(true)

        createNewEventRoom(getEventId(), roomName)
            .then(() => {
                onClose()
            })
            .catch((error) => {
                console.error(error)
                setSubmitting(false)
            })

    }

    if (submitting) {
        return (
            <div>
                creating...
            </div>
        )
    }

    return (
        <StyledContainer>
            <form onSubmit={event => {
                event.preventDefault()
                onSubmit()
            }}>
                <div>
                    <StyledInput smaller placeholder="Enter room name"
                                 value={roomName}
                                 type="text" onChange={event => setRoomName(event.target.value)}/>
                </div>
                <StyledButtonWrapper>
                    <StyledSmallRoundButton medium type="submit" disabled={!canSubmit}>
                        create room
                    </StyledSmallRoundButton>
                </StyledButtonWrapper>
            </form>
        </StyledContainer>
    );
};

export default EventUICreateRoomModal;