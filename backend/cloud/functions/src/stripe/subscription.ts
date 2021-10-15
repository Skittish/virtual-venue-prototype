/* eslint-disable no-void */
import {stripe} from "./stripe";
import {storeSubscriptionInBillingAccount} from "../firestore/billing";
import {Stripe} from "stripe";
import {get} from "lodash";
import {
    getBillingAccountSubscriptionPastRecordsRef,
    getBillingAccountSubscriptionRef,
    getFirestoreEventRef,
} from "../firestore/refs";
import {FirestoreSubscriptionData} from "../firestore/types";
import * as admin from "firebase-admin";
import {fetchFirestoreEvent} from "../firestore/subscriptions";

export const getSubscriptionBillingAccountId = (subscription: Stripe.Subscription) => {
    const {metadata} = subscription

    if (!metadata) {
        throw new Error(`No metadata associated with subscription: ${subscription.id}`)
    }

    const {
        billingAccountId = '',
    } = metadata

    if (!billingAccountId) {
        throw new Error(`No billingAccountId stored with subscription: ${subscription.id}`)
    }

    return billingAccountId
}

export const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {

    console.log('handleSubscriptionCreated', subscription.id)

    const billingAccountId = getSubscriptionBillingAccountId(subscription)

    void storeSubscriptionInBillingAccount(billingAccountId, subscription)

}

export const fetchFirestoreSubscription = async (billingAccountId: string, subscriptionId: string): Promise<FirestoreSubscriptionData> => {

    const subscription = await getBillingAccountSubscriptionRef(billingAccountId, subscriptionId).get().then(response => {
        return response.data()
    })

    if (!subscription) {
        throw new Error(`'No subscription found for '${billingAccountId}':'${subscriptionId}'`)
    }

    return subscription as FirestoreSubscriptionData

}

export const updateEventSubscriptionBillingCycle = async (eventId: string, billingAccountId: string, subscriptionId: string, periodStart: number) => {

    const event = await fetchFirestoreEvent(eventId)
    const subscriptionMatches = (event.connectedSubscription && event.connectedSubscription.subscriptionId === subscriptionId && event.connectedSubscription.billingAccountId === billingAccountId)

    if (!subscriptionMatches) {
        console.warn(`Event connected subscription doesn't match subscription data to update with.`)
        return
    }

    return getFirestoreEventRef(eventId).update({
        ['connectedSubscription/currentPeriodStart']: periodStart,
    })

}

export const handleSubscriptionCycleUpdated = async (subscription: Stripe.Subscription, previousTimestamp: number) => {

    const billingAccountId = getSubscriptionBillingAccountId(subscription)

    const pastRecordsRef = getBillingAccountSubscriptionPastRecordsRef(billingAccountId, subscription.id)

    const pastRecordRef = pastRecordsRef.doc(previousTimestamp.toString())

    const subscriptionData = await fetchFirestoreSubscription(billingAccountId, subscription.id)

    const {
        audioUsage,
    } = subscriptionData

    if (!audioUsage) return

    const {
        events = {},
        processedMinutes = 0,
        failedToProcessMinutes = 0,
    } = audioUsage

    const update: Record<string, any> = {
        ['audioUsage.processedMinutes']: admin.firestore.FieldValue.increment(-processedMinutes),
        ['audioUsage.failedToProcessMinutes']: admin.firestore.FieldValue.increment(-failedToProcessMinutes),
    }

    Object.entries(events).forEach(([eventId, usage]) => {
        update[`audioUsage.events.${eventId}`] = admin.firestore.FieldValue.increment(-usage)
    })

    const ref = getBillingAccountSubscriptionRef(billingAccountId, subscription.id)

    await pastRecordRef.set({
        created: admin.firestore.FieldValue.serverTimestamp(),
        audioUsage,
    }, {
        merge: true,
    })

    const {
        connectedEvents = {},
    } = subscriptionData

    Object.keys(connectedEvents).forEach((eventId) => {
        void updateEventSubscriptionBillingCycle(eventId, billingAccountId, subscription.id, subscription.current_period_start)
    })

    return ref.update(update)

}

export const handleSubscriptionUpdated = async (subscription: Stripe.Subscription, previousData: Partial<Stripe.Subscription>) => {
    console.log('handleSubscriptionUpdated', subscription.id, previousData)

    const billingAccountId = getSubscriptionBillingAccountId(subscription)

    await storeSubscriptionInBillingAccount(billingAccountId, subscription)

    if (previousData.current_period_start && previousData.current_period_start !== subscription.current_period_start) {
        await handleSubscriptionCycleUpdated(subscription, previousData.current_period_start)
    }

}

export const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
    console.log('handleSubscriptionDeleted', subscription.id, subscription.status)

    const billingAccountId = getSubscriptionBillingAccountId(subscription)

    void storeSubscriptionInBillingAccount(billingAccountId, subscription)

}

export const handleCreateStripeSubscription = async (req: any, res: any) => {

    const {
        customerId,
        priceId,
        billingAccountId,
        planCategory,
        paymentMethodId,
    } = req.body as {
        customerId: string,
        priceId: string,
        billingAccountId: string,
        planCategory: string,
        paymentMethodId: string,
    }

    console.log('handleCreateStripeSubscription', customerId, priceId, billingAccountId)

    const subscription = await createStripeSubscription(customerId, priceId, billingAccountId, planCategory, paymentMethodId)

    console.log('subscription finished and returning it?')

    return res.send(subscription)


}

export const createStripeSubscription = async (customerId: string, priceId: string, billingAccountId: string, planCategory: string, paymentMethodId: string) => {

    console.log('createStripeSubscription')

    // Create the subscription. Note we're expanding the Subscription's
    // latest invoice and that invoice's payment_intent
    // so we can pass it to the front end to confirm the payment
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
            price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice', 'latest_invoice.payment_intent'],
        metadata: {
            billingAccountId,
            planCategory,
        },
        off_session: true,
        default_payment_method: paymentMethodId,
    });

    console.log('subscription created?', JSON.stringify(subscription.latest_invoice))

    if (!subscription) {
        throw new Error('No subscription')
    }

    // not sure if this is already covered via the webhooks
    await storeSubscriptionInBillingAccount(billingAccountId, subscription)

    console.log('finished storeSubscriptionInBillingAccount')

    let clientSecret = ''

    if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string' && subscription.latest_invoice.payment_intent && typeof subscription.latest_invoice.payment_intent !== 'string') {
        clientSecret = subscription.latest_invoice.payment_intent.client_secret ?? ''
    }

    return {
        subscriptionId: subscription.id,
        clientSecret,
    }
}

export const fetchCustomerSubscriptions = (customerId: string) => {

    return stripe.subscriptions.list({
        customer: customerId,
    })

}

export const handleFetchCustomerSubscriptions = async (req: any, res: any) => {

    const {
        customerId,
    } = req.body as {
        customerId: string,
    }


    const subscriptions = await fetchCustomerSubscriptions(customerId)

    return res.send(subscriptions)

}

export const cancelSubscription = (subscriptionId: string) => {

    return stripe.subscriptions.update(subscriptionId, {cancel_at_period_end: true});

}

export const handleCancelSubscription = async (req: any, res: any) => {

    const {
        subscriptionId,
    } = req.body as {
        subscriptionId: string,
    }

    const response = await cancelSubscription(subscriptionId)

    return res.send(response)

}

export const undoCancelSubscription = (subscriptionId: string) => {

    return stripe.subscriptions.update(subscriptionId, {cancel_at_period_end: false});

}

export const handleUndoCancelSubscription = async (req: any, res: any) => {

    const {
        subscriptionId,
    } = req.body as {
        subscriptionId: string,
    }

    const response = await undoCancelSubscription(subscriptionId)

    return res.send(response)

}

export const fetchSubscription = (subscriptionId: string) => {

    return stripe.subscriptions.retrieve(subscriptionId)

}

export const handleFetchSubscription = async (req: any, res: any) => {

    const {
        subscriptionId,
    } = req.body as {
        subscriptionId: string,
    }

    const response = await fetchSubscription(subscriptionId)

    if (response.metadata && response.metadata.billingAccountId) {
        void storeSubscriptionInBillingAccount(response.metadata.billingAccountId, response)
    }

    return res.send(response)

}

export const fetchSubscriptionInvoices = (customerId: string, subscriptionId: string) => {

    return stripe.invoices.retrieveUpcoming({
        customer: customerId,
        subscription: subscriptionId,
    })

}

export const handleFetchSubscriptionInvoices = async (req: any, res: any) => {

    const {
        customerId,
        subscriptionId,
    } = req.body as {
        customerId: string,
        subscriptionId: string,
    }

    const response = await fetchSubscriptionInvoices(customerId, subscriptionId)

    return res.send(response)

}

export const updateSubscriptionPaymentMethod = (subscriptionId: string, paymentMethodId: string) => {

    return stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId,
    })

}

export const handleUpdateSubscriptionPaymentMethod = async (req: any, res: any) => {

    const {
        paymentMethodId,
        subscriptionId,
    } = req.body as {
        paymentMethodId: string,
        subscriptionId: string,
    }

    const response = await updateSubscriptionPaymentMethod(subscriptionId, paymentMethodId)

    return res.send(response)

}

export const createSubscriptionUsageRecord = async (subscriptionId: string, quantity: number) => {

    const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionItemId = get(subscriptionData, 'items.data[0].id', '')

    if (!subscriptionItemId) {
        throw new Error(`No subscription item found for subscription '${subscriptionId}'`)
    }

    return stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
            quantity: quantity,
            timestamp: Math.floor(Date.now() / 1000),
            action: 'increment',
        }
    );
}
