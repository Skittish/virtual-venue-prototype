/* eslint-disable no-void */
import {Reference} from "@firebase/database-types";
import {
    checkIfEventIsDevelopmentEvent,
    generateHifiSpace,
    generateHifiSpaceForEvent,
    generateJWT,
    HifiCapacity,
} from "./hifi";
import {app} from "../app";
import {getEventChannelsRef, getEventRef, getEventRoomRef, getEventRoomsDataRef} from "./refs";
import {generateNewChannel, generateNewEvent, generateNewRoom} from "./generators";
import {VirtualVenueEvent} from "./types";
import {setInitialEventData} from "../firestore/event";
import {isStagingEnv} from "../utils/env";
import {doesUserHaveCreateEventPermission} from "../users/permissions";

export const fetchEvent = (eventId: string): Promise<VirtualVenueEvent> => {
    const ref = getEventRef(eventId)
    return ref.once('value').then(snapshot => snapshot.val())
}

const checkIfEventExists = (ref: Reference) => {

    return ref.once('value').then((snapshot) => {
        return !!snapshot.val()
    })

}

export const createAndStoreNewChannel = async (eventId: string, spaceId: string, channelId?: string, capacity?: string) => {
    const channel = generateNewChannel({
        id: channelId,
        spaceId,
        capacity,
    })

    const ref = getEventChannelsRef(eventId)

    // eslint-disable-next-line no-void
    void ref.update({
        [channel.id]: channel,
    })

    return channel
}

const createEventRoom = async (roomId: string, eventId: string, name: string, spaceId: string, capacity: string) => {
    const channel = await createAndStoreNewChannel(eventId, spaceId)
    const room = generateNewRoom({
        name,
        id: roomId,
        spaceId,
        channelId: channel.id,
        capacity,
    })
    const ref = getEventRoomRef(eventId, room.id)
    // eslint-disable-next-line no-void
    void ref.set(room)
    return room
}

export const createNewEventRoom = async (req: any, res: any) => {
    const {
        eventId,
        name,
    } = req.body as {
        eventId: string,
        name: string,
    }
    // todo - check permissions
    const roomId = getEventRoomsDataRef(eventId).push().key ?? ''
    const {capacity, spaceId} = await generateHifiSpaceForEvent(`${eventId}/${roomId}`, eventId)
    await createEventRoom(roomId, eventId, name, spaceId, capacity)
    res.send({
        roomId,
        spaceId,
    })
}

const getUserRef = (userId: string) => {
    return app.database().ref(`users`).child(userId)
}

const storeCreatedEventWithinUser = (userId: string, eventId: string) => {
    const ref = getUserRef(userId)
    return ref.update({
        [`events/${eventId}`]: true,
    })
}

export const generateEventJwt = async (req: any, res: any) => {

    const {
        spaceId,
        eventId,
    } = req.body as {
        eventId: string,
        spaceId: string,
    }

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    const isDevelopmentEvent = await checkIfEventIsDevelopmentEvent(eventId)

    const jwt = await generateJWT(userId, spaceId, false, isDevelopmentEvent)

    res.send({
        jwt,
    });

}

export const createNewEvent = async (req: any, res: any) => {

    const {
        eventCode,
        name,
        paymentPointer,
        isDevelopmentEvent = isStagingEnv(),
        hifiCapacity = HifiCapacity.regular,
    } = req.body as {
        eventCode: string,
        name: string,
        paymentPointer: string,
        isDevelopmentEvent?: boolean,
        hifiCapacity?: string,
    }

    console.log('createNewEvent')

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    const eventRef = getEventRef(eventCode)

    const hasPermission = await doesUserHaveCreateEventPermission(userId)

    if (!hasPermission) {
        res.status(400).send({
            code: 'insufficient_permissions',
        })
        return
    }

    const alreadyExists = await checkIfEventExists(eventRef as unknown as Reference)

    if (alreadyExists) {
        res.status(400).send({
            code: 'already_exists',
        })
        return
    }

    const spaceId = await generateHifiSpace(eventCode, isDevelopmentEvent, hifiCapacity)

    const event = await generateNewEvent(name, userId, paymentPointer, spaceId, isDevelopmentEvent, hifiCapacity)

    await setInitialEventData(eventCode, userId, name, paymentPointer, spaceId)

    await eventRef.set(event)

    // eslint-disable-next-line no-void
    void storeCreatedEventWithinUser(userId, eventCode)

    res.send({
        eventCode,
    });

}

export const getOnlineUsersInEvent = (event: VirtualVenueEvent) => {

    const {
        users = {},
    } = event

    return Object.entries(users).filter(([, user]) => {
        return !!user.online
    })

}
