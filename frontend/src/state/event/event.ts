import {proxy, ref, useProxy} from "valtio";
import {useCurrentRoom} from "./rooms";
import {getCurrentUserId, useCurrentUserId} from "../auth";
import {useCurrentUser} from "./users";
import {useEffect, useState} from "react";
import {setMicMuted} from "../audio";
import {EventData} from "../../firebase/types";
import {getEventUserRoleRef} from "../../firebase/refs";

type State = {
    joined: boolean,
    eventId: string,
    eventInitialData: EventData | null,
}

export const eventState = proxy<State>({
    joined: false,
    eventId: '',
    eventInitialData: null,
})

export const useEventInitialData = () => {
    return useProxy(eventState).eventInitialData
}

export const useIsEventCreator = () => {
    const eventData = useEventInitialData()
    const currentUserId = useCurrentUserId()
    return eventData?.eventData?.creator === currentUserId
}

export const useEventHifiSpaceId = () => {
    const eventData = useEventInitialData()
    const currentRoom = useCurrentRoom()
    if (currentRoom && currentRoom.hifi) {
        return currentRoom.hifi.spaceId
    }
    return eventData?.eventData?.hifi?.spaceId ?? ''
}

export const useEventHasLoaded = () => {
    const eventInitialData = useProxy(eventState).eventInitialData
    return !!eventInitialData
}

export const setJoined = (joined: boolean = true) => {
    eventState.joined = joined
}

export const setEventInitialData = (data: EventData) => {
    eventState.eventInitialData = ref(data) as EventData
}

export const useHasJoined = () => {
    return useProxy(eventState).joined
}

export const getEventId = () => {
    return eventState.eventId
}

export const setEventId = (eventId: string) => {
    eventState.eventId = eventId
}

export const useEventStoreEventId = (): string => {
    return useProxy(eventState).eventId
}

export const useIsUserBanned = () => {
    const user = useCurrentUser()
    return user.banned ?? false
}

export const useIsUserOnline = () => {
    const user = useCurrentUser()
    return user.online ?? true
}

export const useUserStatusListener = () => {

    const user = useCurrentUser()
    const locallyJoined = useHasJoined()
    const [hasJoined, setHasJoined] = useState(locallyJoined)
    const joined = user.joined ?? false
    const banned = user.banned ?? false
    const muted = user.forceMuted ?? false

    useEffect(() => {
        setHasJoined(locallyJoined)
    }, [locallyJoined])

    useEffect(() => {
        if (!hasJoined) return
        setJoined(joined)
    }, [hasJoined, joined])

    useEffect(() => {
        if (muted) {
            console.log('set muted to true')
            setMicMuted(true)
        }
    }, [muted])

}
