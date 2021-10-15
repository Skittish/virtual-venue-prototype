import React, {useState} from "react"
import { StyledContainer } from "./EventUIVideoModal"
import {getRoomName, RoomData, useRooms} from "../../../state/event/rooms";
import {StyledList} from "./EventUISettingsModal";
import {FaEdit} from "react-icons/all";
import styled from "styled-components";
import { StyledRoundButton, StyledRoundedButton, StyledSmallRoundButton } from "../../../ui/buttons";
import Modal from "../../../components/Modal";
import EventUIEditingRoomModal from "./EventUIEditingRoomModal";
import EventUICreateRoomModal from "./EventUICreateRoomModal";
import {setCreatingNewRoom} from "../../../state/ui";
import {StyledButtonWrapper} from "./EventUIMicSettingsModal";

const StyledRoom = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const StyledRoomName = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
`

const StyledEdit = styled.div`
    margin-left: 10px;
`

const EventUIEditingRoomsModal: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {

    const [editingRoom, setEditingRoom] = useState<[string, RoomData] | null>(null)

    const rooms = Object.entries(useRooms())

    return (
        <>
            <StyledContainer>
                <StyledList>
                    {
                        rooms.map(([key, room]) => (
                            <li key={key}>
                                <StyledRoom>
                                    <StyledRoomName>
                                        {getRoomName(room, key)}
                                    </StyledRoomName>
                                    <StyledEdit>
                                        <StyledRoundButton small onClick={() => {
                                            setEditingRoom([key, room])
                                        }}>
                                            <FaEdit size={14}/>
                                        </StyledRoundButton>
                                    </StyledEdit>
                                </StyledRoom>
                            </li>
                        ))
                    }
                </StyledList>
                <StyledButtonWrapper>
                    <StyledSmallRoundButton medium onClick={() => {
                        setCreatingNewRoom(true)
                    }}>
                        create new room
                    </StyledSmallRoundButton>
                </StyledButtonWrapper>
            </StyledContainer>
            <Modal isOpen={!!editingRoom} onRequestClose={() => setEditingRoom(null)}>
                {
                    editingRoom && (
                        <EventUIEditingRoomModal roomKey={editingRoom[0]} room={editingRoom[1]} onClose={() => {
                            setEditingRoom(null)
                        }}/>
                    )
                }
            </Modal>
        </>
    )
}

export default EventUIEditingRoomsModal