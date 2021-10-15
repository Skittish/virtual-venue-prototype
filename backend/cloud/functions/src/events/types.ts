// this is to ensure there's typically room for people in a stage to join the global channels
import {generateGlobalStage} from "./generators";

export type HifiSpaceData = {
    'connected-user-count': number,
    'space-id': string,
}

export const GLOBAL_STAGE_CAPACITY = 3

export const DEFAULT_HIFI_SPACE_CAPACITY = 120

export type GlobalChannels = Record<string, EventChannel>

export type GlobalStage = {
    capacity: number,
    activeMembers?: Record<string, number>,
}

export enum EventAccessType {
    PUBLIC = 'PUBLIC',
    PASSWORD = 'PASSWORD',
    INVITE = 'INVITE',
}

export type EventAccessSettings = {
    type: EventAccessType,
}

export type EventData = {
    creator: string,
    name: string,
    paymentPointer?: string,
    accessSettings?: EventAccessSettings
    isDevelopmentEvent?: boolean,
    hifi?: {
        spaceId: string,
        capacity?: string,
    }
}

export type VirtualVenueEvent = {
    channels?: Record<string, EventChannel>
    globalChannels?: GlobalChannels
    globalStage?: GlobalStage
    eventData?: EventData
    users?: Record<string, {
        online: boolean,
    }>
}

export type EventApprovedAccess = Record<string, string>

export type SecureEventData = {
    id: string,
    googleSheetId?: string,
    password?: string,
    approvedAccess?: EventApprovedAccess,
    usersWithAccess?: Record<string, string>
}

export type FirebaseDatabase = {
    events?: Record<string, VirtualVenueEvent>,
    secureEventData?: Record<string, SecureEventData>,
}

export type EventChannel = {
    id: string
    hifi: {
        spaceId: string
        capacity: string
    }
    activeMembers?: Record<string, number>
    queuedMembers?: Record<string, number>
}

export const getEventGlobalChannels = (event: VirtualVenueEvent) => {
    return event.globalChannels ?? {}
}

export const getEventChannels = (event: VirtualVenueEvent) => {
    return event.channels ?? {}
}

export const doesChannelIncludeUser = (channel: EventChannel, userId: string): boolean => {
    const {activeMembers = {}, queuedMembers = {}} = channel
    return activeMembers.hasOwnProperty(userId) || queuedMembers.hasOwnProperty(userId)
}

export const getUserCurrentChannels = (channels: Record<string, EventChannel>, userId: string): EventChannel[] => {

    const matchedChannels: EventChannel[] = []

    Object.values(channels).forEach(channel => {
        if (doesChannelIncludeUser(channel, userId)) {
            matchedChannels.push(channel)
        }
    })

    return matchedChannels
}
export const getUserGlobalChannels = (globalChannels: GlobalChannels, userId: string) => {
    const userGlobalChannels: EventChannel[] = []
    Object.values(globalChannels).forEach(channel => {
        if (doesChannelIncludeUser(channel, userId)) {
            userGlobalChannels.push(channel)
        }
    })
    return userGlobalChannels
}

export const getEventUserGlobalChannels = (event: VirtualVenueEvent, userId: string) => {
    return getUserGlobalChannels(getEventGlobalChannels(event), userId)
}

const getEventGlobalStage = (event: VirtualVenueEvent) => {
    return event.globalStage ?? generateGlobalStage()
}

const getGlobalStageActiveMembers = (globalStage: GlobalStage) => {
    return globalStage.activeMembers ?? {}
}

export const isUserInEventGlobalStage = (event: VirtualVenueEvent, userId: string) => {

    const globalStage = getEventGlobalStage(event)

    const activeMembers = getGlobalStageActiveMembers(globalStage)

    return !!activeMembers[userId]
}

export const getEventCreator = (event: VirtualVenueEvent) => {
    return event.eventData?.creator ?? ''
}
