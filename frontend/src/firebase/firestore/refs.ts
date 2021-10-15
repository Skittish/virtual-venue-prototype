import {firestoreDatabase} from "../client";

export const getFirestoreEventsRef = () => {
    return firestoreDatabase.collection('events')
}

export const getFirestoreEventRef = (eventId: string) => {
    return getFirestoreEventsRef().doc(eventId)
}

export const getBillingAccountsRef = () => {
    return firestoreDatabase.collection('billingAccounts')
}

export const getFirestoreSubscriptionRef = (subscriptionId: string, billingAccountId: string) => {
    return getBillingAccountSubscriptionsRef(billingAccountId).doc(billingAccountId)
}

export const getFirestoreUsersRef = () => {
    return firestoreDatabase.collection('users')
}

export const getFirestoreUserRef = (userId: string) => {
    return getFirestoreUsersRef().doc(userId)
}

export const getBillingAccountRef = (id: string) => {
    return getBillingAccountsRef().doc(id)
}

export const getBillingAccountSubscriptionsRef = (id: string) => {
    return getBillingAccountRef(id).collection('subscriptions')
}

export const getSubscriptionRef = (id: string, billingAccountId: string) => {
    return getBillingAccountSubscriptionsRef(billingAccountId).doc(id)
}

export const getFirestoreEventSubscriptionUsageRef = (eventId: string) => {

    return getFirestoreEventRef(eventId).collection('subscriptionUsage')

}

export const getFirestoreEmailSignupInvitesRef = () => {
    return firestoreDatabase.collection('invites').doc('emailSignUp')
}
