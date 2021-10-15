import {
    EventAccessSettings,
    EventChannel,
    GLOBAL_STAGE_CAPACITY,
    GlobalStage,
    EventAccessType,
} from "./types";
import {generateUid} from "./ids";
import {HifiCapacity} from "./hifi";
import {fetchDefaultEventRoomTemplate} from "../firestore/event";

export const generateGlobalStage = (): GlobalStage => {
    return {
        capacity: GLOBAL_STAGE_CAPACITY,
        activeMembers: {},
    }
}

export const generateNewRoom = ({
    name,
    id = generateUid(),
    spaceId,
    channelId,
                                    capacity,
                                }: {
    name: string,
    id?: string,
    spaceId: string,
    channelId: string,
    capacity: string,
}) => {
    return {
        id,
        name,
        channelId,
        hifi: {
            spaceId,
            capacity,
        },
        scenery: {},
    }
}

export const generateNewChannel = ({
    id = generateUid(),
    spaceId,
    capacity = HifiCapacity.regular,
                                   }: {
    id?: string,
    spaceId: string,
    capacity?: string,
}): EventChannel => {
    return {
        id,
        hifi: {
          spaceId,
          capacity,
        },
        activeMembers: {},
        queuedMembers: {},
    }
}

export const generateEventAccessSettings = (): EventAccessSettings => {
    return {
        type: EventAccessType.PUBLIC,
    }
}

export const generateNewEvent = async (
    name: string,
    creator: string,
    paymentPointer: string,
    spaceId: string,
    isDevelopmentEvent: boolean,
    hifiCapacity: string,
) => {

    const defaultRoomTemplate = await fetchDefaultEventRoomTemplate()

    const defaultChannel = generateNewChannel({
        id: 'default',
        spaceId,
    })

    return {
        eventData: {
            creator,
            name,
            paymentPointer,
            isDevelopmentEvent,
            hifi: {
                spaceId,
                capacity: hifiCapacity,
            },
        },
        channels: {
            [defaultChannel.id]: defaultChannel,
        },
        globalStage: generateGlobalStage(),
        roomsData: {
            main: {
                scenery: defaultRoomTemplate,
            },
        },
    }
}
