import React, {useEffect, useState} from "react"
import {getEventId} from "../../state/event/event";
import {getEventChannelRef, getEventChannelsRef} from "../../firebase/refs";
import {useCurrentRoomDefaultChannelId} from "../../state/event/rooms";
import {joinChannel, leaveChannel} from "../../firebase/events";
import {getCurrentUserId, useCurrentUserId} from "../../state/auth";
import {EventChannel} from "../../state/event/channels";
import {proxy, useProxy} from "valtio";
import {useCollidedChannelZone} from "../../state/collisions";


const isUserInChannel = (channel: EventChannel, userId: string) => {

    const {activeMembers = {}, queuedMembers = {}} = channel

    return activeMembers.hasOwnProperty(userId) || queuedMembers.hasOwnProperty(userId)

}

const getUserCurrentChannel = (channels: Record<string, EventChannel>, userId: string): EventChannel | null => {
    let matchedChannel: EventChannel | null = null
    Object.values(channels).forEach(channel => {
        if (matchedChannel) return
        if (isUserInChannel(channel, userId)) {
            matchedChannel = channel
        }
    })
    return matchedChannel
}

const getChannelActiveMembers = (channel: EventChannel) => {
    return channel.activeMembers ?? {}
}

const isUserActiveChannelMember = (channel: EventChannel, userId: string) => {
    const activeMembers = getChannelActiveMembers(channel)
    return activeMembers.hasOwnProperty(userId)
}

export const channelStateProxy = proxy({
    channelId: '',
    isConnected: false,
})

export const channelsDataProxy = proxy<{
    channels: Record<string, EventChannel>
}>({
    channels: {},
})

export const useCurrentChannel = () => {
    const {
        channelId,
        isConnected,
    } = useProxy(channelStateProxy)
    const {channels} = useProxy(channelsDataProxy)
    const currentChannel = channels[channelId]

    return  {
        channel: currentChannel,
        isConnected,
    }

}

export const useCurrentChannelHifiSpace = () => {
    const {
        channelId,
        isConnected,
    } = useProxy(channelStateProxy)
    const {channels} = useProxy(channelsDataProxy)

    if (!isConnected) return ''

    const currentChannel = channels[channelId]

    if (!currentChannel) return ''

    return currentChannel.hifi?.spaceId

}

const CurrentChannel: React.FC<{
    channel: EventChannel,
}> = ({channel}) => {

    const userId = useCurrentUserId()
    const isActiveMember = isUserActiveChannelMember(channel, userId)

    useEffect(() => {
        channelStateProxy.channelId = channel.id
        channelStateProxy.isConnected = isActiveMember
    }, [isActiveMember])

    useEffect(() => {
        return () => {
            channelStateProxy.channelId = ''
            channelStateProxy.isConnected = false
        }
    }, [])

    return null
}

export const EventChannelHandler: React.FC = () => {

    const [channels, setChannels] = useState<Record<string, EventChannel>>({})
    const currentRoomChannelId = useCurrentRoomDefaultChannelId()
    const userId = useCurrentUserId()

    useEffect(() => {
        const channelsRef = getEventChannelsRef(getEventId())

        channelsRef.on('value', (snapshot) => {
            const data = snapshot.val()
            if (!data) return
            setChannels(data)
            channelsDataProxy.channels = data
        })

        return () => {
            channelsRef.off()
        }

    }, [])

    const collidedChannelId = useCollidedChannelZone()

    const desiredChannelId = collidedChannelId || currentRoomChannelId

    useEffect(() => {
        joinChannel(getEventId(), desiredChannelId)
        const channelRef = getEventChannelRef(getEventId(), desiredChannelId)

        channelRef.onDisconnect().update({
            [`activeMembers/${getCurrentUserId()}`]: null,
        })

        return () => {
            leaveChannel(getEventId(), desiredChannelId)
            channelRef.onDisconnect().cancel()
        }

    }, [desiredChannelId])

    const currentChannel = getUserCurrentChannel(channels, userId)

    return currentChannel ? <CurrentChannel channel={currentChannel} key={currentChannel.id}/> : null
}
