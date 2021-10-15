export type EventChannel = {
    id: string
    hifi: {
        spaceId: string
    }
    capacity: number
    activeMembers?: Record<string, number>
    queuedMembers?: Record<string, number>
    users?: Record<string, {
        connected: boolean,
    }>
}

export const isUserInsideChannel = (channel: EventChannel, userId: string): boolean => {
    const {
        activeMembers = {}
    } = channel
    return !!activeMembers[userId]
}
