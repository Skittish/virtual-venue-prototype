import * as functions from 'firebase-functions';
import {
    getChannelActiveMembersRef,
    getChannelQueuedMembersRef,
    getChannelRef,
    getEventChannelsRef, getEventGlobalChannelsRef,
    getEventRef,
} from "./refs";
import {TIMESTAMP} from "../app";
import {
    DEFAULT_HIFI_SPACE_CAPACITY,
    EventChannel,
    getEventChannels,
    getEventGlobalChannels,
    VirtualVenueEvent,
} from "./types";
import {createAndStoreNewChannel, fetchEvent} from "./events";
import {generateUid} from "./ids";
import {
    changeSpaceCapacity,
    checkIfEventIsDevelopmentEvent,
    generateHifiSpaceForEvent,
    HifiCapacity,
    mappedHifiCapacities,
} from "./hifi";
import {isUserVirtualVenueAdmin} from "./admin";

const fetchChannel = (eventId: string, channelId: string): Promise<EventChannel> => {
    const ref = getChannelRef(eventId, channelId)
    return ref.once('value').then(snapshot => snapshot.val())
}

export const getChannelCapacity = (channel: EventChannel): number => {
    if (channel.hifi && channel.hifi.capacity) {
        const capacity = channel.hifi.capacity
        if (mappedHifiCapacities[capacity]) {
            return mappedHifiCapacities[capacity]
        }
    }
    return DEFAULT_HIFI_SPACE_CAPACITY
}

const getChannelNumberOfActiveMembers = (channel: EventChannel): number => {
    const {activeMembers = {}} = channel
    return Object.keys(activeMembers).length
}

const doesChannelHaveEmptySlots = (channel: EventChannel): boolean => {
    return getChannelNumberOfActiveMembers(channel) < getChannelCapacity(channel)
}

const joinChannel = (eventId: string, channelId: string, userId: string) => {
    const ref = getChannelActiveMembersRef(eventId, channelId)
    return ref.update({
        [userId]: TIMESTAMP,
    })
}

const joinChannelQueue = (eventId: string, channelId: string, userId: string) => {
    const ref = getChannelQueuedMembersRef(eventId, channelId)
    return ref.update({
        [userId]: TIMESTAMP,
    })
}

const getChannelActiveMembers = (channel: EventChannel) => {
    return channel.activeMembers ?? {}
}

const isUserInChannelActiveMembers = (channel: EventChannel, userId: string) => {
    const activeMembers = getChannelActiveMembers(channel)
    return activeMembers.hasOwnProperty(userId)
}

const getChannelQueuedMembers = (channel: EventChannel) => {
    return channel.queuedMembers ?? {}
}

const isUserInChannelQueue = (channel: EventChannel, userId: string) => {
    const queuedMembers = getChannelQueuedMembers(channel)
    return queuedMembers.hasOwnProperty(userId)
}

export const requestToJoinChannel = async (eventId: string, channelId: string, userId: string) => {

    const channel = await fetchChannel(eventId, channelId)

    if (isUserInChannelActiveMembers(channel, userId) || isUserInChannelQueue(channel, userId)) {
        return
    }

    if (doesChannelHaveEmptySlots(channel)) {
        return joinChannel(eventId, channelId, userId)
    } else {
        return joinChannelQueue(eventId, channelId, userId)
    }

}

export const handleJoinChannel = async (req: any, res: any) => {

    const {
        eventId,
        channelId,
    } = req.body as {
        eventId: string,
        channelId: string,
    }

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    await requestToJoinChannel(eventId, channelId, userId)

    res.send({})

}

export const leaveChannel = (eventId: string, channelId: string, userId: string) => {

    const ref = getChannelRef(eventId, channelId)

    return ref.update({
        [`activeMembers/${userId}`]: null,
        [`queuedMembers/${userId}`]: null,
    })

}

export const handleLeaveChannel = async (req: any, res: any) => {

    const {
        eventId,
        channelId,
    } = req.body as {
        eventId: string,
        channelId: string,
    }

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    await leaveChannel(eventId, channelId, userId)

    res.send({})

}

const getChannelQueuedMembersSorted = (channel: EventChannel): string[] => {
    const {queuedMembers = {}} = channel
    return Object.entries(queuedMembers).sort(([,dateA], [,dateB]) => {
        return dateA - dateB
    }).map(([key]) => key)
}

const getNumberOfChannelActiveMembers = (channel: EventChannel): number => {
    const {activeMembers = {}} = channel
    return Object.keys(activeMembers).length
}

const getNumberOfAvailableSpotsInChannel = (channel: EventChannel): number => {
    const numberOfActiveMembers = getNumberOfChannelActiveMembers(channel)
    const capacity = getChannelCapacity(channel)
    return capacity - numberOfActiveMembers
}

export const handleChannelMembersTrigger = async (eventId: string, channelId: string) => {

    const channel = await fetchChannel(eventId, channelId)

    const queuedMembers = getChannelQueuedMembersSorted(channel)

    if (queuedMembers.length === 0) return

    const availableSpots = getNumberOfAvailableSpotsInChannel(channel)

    if (availableSpots <= 0) return

    const membersToAdd = queuedMembers.slice(0, availableSpots)

    const ref = getChannelRef(eventId, channelId)

    const update: Record<string, any> = {}

    membersToAdd.forEach(userId => {
        update[`/activeMembers/${userId}`] = TIMESTAMP
        update[`/queuedMembers/${userId}`] = null
    })

    return ref.update(update)

}

export const manualChannelMembersTrigger = async (req: any, res: any) => {

    const {
        eventId,
        channelId,
    } = req.body as {
        eventId: string,
        channelId: string,
    }

    // const {
    //     user_id: userId,
    // } = req.user as {
    //     user_id: string,
    // }

    // eslint-disable-next-line no-void
    void handleChannelMembersTrigger(eventId, channelId)

    res.send({})

}

export const channelMembersTrigger = functions.database.ref('/events/{eventId}/channels/{channelId}/activeMembers/{userId}').onDelete(
    (snap, context) => {

        const {
            eventId,
            channelId,
        } = context.params as {
            eventId: string,
            channelId: string,
        }

        // eslint-disable-next-line no-void
        void handleChannelMembersTrigger(eventId, channelId)

})

export const createNewChannel = async (eventId: string) => {

    const channelId = generateUid()

    const {capacity, spaceId} = await generateHifiSpaceForEvent(`${eventId}/channel/${channelId}`, eventId)

    const channel = await createAndStoreNewChannel(eventId, spaceId, channelId, capacity)

    return channel.id

}

export const handleCreateNewChannel = async (req: any, res: any) => {

    const {
        eventId,
    } = req.body as {
        eventId: string,
    }

    // const {
    //     user_id: userId,
    // } = req.user as {
    //     user_id: string,
    // }

    const channelId = await createNewChannel(eventId)

    res.send({
        channelId,
    })

}

export const getEventDefaultSpaceId = (event: VirtualVenueEvent) => {
    return event.eventData?.hifi?.spaceId ?? ''
}

const convertEventChannelsHifiSpaceSizes = async (eventId: string, event: VirtualVenueEvent, hifiCapacity: HifiCapacity, isDevelopmentEvent: boolean) => {

    const channels = getEventChannels(event)

    Object.entries(channels).forEach(([channelId, channel]) => {
        // eslint-disable-next-line no-void
        void changeSpaceCapacity(channel.hifi.spaceId, hifiCapacity, isDevelopmentEvent)
        // eslint-disable-next-line no-void
        void getEventChannelsRef(eventId).child(channelId).update({
            ['hifi/capacity']: hifiCapacity,
        })
    })

    const globalChannels = getEventGlobalChannels(event)

    Object.entries(globalChannels).forEach(([channelId, channel]) => {
        // eslint-disable-next-line no-void
        void changeSpaceCapacity(channel.hifi.spaceId, hifiCapacity, isDevelopmentEvent)
        // eslint-disable-next-line no-void
        void getEventGlobalChannelsRef(eventId).child(channelId).update({
            ['hifi/capacity']: hifiCapacity,
        })
    })

}

export const convertEventHifiSpaceSizes = async (eventId: string, hifiCapacity: HifiCapacity) => {

    const eventRef = getEventRef(eventId)
    const event = await fetchEvent(eventId)
    const isDevelopmentEvent = await checkIfEventIsDevelopmentEvent(eventId, event.eventData)

    // eslint-disable-next-line no-void
    void eventRef.update({
        [`/eventData/hifi/capacity`]: hifiCapacity,
    })

    const defaultSpaceId = getEventDefaultSpaceId(event)
    await changeSpaceCapacity(defaultSpaceId, hifiCapacity, isDevelopmentEvent)

    await convertEventChannelsHifiSpaceSizes(eventId, event, hifiCapacity, isDevelopmentEvent)

}

export const handleConvertEventHifiSpaceSizes = async (req: any, res: any) => {

    const {
        eventId,
        hifiCapacity,
    } = req.body as {
        eventId: string,
        hifiCapacity: HifiCapacity,
    }

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    const isAdmin = await isUserVirtualVenueAdmin(userId)

    if (!isAdmin) {
        return res.send({
            code: 'insufficient_permissions',
        })
    }

    await convertEventHifiSpaceSizes(eventId, hifiCapacity)

    res.send({})

}
