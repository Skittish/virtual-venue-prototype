import React, {useEffect, useState} from "react"
import styled from "styled-components";
import {useCurrentChannel} from "../EventChannelHandler";
import {EventChannel} from "../../../state/event/channels";
import {getCurrentUserId, useCurrentUserId} from "../../../state/auth";
import {getPositionString} from "../../../utils/strings";
import {THEME} from "../../../ui/theme";
import {useGlobalSpaceConnections, useIsHifiConnecting} from "../../audio/EventHifiAudioHandler";
import {useIsPlayerInsideAnyStage} from "../../../state/collisions";
import {useEventUsers, useUsersList} from "../../../state/event/users";
import {getEventGlobalChannelsRef} from "../../../firebase/refs";
import {getEventId} from "../../../state/event/event";

const StyledContainer = styled.div`
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    padding: ${THEME.spacing.$5}px;
    text-align: center;
`

const getChannelSortedQueue = (channel: EventChannel): string[] => {
    const {queuedMembers = {}} = channel
    return Object.entries(queuedMembers).sort(([,dateA], [,dateB]) => {
        return dateA - dateB
    }).map(([id]) => id)
}

const Message: React.FC = ({children}) => {
    return (
        <p>
            {children}
        </p>
    )
}

export const useIsConnectingToGlobalStages = () => {

    const globalSpaceConnections = useGlobalSpaceConnections()

    const isConnecting = Object.values(globalSpaceConnections).reduce((prevValue, currentValue) => {
        if (!currentValue) return true
        return prevValue
    }, false)

    const isConnected = Object.values(globalSpaceConnections).reduce((prevValue, currentValue) => {
        return currentValue
    }, false)

    return {
        isConnecting,
        isConnected,
    }
}

const useGlobalChannelsConnectedUsers = () => {

    const [connectedUsers, setConnectedUsers] = useState<string[]>([])

    useEffect(() => {
        const ref = getEventGlobalChannelsRef(getEventId())
        const currentUserId = getCurrentUserId()

        ref.on('value', snapshot => {
            const data = snapshot.val() as Record<string,EventChannel>
            if (!data) return
            const allUsers: Record<string, boolean> = {}
            Object.values(data).forEach(channel => {
                const {users = {}} = channel
                Object.entries(users).forEach(([userId, userData]) => {
                    if (userData && userData.connected && userId !== currentUserId) {
                        allUsers[userId] = true
                    }
                })
            })
            setConnectedUsers(Object.keys(allUsers))
        })
    }, [])

    return connectedUsers

}

const useHaveAllUsersConnectedToGlobalStage = () => {

    const users = useUsersList()

    const numberOfOnlineUsers = users.length

    const connectedUsers = useGlobalChannelsConnectedUsers()

    const numberOfConnectedUsers = connectedUsers.length

    return numberOfConnectedUsers >= numberOfOnlineUsers
}

const StageMessages: React.FC = () => {

    const [defaultTimePassed, setDefaultTimePassed] = useState(false)
    const {isConnecting, isConnected} = useIsConnectingToGlobalStages()

    const haveAllUsersConnectedToGlobalStage = useHaveAllUsersConnectedToGlobalStage()

    useEffect(() => {

        if (isConnected) {
            const timeout = setTimeout(() => {
                setDefaultTimePassed(true)
            }, 5000)
            return () => {
                clearTimeout(timeout)
            }
        } else {
            setDefaultTimePassed(false)
        }

    }, [isConnected])

    if (isConnecting) {

        return (
            <>
                <p>
                    Connecting to global stage...
                </p>
            </>
        )

    }

    if (isConnected && !haveAllUsersConnectedToGlobalStage && !defaultTimePassed) {
        return (
            <>
                <p>
                    Other users are still connecting to global stage...
                </p>
            </>
        )
    }

    return null
}

export const ChannelUI: React.FC = () => {

    const {
        channel,
        isConnected,
    } = useCurrentChannel()
    const currentUser = useCurrentUserId()
    const hifiConnecting = useIsHifiConnecting()
    const isInsideStage = useIsPlayerInsideAnyStage()

    const messages: any[] = []

    if (!channel || hifiConnecting) {
        messages.push(
            <Message key='connectingToChannel'>
                Connecting to channel...
            </Message>
        )
    } else if (channel && !isConnected) {
        const sortedQueue = getChannelSortedQueue(channel)

        const queuePosition = sortedQueue.indexOf(currentUser) + 1

        messages.push(
            <Message key={'waitingToJoin'}>
                Waiting to join the audio channel. {getPositionString(queuePosition)} in the queue.
            </Message>
        )
    }

    return (
        <StyledContainer>
            <div>
                {messages}
                {
                    isInsideStage && (
                        <StageMessages/>
                    )
                }
            </div>
        </StyledContainer>
    )

}
