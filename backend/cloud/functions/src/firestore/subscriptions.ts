/* eslint-disable no-void */
import {stripe} from "../stripe/stripe";
import {getBillingAccountSubscriptionRef, getFirestoreEventRef} from "./refs";
import * as admin from "firebase-admin";
import {FirestoreEventData} from "./types";
import {ensureUserIsEventAdmin} from "./security";
import {upgradeEventHifiSpaceCapacities} from "./event";
import {convertEventHifiSpaceSizes} from "../events/channels";
import {HifiCapacity} from "../events/hifi";

export const fetchFirestoreEvent = async (eventId: string): Promise<FirestoreEventData> => {

    const ref = getFirestoreEventRef(eventId)

    return ref.get().then(snapshot => snapshot.data() as FirestoreEventData)

}

export const removeEventFromSubscription = async (eventId: string, removeFromEvent: boolean = false) => {

    const event = await fetchFirestoreEvent(eventId)

    await convertEventHifiSpaceSizes(eventId, HifiCapacity.regular)

    if (removeFromEvent) {
        const ref = getFirestoreEventRef(eventId)
        await ref.update({
            connectedSubscription: admin.firestore.FieldValue.delete(),
        })
    }

    if (event.connectedSubscription) {

        const subscriptionRef = getBillingAccountSubscriptionRef(event.connectedSubscription.billingAccountId, event.connectedSubscription.subscriptionId)

        return subscriptionRef.update({
            [`connectedEvents.${eventId}`]: admin.firestore.FieldValue.delete(),
        })

    }

    return Promise.resolve()

}

export const handleDisconnectEventFromSubscription = async (req: any, res: any) => {

    const {
        eventId,
    } = req.body as {
        eventId: string,
    }

    return ensureUserIsEventAdmin(eventId, req, res, async () => {
        await removeEventFromSubscription(eventId, true)
        return res.send({})
    })


}

export const fetchStripeSubscription = async (subscriptionId: string) => {

    return stripe.subscriptions.retrieve(subscriptionId)

}

export const addEventToSubscription = async (subscriptionId: string, billingAccountId: string, eventId: string) => {

    const stripeSubscription = await fetchStripeSubscription(subscriptionId)

    if (!stripeSubscription) {
        throw new Error(`No stripe subscription found for ${subscriptionId}`)
    }

    const ref = getFirestoreEventRef(eventId)

    await removeEventFromSubscription(eventId)

    await upgradeEventHifiSpaceCapacities(eventId)

    await ref.update({
        connectedSubscription: {
            subscriptionId,
            billingAccountId,
            currentPeriodStart: stripeSubscription.current_period_start,
        },
    })

    const subscriptionRef = getBillingAccountSubscriptionRef(billingAccountId, subscriptionId)

    return subscriptionRef.update({
        [`connectedEvents.${eventId}`]: {
            connected: admin.firestore.FieldValue.serverTimestamp(),
        },
    })


}

export const handleAddEventToSubscription = async (req: any, res: any) => {

    const {
        eventId,
        billingAccountId,
        subscriptionId,
    } = req.body as {
        eventId: string,
        billingAccountId: string,
        subscriptionId: string,
    }

    return ensureUserIsEventAdmin(eventId, req, res, async () => {
        await addEventToSubscription(subscriptionId, billingAccountId, eventId)
        return res.send({})
    })

}
