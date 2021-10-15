import React, {useState} from "react"
import { StyledSmallRoundButton } from "../../../ui/buttons"
import { StyledContainer } from "./EventUIVideoModal"
import {setEditAccessSettings, uiProxy} from "../../../state/ui";
import styled from "styled-components";
import {THEME} from "../../../ui/theme";
import {useIsEventCreator} from "../../../state/event/event";
import {useEventIsClosed, useEventIsPublicEditingEnabled} from "../../../state/event/sessionData";
import {setUserOffline, setEventPublicEditingEnabled} from "../../../firebase/event";
import {CloseEventConfirmationModal} from "./CloseEventConfirmationModal";
import {useCurrentRoomId, useCurrentUserRole} from "../../../state/event/users";
import {useHistory} from "react-router-dom";
import {EventAudioUsageView} from "../../../screens/EventAdminScreen";
import {useEventId} from "../EventDataWrapper";
import {useIsVirtualVenueAdmin} from "../../../screens/createEvent/CreateEventForm";
import {saveEventRoomSceneryAsTemplate} from "../../../firebase/events";

export const StyledList = styled.ul`
  
    &:not(:first-of-type) {
      border-top: 1px solid rgba(255,255,255,0.5);
      margin-top: ${THEME.spacing.$5}px;
      padding-top: ${THEME.spacing.$5}px;
    }

    > li {
      &:not(:first-child) {
        margin-top: 10px;
      }
    }

`

export enum UserRoles {
    default = '',
    speaker = 'speaker',
    admin = 'admin'
}

export const useIsSpeaker = () => {
    const userRole = useCurrentUserRole()
    return userRole === UserRoles.speaker
}

export const useIsAdmin = () => {
    const userRole = useCurrentUserRole()
    const isCreator = useIsEventCreator()
    return isCreator || userRole === UserRoles.admin
}

const StyledEventInfoContainer = styled.div`
  margin-bottom: ${THEME.spacing.$2}px;
`

const EventUISettingsModal: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {

    const eventId = useEventId()
    const [showCloseEventConfirmation, setShowCloseEventConfirmation] = useState(false)

    const onEditRooms = () => {
        uiProxy.editingRooms = true
        onClose()
    }

    const onEditRoomAudio = () => {
        uiProxy.editRoomAudio = true
        onClose()
    }

    const onViewUsers = () => {
        uiProxy.showUsers = true
        onClose()
    }

    const onEditAccessSettings = () => {
        setEditAccessSettings(true)
        onClose()
    }

    const eventIsClosed = useEventIsClosed()
    const publicEditingEnabled = useEventIsPublicEditingEnabled()
    const isVirtualVenueAdmin = useIsVirtualVenueAdmin()
    const roomId = useCurrentRoomId()

    const toggleEventOpen = () => {
        setShowCloseEventConfirmation(true)
    }

    const togglePublicEditingEnabled = () => {
        setEventPublicEditingEnabled(!publicEditingEnabled)
    }

    const saveRoomAsTemplate = () => {
        saveEventRoomSceneryAsTemplate(eventId, roomId)
    }

    return (
        <>
            <StyledContainer>
                <StyledEventInfoContainer>
                    <EventAudioUsageView eventId={eventId} linkToAdminPage/>
                </StyledEventInfoContainer>
                <StyledList>
                    <li>
                        <StyledSmallRoundButton onClick={onEditAccessSettings} fullWidth>
                            event privacy settings
                        </StyledSmallRoundButton>
                    </li>
                    <li>
                        <StyledSmallRoundButton onClick={onViewUsers} fullWidth>
                            view users
                        </StyledSmallRoundButton>
                    </li>
                    <li>
                        <StyledSmallRoundButton onClick={togglePublicEditingEnabled} fullWidth>
                            {
                                publicEditingEnabled ? "disable public editing" : "enable public editing"
                            }
                        </StyledSmallRoundButton>
                    </li>
                    <li>
                        <StyledSmallRoundButton onClick={onEditRooms} fullWidth>
                            edit rooms
                        </StyledSmallRoundButton>
                    </li>
                    <li>
                        <StyledSmallRoundButton onClick={onEditRoomAudio} fullWidth>
                            adjust room audio
                        </StyledSmallRoundButton>
                    </li>
                    <li>
                        <StyledSmallRoundButton fullWidth onClick={toggleEventOpen}>
                            {
                                eventIsClosed ? "open event" : "close event"
                            }
                        </StyledSmallRoundButton>
                    </li>
                    {
                        isVirtualVenueAdmin && (
                            <li>
                                <StyledSmallRoundButton onClick={saveRoomAsTemplate} fullWidth>
                                    save room as template
                                </StyledSmallRoundButton>
                            </li>
                        )
                    }
                </StyledList>
            </StyledContainer>
            {
                showCloseEventConfirmation && (
                    <CloseEventConfirmationModal onClose={() => {
                        setShowCloseEventConfirmation(false)
                    }}/>
                )
            }
        </>
    )
}

export default EventUISettingsModal
