import {EventChannel} from "../state/event/channels";

export enum HifiCapacity {
    regular = 'Regular',
    medium = '50-user',
    large = '100-user',
    extraLarge = '150-user'
}

export const mappedHifiCapacityNames: Record<string, string> = {
    [HifiCapacity.regular]: 'Default (25)',
    [HifiCapacity.medium]: 'Medium (50)',
    [HifiCapacity.large]: 'Large (100)',
    [HifiCapacity.extraLarge]: 'Extra Large (150)',
}

export type EventGlobalStage = {
    activeMembers?: Record<string, number>,
}

export const getGlobalStageActiveMembers = (globalStage: EventGlobalStage) => {
    return globalStage.activeMembers ?? {}
}

export const isUserInGlobalStage = (globalStage: EventGlobalStage, userId: string) => {
    const activeMembers = getGlobalStageActiveMembers(globalStage)
    return !!activeMembers[userId]
}

export const globalStageHasUsers = (globalStage: EventGlobalStage) => {
    return Object.keys(getGlobalStageActiveMembers(globalStage)).length > 0
}

export type EventChatMessage = {
    message: string,
    author: string,
    timestamp: number,
    removed?: boolean,
}

export type EventGlobalChat = Record<string, EventChatMessage>

export type EventGlobalChatSettings = {
    bannedUsers: Record<string, {
        banned: boolean,
    }>
}

export type EventReactionData = {
    key: string,
    reaction: string,
    timestamp: number,
}

export type EventData = {
    channels?: Record<string, EventChannel>
    globalChannels?: Record<string, EventChannel>
    globalStage?: EventGlobalStage,
    globalChat?: EventGlobalChat,
    globalChatSettings?: EventGlobalChatSettings,
    eventData?: {
        creator: string,
        name: string,
        paymentPointer?: string,
        hifi?: {
            spaceId: string,
        }
    },
    users?: {
        [key: string]: {
            joined?: boolean,
            online?: boolean,
            name?: string,
            socketId?: string,
        }
    }
}
