import {app} from "../app";
import {FirestoreUserData} from "./types";
import {firestore} from "firebase-admin/lib/firestore";
import DocumentReference = firestore.DocumentReference;

export const getFirestoreUsersRef = () => {
    return app.firestore().collection('users')
}

export const getFirestoreUserRef = (userId: string): DocumentReference<FirestoreUserData> => {
    return getFirestoreUsersRef().doc(userId)
}

export const getFirestoreRoomTemplatesRef = () => {
    return app.firestore().collection('roomTemplates')
}

export const getFirestoreRoomTemplateRef = (id: string) => {
    return getFirestoreRoomTemplatesRef().doc(id)
}

export const getBillingAccountsRef = () => {
    return app.firestore().collection('billingAccounts')
}

export const getBillingAccountRef = (id: string) => {
    return getBillingAccountsRef().doc(id)
}

export const getBillingAccountSubscriptionsCollectionRef = (id: string) => {
    return getBillingAccountsRef().doc(id).collection('subscriptions')
}

export const getBillingAccountSubscriptionRef = (billingAccountId: string, subscriptionId: string) => {
    return getBillingAccountSubscriptionsCollectionRef(billingAccountId).doc(subscriptionId)
}

export const getBillingAccountSubscriptionPastRecordsRef = (billingAccountId: string, subscriptionId: string) => {
    return getBillingAccountSubscriptionsCollectionRef(billingAccountId).doc(subscriptionId).collection('pastRecords')
}

export const getPendingRawEventsRef = () => {
    return app.firestore().collection('pendingRawEventsData')
}

export const getProcessedRawEventsRef = () => {
    return app.firestore().collection('processedRawEventsData')
}

export const getProcessedRawEventsDayRef = (dayId: string) => {
    return getProcessedRawEventsRef().doc(dayId)
}

export const getEventsDataRef = () => {
    return app.firestore().collection('eventsData').doc('main')
}

export const getPendingRawEventsDayRef = (dayId: string) => {
    return getPendingRawEventsRef().doc(dayId)
}

export const getFirestoreEventsRef = () => {
    return app.firestore().collection('events')
}

export const getFirestoreEventRef = (eventId: string) => {
    return app.firestore().collection('events').doc(eventId)
}

export const getFirestoreEventSubscriptionUsageRef = (eventId: string) => {

    return getFirestoreEventRef(eventId).collection('subscriptionUsage')

}

export const getFirestoreInvitesRef = () => {
    return app.firestore().collection('invites')
}

export const getFirestoreEmailSignupInvitesRef = () => {
    return getFirestoreInvitesRef().doc('emailSignUp')
}


export const getSiteAdminDataRef = () => {
    return app.firestore().collection('siteAdminData').doc('default')
}
