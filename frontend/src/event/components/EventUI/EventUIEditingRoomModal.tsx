import React, {useState} from "react"
import {getRoomName, RoomData} from "../../../state/event/rooms";
import { StyledSmallRoundButton } from "../../../ui/buttons";
import {StyledContainer, StyledInputWrapper} from "./EventUIVideoModal";
import {updateRoomName} from "../../../firebase/rooms";
import { StyledMediumHeading } from "../../../ui/typography/headings";
import {StyledInput} from "../../../ui/inputs";

const EventUIEditingRoomModal: React.FC<{
    roomKey: string,
    room: RoomData,
    onClose: () => void,
}> = ({room, roomKey, onClose}) => {

    const [name, setName] = useState(getRoomName(room, roomKey))

    const validName = !!name

    const onSubmit = () => {
        if (!validName) return
        updateRoomName(roomKey, name)
        onClose()
    }

    return (
        <StyledContainer>
            <form onSubmit={event => {
                event.preventDefault()
                onSubmit()
            }}>
                <StyledMediumHeading as="label" htmlFor="edit-room-name">
                    edit room name
                </StyledMediumHeading>
                <StyledInputWrapper>
                    <StyledInput smaller id="edit-room-name" value={name} type="text" placeholder="enter room name"
                                 onChange={event => setName(event.target.value)} />
                </StyledInputWrapper>
                <div>
                    <StyledSmallRoundButton medium disabled={!validName}>
                        save
                    </StyledSmallRoundButton>
                </div>
            </form>
        </StyledContainer>
    )
}

export default EventUIEditingRoomModal