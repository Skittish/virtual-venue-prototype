import React, {useEffect, useMemo, useState} from "react"
import {joinGlobalChannel, leaveGlobalChannel} from "../../firebase/events";
import {getEventId} from "../../state/event/event";
import {getEventGlobalChannelsRef, getEventGlobalStageRef} from "../../firebase/refs";
import {getCurrentUserId, useCurrentUserId} from "../../state/auth";
import {EventChannel, isUserInsideChannel} from "../../state/event/channels";
import {EventGlobalStage, globalStageHasUsers, isUserInGlobalStage} from "../../firebase/types";
import {HifiConnection} from "../audio/EventHifiAudioHandler";
import {insideStageConfig} from "../audio/hifiAudio";

type GlobalChannels = Record<string, EventChannel>

const useUserGlobalChannels = (globalChannels: GlobalChannels) => {
    const userId = useCurrentUserId()

    let userGlobalChannels: EventChannel[] = []

    Object.values(globalChannels).forEach(channel => {
        if (isUserInsideChannel(channel, userId)) {
            userGlobalChannels.push(channel)
        }
    })

    return userGlobalChannels

}

const useIsUserInGlobalStage = () => {

    const [isInGlobalStage, setIsInGlobalStage] = useState(false)

    useEffect(() => {

        const ref = getEventGlobalStageRef(getEventId())
        const userId = getCurrentUserId()

        ref.on('value', snapshot => {
            const data = snapshot.val() as EventGlobalStage | null
            if (!data) {
                setIsInGlobalStage(false)
                return
            }
            setIsInGlobalStage(isUserInGlobalStage(data, userId))
        })

    }, [])

    return isInGlobalStage

}

const ConnectionCommunicatorHandler: React.FC<{
    communicator: any,
}> = ({communicator}) => {
    console.log('ConnectionCommunicatorHandler', communicator)
    return null
}

const GlobalChannel: React.FC<{
    channelId: string,
    canTalk: boolean,
    spaceId: string,
}> = ({channelId, spaceId, canTalk}) => {
    return <HifiConnection defaultApiState={insideStageConfig}
                           channelId={channelId}
                           spaceId={spaceId}
                           micEnabled={canTalk}
                           isPrimaryConnection={false} isGlobalChannel/>
}

const useGlobalStageState = () => {

    const [hasUsers, setHasUsers] = useState(false)
    const [isInStage, setIsInStage] = useState(false)

    useEffect(() => {

        const ref = getEventGlobalStageRef(getEventId())
        const userId = getCurrentUserId()

        ref.on('value', snapshot => {
            const data = snapshot.val() as EventGlobalStage | null
            if (!data) {
                setIsInStage(false)
                setHasUsers(false)
                return
            }
            setIsInStage(isUserInGlobalStage(data, userId))
            setHasUsers(globalStageHasUsers(data))
        })

        return () => {
            ref.off('value')
        }

    }, [])

    return {
        hasUsers,
        isInStage,
    }

}

export const EventGlobalChannelHandler: React.FC = () => {

    const [globalChannels, setGlobalChannels] = useState<GlobalChannels>({})

    const {isInStage: isInGlobalStage, hasUsers: globalStageHasUsers} = useGlobalStageState()

    useEffect(() => {

        const ref = getEventGlobalChannelsRef(getEventId())

        ref.on('value', snapshot => {
            const data = snapshot.val()
            if (!data) return
            setGlobalChannels(data)
        })

    }, [])

    useEffect(() => {
        if (!globalStageHasUsers) return
        joinGlobalChannel(getEventId())
        return () => {
            leaveGlobalChannel(getEventId())
        }
    }, [globalStageHasUsers])


    const userGlobalChannels = useUserGlobalChannels(globalChannels)

    const channels = useMemo(() => {
        const sortedChannels: {
            canTalk: boolean,
            channel: EventChannel,
        }[] = []
        const userChannels = userGlobalChannels.map(channel => channel.id)
        Object.values(globalChannels).forEach(channel => {
            if (isInGlobalStage || userChannels.includes(channel.id)) {
                sortedChannels.push({
                    canTalk: isInGlobalStage,
                    channel,
                })
            }
        })
        return sortedChannels
    }, [globalChannels, userGlobalChannels, isInGlobalStage])

    return (
        <>
            {
                Object.values(channels).map(({
                    canTalk,
                    channel
                }) => {
                    return <GlobalChannel key={channel.id} channelId={channel.id} spaceId={channel.hifi?.spaceId || ''} canTalk={canTalk}/>
                })
            }
        </>
    )
}
