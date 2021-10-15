import fetch from "node-fetch";
import {
    getEventAccessSettingsRef, getEventCreatorRef, getEventUserRef,
    getSecureEventDataApprovedAccessRef, getSecureEventDataGoogleSheetIdRef,
    getSecureEventDataPasswordRef,
    getSecureEventDataUsersWithAccessRef,
} from "./refs";
import {generateEventAccessSettings} from "./generators";
import {EventAccessSettings, EventAccessType, EventApprovedAccess} from "./types";
import {app, TIMESTAMP} from "../app";
import {isEmailApprovedInSheet} from "./googleSheets";
import {fetchFirestoreEvent} from "../firestore/subscriptions";
import {fetchEvent, getOnlineUsersInEvent} from "./events";
import {getDoesEventHaveUnlimitedCapacity, isFreeTierEvent} from "../firestore/event";


const fetchEventAccessSettings = (eventId: string): Promise<EventAccessSettings> => {
    const ref = getEventAccessSettingsRef(eventId)
    return ref.once('value').then(snapshot => snapshot.val() ?? generateEventAccessSettings())
}

const isEventPublic = (accessSettings: EventAccessSettings): boolean => {
    return accessSettings.type === EventAccessType.PUBLIC
}

const isEventInviteOnly = (accessSettings: EventAccessSettings): boolean => {
    return accessSettings.type === EventAccessType.INVITE
}

const isEventPasswordProtected = (accessSettings: EventAccessSettings): boolean => {
    return accessSettings.type === EventAccessType.PASSWORD
}

const fetchEventPassword = async (eventId: string) => {
    const ref = getSecureEventDataPasswordRef(eventId)
    return ref.once('value').then(snapshot => snapshot.val() ?? "")
}

const isProvidedEventPasswordCorrect = async (eventId: string, providedPassword: string): Promise<boolean> => {
    const eventPassword = await fetchEventPassword(eventId)
    return eventPassword === providedPassword
}

const grantUserAccessToEvent = async (eventId: string, userId: string) => {

    const ref = getSecureEventDataUsersWithAccessRef(eventId)

    return ref.update({
        [userId]: TIMESTAMP,
    })

}

const returnResponseIncorrectPassword = (res: any) => {
    res.status(400).send({
        accessGranted: false,
        code: 'incorrect_password',
    })
}

const returnResponseEventPasswordRequired = (res: any) => {
    res.status(400).send({
        accessGranted: false,
        code: 'password_required',
    })
}

const returnResponseUserNotInvited = (res: any) => {
    res.status(400).send({
        accessGranted: false,
        code: 'not_invited',
    })
}

const returnResponseEventCapacityReached = (res: any) => {
    res.status(400).send({
        accessGranted: false,
        code: 'event_capacity_reached',
    })
}

const returnResponseUserAccessGranted = (res: any) => {
    res.send({
        accessGranted: true,
    })
}

const fetchEventApprovedUsers = async (eventId: string): Promise<EventApprovedAccess> => {
    const ref = getSecureEventDataApprovedAccessRef(eventId)
    return ref.once('value').then(snapshot => snapshot.val() ?? {})
}

export const fetchUserEmail = async (userId: string): Promise<string> => {
    return app.auth().getUser(userId)
        .then((user) => {
            return user.email ?? ''
        })
}

const fetchEventLinkedGoogleSheet = async (eventId: string) => {
    const ref = getSecureEventDataGoogleSheetIdRef(eventId)
    return ref.once('value').then(snapshot => snapshot.val() ?? '')
}

const hasUserBeenInvitedToEvent = async (eventId: string, userId: string): Promise<boolean> => {
    const approvedUsers = await fetchEventApprovedUsers(eventId)
    const userEmail = await fetchUserEmail(userId)
    let isApproved = false
    Object.values(approvedUsers).forEach(email => {
        if (userEmail === email) {
            isApproved = true
        }
    })

    if (!isApproved) {
        const googleSheetId = await fetchEventLinkedGoogleSheet(eventId)
        if (googleSheetId) {
            return isEmailApprovedInSheet(userEmail, googleSheetId)
        }
    }

    return isApproved
}

// todo
// update firebase rules to ensure only users already inside of the event can read / write

export const handleJoinEvent = async (req: any, res: any) => {

    const {
        eventId,
        password,
    } = req.body as {
        eventId: string,
        password?: string,
    }

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    return joinEvent(res, eventId, userId, password)

}

const fetchEventCreator = async (eventId: string) => {
    const ref = getEventCreatorRef(eventId)
    return ref.once('value').then(snapshot => snapshot.val() ?? '')
}

const checkIfUserIsEventCreator = async (eventId: string, userId: string) => {
    const eventCreator = await fetchEventCreator(eventId)
    return eventCreator === userId
}

const fetchEventUser = async (eventId: string, userId: string) => {
    const ref = getEventUserRef(eventId, userId)
    return ref.once('value').then(snapshot => snapshot.val() ?? null)
}

enum UserRoles {
    admin = 'admin',
}

const checkIfUserIsEventAdmin = async (eventId: string, userId: string) => {
    const user = await fetchEventUser(eventId, userId)
    if (!user) return false
    const {userRole = ''} = user
    return userRole === UserRoles.admin
}

const checkIfUserAlreadyHasAccess = async (eventId: string, userId: string) => {
    const ref = getSecureEventDataUsersWithAccessRef(eventId).child(userId)
    return ref.once('value').then(snapshot => {
        const data = snapshot.val()
        return !!data
    })
}

const checkIfEventHasRoom = async (eventId: string) => {

    const firestoreEventPromise = fetchFirestoreEvent(eventId)
    const realtimeEventPromise = fetchEvent(eventId)

    const firestoreEvent = await firestoreEventPromise
    const realtimeEvent = await realtimeEventPromise

    if (!firestoreEvent) {
        throw new Error(`No firestore event found for ${eventId}`)
    }

    if (!realtimeEvent) {
        throw new Error(`No realtime event found for ${eventId}`)
    }

    const isFree = isFreeTierEvent(firestoreEvent)


    if (isFree) {

        const eventHasUnlimitedCapacity = getDoesEventHaveUnlimitedCapacity(firestoreEvent)

        if (!eventHasUnlimitedCapacity) {

            const numberOfOnlineUsers = getOnlineUsersInEvent(realtimeEvent).length

            if (numberOfOnlineUsers >= 25) {
                return false
            }

        }

    }

    return true

}

export const joinEvent = async (res: any, eventId: string, userId: string, eventPassword?: string) => {

    const accessSettings = await fetchEventAccessSettings(eventId)

    const isCreator = await checkIfUserIsEventCreator(eventId, userId)

    if (isCreator) {
        await grantUserAccessToEvent(eventId, userId)
        return returnResponseUserAccessGranted(res)
    }

    const isAdmin = await checkIfUserIsEventAdmin(eventId, userId)

    if (isAdmin) {
        await grantUserAccessToEvent(eventId, userId)
        return returnResponseUserAccessGranted(res)
    }

    const hasRoom = await checkIfEventHasRoom(eventId)

    if (!hasRoom) {
        return returnResponseEventCapacityReached(res)
    }

    const alreadyHasAccess = await checkIfUserAlreadyHasAccess(eventId, userId)

    if (alreadyHasAccess) {
        return returnResponseUserAccessGranted(res)
    }

    if (isEventPasswordProtected(accessSettings)) {
        if (eventPassword) {
            const isCorrect = await isProvidedEventPasswordCorrect(eventId, eventPassword)
            if (isCorrect) {
                await grantUserAccessToEvent(eventId, userId)
                return returnResponseUserAccessGranted(res)
            } else {
                return returnResponseIncorrectPassword(res)
            }
        }
        return returnResponseEventPasswordRequired(res)
    }

    if (isEventInviteOnly(accessSettings)) {
        const hasBeenInvited = await hasUserBeenInvitedToEvent(eventId, userId)
        if (hasBeenInvited) {
            await grantUserAccessToEvent(eventId, userId)
            return returnResponseUserAccessGranted(res)
        } else {
            return returnResponseUserNotInvited(res)
        }
    }

    if (isEventPublic(accessSettings)) {
        await grantUserAccessToEvent(eventId, userId)
        return returnResponseUserAccessGranted(res)
    }

    // shouldn't reach this point

}

export const handleSetEventPassword = async (req: any, res: any) => {

    const {
        eventId,
        password,
    } = req.body as {
        eventId: string,
        password: string,
    }

    // const {
    //     user_id: userId,
    // } = req.user as {
    //     user_id: string,
    // }

    await setEventPassword(eventId, password)

    res.send({})

}

export const setEventPassword = async (eventId: string, password: string) => {

    // todo - check permissions

    const ref = getSecureEventDataPasswordRef(eventId)
    return ref.set(password)
}
