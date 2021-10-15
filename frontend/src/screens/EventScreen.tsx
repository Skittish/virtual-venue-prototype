import React, {useEffect} from "react"
import { useParams } from 'react-router-dom'
import AuthWrapper from "../event/components/AuthWrapper"
import Event from "../event/components/Event"
import UserDataWrapper from "../event/components/UserDataWrapper";
import EventDataWrapper from "../event/components/EventDataWrapper";
import {
    getEventId,
    useEventHasLoaded,
    useHasJoined,
    useIsEventCreator,
    useIsUserBanned, useIsUserOnline,
    useUserStatusListener
} from "../state/event/event";
import EventOverlay from "../event/components/EventOverlay";
import AuthRequiredWrapper, {LoadingView} from "../components/AuthRequiredWrapper";
import { EventGlobalStyle } from "../ui/global";
import {useEventIsClosed} from "../state/event/sessionData";
import {StyledMediumHeading} from "../ui/typography/headings";
import styled from "styled-components";
import {THEME} from "../ui/theme";
import { StyledRoundedButton } from "../ui/buttons";
import { EventAccessWrapper } from "../event/components/EventAccessWrapper";
import {useIsAdmin} from "../event/components/EventUI/EventUISettingsModal";
import {getFirestoreEventRef, getFirestoreEventsRef} from "../firebase/firestore/refs";

const StyledButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${THEME.spacing.$2}px;
`

const ReconnectMessage: React.FC = () => {

    const onReconnect = () => {
        window.location.reload()
    }

    return (
        <LoadingView>
            <div>
                <StyledMediumHeading>
                    You have lost connection.
                </StyledMediumHeading>
                <StyledButtonWrapper>
                    <StyledRoundedButton onClick={onReconnect}>Reconnect</StyledRoundedButton>
                </StyledButtonWrapper>
            </div>
        </LoadingView>
    )

}

const Inner: React.FC = () => {

    const isBanned = useIsUserBanned()
    useUserStatusListener()
    const hasJoined = useHasJoined()
    const eventHasLoaded = useEventHasLoaded()

    const showOverlay = !hasJoined || !eventHasLoaded

    const isEventCreator = useIsEventCreator()
    const isAdmin = useIsAdmin()
    const isClosed = useEventIsClosed()
    const userIsOffline = !useIsUserOnline()

    if (isBanned) {
        return (
            <LoadingView>
                <StyledMediumHeading>
                    You are unable to access this event.
                </StyledMediumHeading>
            </LoadingView>
        )
    }

    if (isClosed && (!isEventCreator && !isAdmin)) {
        return (
            <LoadingView>
                <StyledMediumHeading>
                    Stay tuned. This event is not open yet.
                </StyledMediumHeading>
            </LoadingView>
        )
    }

    if (hasJoined && userIsOffline) {
        return (
            <ReconnectMessage/>
        )
    }

    return (
        <>
            {
                hasJoined && (
                    <UserDataWrapper/>
                )
            }
            <Event/>
            {
                showOverlay && <EventOverlay/>
            }
        </>
    )
}

const EventScreen: React.FC = () => {

    const { eventID } = useParams<{
        eventID: string,
    }>()

    return (
        <>
            <EventGlobalStyle/>
            <AuthWrapper>
                <AuthRequiredWrapper>
                    <EventAccessWrapper eventId={eventID}>
                        <EventDataWrapper eventID={eventID}>
                            <Inner/>
                        </EventDataWrapper>
                    </EventAccessWrapper>
                </AuthRequiredWrapper>
            </AuthWrapper>
        </>
    )
}

export default EventScreen
