import {getFirestoreEventRef, getFirestoreEventsRef, getFirestoreRoomTemplateRef} from "./refs";
import {firestore} from "firebase-admin/lib/firestore";
import {get} from 'lodash'
import {DEFAULT_CAPACITY, DEFAULT_EVENT_QUOTA_CAPACITY} from "../events/quotaCapacity";
import {FirestoreEventData, RoomTemplate} from "./types";
import {convertEventHifiSpaceSizes} from "../events/channels";
import {HifiCapacity} from "../events/hifi";
import {fetchSiteAdminData, isUserVirtualVenueAdmin} from "../events/admin";
import {getEventRoomSceneryRef} from "../events/refs";

export const storeSpaceInEventFirestore = (eventId: string, spaceId: string) => {
    const ref = getFirestoreEventRef(eventId)
    return ref.set({
        spaces: firestore.FieldValue.arrayUnion(spaceId),
    }, {
        merge: true,
    })
}

export const setEventQuotaCapacity = (eventId: string, capacity: string) => {
    const ref = getFirestoreEventRef(eventId)
    return ref.set({
        quotaCapacity: capacity,
    }, {
        merge: true,
    })
}

export const updateEventData = (eventId: string, update: Partial<FirestoreEventData>) => {
    const ref = getFirestoreEventRef(eventId)
    return ref.set(update, {
        merge: true,
    })
}

export const fetchFirestoreEvents = (): Promise<Record<string, FirestoreEventData>> => {
    const ref = getFirestoreEventsRef()
    return ref.get().then(snapshot => {
        const events: Record<string, FirestoreEventData> = {}
        snapshot.docs.forEach(doc => {
            events[doc.id] = doc.data() as FirestoreEventData
        })
        return events
    })
}

export const setInitialEventData = (eventId: string, creatorId: string, name: string, paymentPointer: string, spaceId: string) => {
    const ref = getFirestoreEventRef(eventId)
    return ref.set({
        creatorId,
        quotaCapacity: DEFAULT_EVENT_QUOTA_CAPACITY,
        name,
        paymentPointer,
        spaces: firestore.FieldValue.arrayUnion(spaceId),
    }, {
        merge: true,
    })
}

export const setEventFreeAudioDisabled = (eventId: string) => {

    const ref = getFirestoreEventRef(eventId)
    return ref.update({
        ['audioUsage.freeAudioDisabled']: true,
    })

}

export const isFreeTierEvent = (event: FirestoreEventData): boolean => {

    const {
        connectedSubscription,
    } = event

    return !connectedSubscription

}

export const getDoesEventHaveUnlimitedCapacity = (event: FirestoreEventData) => {

    return get(event, 'audioUsage.unlimitedCapacity', false)

}

export const upgradeEventHifiSpaceCapacities = async (eventId: string) => {

    return convertEventHifiSpaceSizes(eventId, HifiCapacity.extraLarge)

}

export const saveEventRoomSceneryAsTemplate = async (eventId: string, roomId: string) =>{

    const sceneryRef = getEventRoomSceneryRef(eventId, roomId)

    const scenery = await sceneryRef.get().then(snapshot => snapshot.val() ?? {})

    const templatePath = `${eventId}_${roomId}`

    const templateRef = getFirestoreRoomTemplateRef(templatePath)

    return templateRef.set({
        scenery,
        sceneryHistory: firestore.FieldValue.arrayUnion(scenery),
    }, {
        merge: true,
    })

}

export const handleSaveEventRoomSceneryAsTemplate = async (req: any, res: any) =>{

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    const {
        eventId,
        roomId,
    } = req.body as {
        eventId: string,
        roomId: string,
    }

    const isAdmin = await isUserVirtualVenueAdmin(userId)

    if (!isAdmin) {
        return res.status(403).send({
            code: 'admin_only',
        })
    }

    await saveEventRoomSceneryAsTemplate(eventId, roomId)

    return res.send({
        success: true,
    })

}

export const fetchDefaultEventRoomTemplate = async () => {

    const siteAdminData = await fetchSiteAdminData()

    const {
        defaultEventRoomTemplate,
    } = siteAdminData

    if (!defaultEventRoomTemplate) {
        return {}
    }

    const ref = getFirestoreRoomTemplateRef(defaultEventRoomTemplate)

    const template = await ref.get().then(snapshot => snapshot.data() as unknown as RoomTemplate | undefined)

    if (!template) {
        return {}
    }

    return template.scenery

}

export const getEventFreeMinutes = (event: FirestoreEventData) => {

    const bonusFreeMinutes = get(event, 'audioUsage.bonusFreeMinutes', 0)

    return DEFAULT_CAPACITY + bonusFreeMinutes
}
