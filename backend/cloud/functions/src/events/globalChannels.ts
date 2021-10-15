import {getEventGlobalChannelsRef, getGlobalChannelRef} from "./refs";
import {
    EventChannel,
    getUserGlobalChannels,
    GLOBAL_STAGE_CAPACITY,
    GlobalChannels,
} from "./types";
import {generateNewChannel} from "./generators";
import {generateUid} from "./ids";
import {generateHifiSpaceForEvent} from "./hifi";
import {TIMESTAMP} from "../app";
import {getChannelCapacity} from "./channels";

const fetchGlobalChannels = async (eventId: string) => {
    const ref = getEventGlobalChannelsRef(eventId)
    return ref.once('value').then(snapshot => snapshot.val() ?? {})
}

const getAvailableGlobalChannel = (globalChannels: GlobalChannels): string | null => {

    let availableChannel = null

    Object.values(globalChannels).forEach(channel => {
        const {activeMembers = {}} = channel
        if (Object.keys(activeMembers).length < getChannelCapacity(channel) - GLOBAL_STAGE_CAPACITY) {
            availableChannel = channel.id
        }
    })

    return availableChannel
}

const joinGlobalChannel = async (eventId: string, userId: string, channelId: string) => {

    const ref = getGlobalChannelRef(eventId, channelId)

    return ref.update({
        [`activeMembers/${userId}`]: TIMESTAMP,
    })

}

const createGlobalChannel = async (eventId: string) => {
    const channelId = generateUid()
    const {capacity, spaceId} = await generateHifiSpaceForEvent(`${eventId}/channel/${channelId}`, eventId)
    const globalChannel = generateNewChannel({
        id: channelId,
        spaceId,
        capacity,
    })
    const ref = getEventGlobalChannelsRef(eventId)
    await ref.update({
        [channelId]: globalChannel,
    })
    return globalChannel.id
}

const createNewGlobalChannelAndJoinIt = async (eventId: string, userId: string) => {
    const globalChannel = await createGlobalChannel(eventId)
    await joinGlobalChannel(eventId, userId, globalChannel)
}

const joinAvailableGlobalChannel = async (eventId: string, userId: string) => {
    const globalChannels = await fetchGlobalChannels(eventId)
    const userGlobalChannels = getUserGlobalChannels(globalChannels, userId)
    if (userGlobalChannels.length > 0) return
    const availableChannel = getAvailableGlobalChannel(globalChannels)
    if (availableChannel) {
        await joinGlobalChannel(eventId, userId, availableChannel)
    } else {
        await createNewGlobalChannelAndJoinIt(eventId, userId)
    }
}

// todo - call this automatically when the user comes online / joins
export const handleJoinGlobalChannel = async (req: any, res: any) => {

    const {
        eventId,
    } = req.body as {
        eventId: string,
    }

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    // eslint-disable-next-line no-void
    void joinAvailableGlobalChannel(eventId, userId)

    res.send({})

}

export const removeUserFromGlobalChannels = (eventId: string, channels: EventChannel[], userId: string) => {

    const globalChannelsRef = getEventGlobalChannelsRef(eventId)
    const update: Record<string, any> = {}

    channels.forEach(channel => {
        update[`${channel.id}/activeMembers/${userId}`] = null
    })

    return globalChannelsRef.update(update)

}

const leaveGlobalChannel = async (eventId: string, userId: string) => {

    const globalChannels = await fetchGlobalChannels(eventId)

    const userGlobalChannels = getUserGlobalChannels(globalChannels, userId)

    await removeUserFromGlobalChannels(eventId, userGlobalChannels, userId)

}

// todo - call this automatically when the user goes offline
export const handleLeaveGlobalChannel = async (req: any, res: any) => {

    const {
        eventId,
    } = req.body as {
        eventId: string,
    }

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    // eslint-disable-next-line no-void
    void leaveGlobalChannel(eventId, userId)

    res.send({})

}
