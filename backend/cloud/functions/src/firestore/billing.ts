import {getBillingAccountsRef, getBillingAccountSubscriptionsCollectionRef} from "./refs";
import {addBillingAccountToUser} from "./users";
import {Stripe} from "stripe";
import * as admin from "firebase-admin";
import {FirestoreBillingAccountData, FirestoreSubscriptionData} from "./types";

export const fetchBillingAccounts = (): Promise<Record<string, FirestoreBillingAccountData>> => {

    const ref = getBillingAccountsRef()
    return ref.get().then(snapshot => {
        const accounts: Record<string, FirestoreBillingAccountData> = {}
        snapshot.docs.forEach(doc => {
            accounts[doc.id] = doc.data() as FirestoreBillingAccountData
        })
        return accounts
    })

}

export const fetchBillingAccountSubscriptions = (billingAccountId: string): Promise<Record<string, FirestoreSubscriptionData>> => {

    const ref = getBillingAccountSubscriptionsCollectionRef(billingAccountId)

    return ref.get().then(snapshot => {
        const subscriptions: Record<string, FirestoreSubscriptionData> = {}
        snapshot.docs.forEach(doc => {
            subscriptions[doc.id] = doc.data() as FirestoreSubscriptionData
        })
        return subscriptions
    })

}

export const createFirestoreBillingAccount = async (stripeCustomerId: string, creatorId: string, accountName: string) => {

    const ref = getBillingAccountsRef()

    const billingAccount = await ref.add({
        stripeCustomerId,
        creatorId,
        accountName,
        created: admin.firestore.FieldValue.serverTimestamp(),
    })

    await addBillingAccountToUser(creatorId, billingAccount.id)

    return billingAccount

}

export const storeSubscriptionInBillingAccount = async (billingAccountId: string, subscription: Stripe.Subscription) => {

    const ref = getBillingAccountSubscriptionsCollectionRef(billingAccountId)

    const {
        customer,
        id,
        current_period_start,
        days_until_due,
        status,
        items,
        current_period_end,
        cancel_at_period_end,
        canceled_at,
        start_date,
        default_payment_method,
        metadata = {},
    } = subscription

    const products: string[] = []

    items.data.forEach((item) => {
        if (item.plan.product) {
            products.push(item.plan.product as string)
        }
    })

    return ref.doc(subscription.id).set({
        customer,
        id,
        current_period_start,
        days_until_due,
        status,
        products,
        current_period_end,
        cancel_at_period_end,
        canceled_at,
        start_date,
        default_payment_method,
        metadata,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, {
        merge: true,
    })

}
