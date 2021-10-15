import {getEventRef} from "./refs";
import {auth} from "./authentication";
import yn from "yn";
import {HifiCapacity} from "./types";
import {Stripe} from "stripe";
import {isProductionEnvironment} from "../utils/env";

export const checkIfEventExists = (eventCode: string) => {

    const ref = getEventRef(eventCode)

    return ref.once('value').then((snapshot) => {
        return !!snapshot.val()
    })

}

const PRD_CLOUD_FUNCTIONS_URL = ''
const STG_CLOUD_FUNCTIONS_URL = ''
const ENV_CLOUD_FUNCTIONS_URL = isProductionEnvironment() ? PRD_CLOUD_FUNCTIONS_URL : STG_CLOUD_FUNCTIONS_URL

const STG_LOCAL_CLOUD_FUNCTIONS_URL = ''
const PRD_LOCAL_CLOUD_FUNCTIONS_URL = ''
const ENV_LOCAL_CLOUD_FUNCTIONS_URL = isProductionEnvironment() ? PRD_LOCAL_CLOUD_FUNCTIONS_URL : STG_LOCAL_CLOUD_FUNCTIONS_URL

const LOCAL_CLOUD_FUNCTIONS_URL = yn(process.env.REACT_APP_LOCAL) ? ENV_LOCAL_CLOUD_FUNCTIONS_URL : ENV_CLOUD_FUNCTIONS_URL

// const CLOUD_FUNCTIONS_URL = LOCAL_CLOUD_FUNCTIONS_URL
const CLOUD_FUNCTIONS_URL = ENV_CLOUD_FUNCTIONS_URL

const cloudRequest = async (path: string, body: any) => {
    const url = `${CLOUD_FUNCTIONS_URL}/app/${path}`
    const token: string =
        await auth.currentUser?.getIdToken() ?? '';

    return fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body)
    })
        .then(async response => {
            if (!response.ok) {
                try {
                    const error = await response.json()
                    return Promise.reject(error)
                } catch (error) {
                    return Promise.reject(response.statusText)
                }
            }
            return response.json()
        })
}

export const getEventHifiJwt = async (eventId: string, spaceId: string) => {

    return cloudRequest('getJwt', {
        eventId,
        spaceId,
    })

}

export const createNewEvent = async (eventCode: string, name: string, paymentPointer: string, hifiCapacity: HifiCapacity) => {

    return cloudRequest('createEvent', {
        eventCode,
        name,
        paymentPointer,
        // isDevelopmentEvent,
        hifiCapacity,
    })

}

export const createNewEventRoom = async (eventId: string, name: string) => {

    return cloudRequest('createEventRoom', {
        eventId,
        name,
    })

}

export const joinChannel = async (eventId: string, channelId: string) => {

    return cloudRequest('joinChannel', {
        eventId,
        channelId,
    })

}

export const leaveChannel = async (eventId: string, channelId: string) => {

    return cloudRequest('leaveChannel', {
        eventId,
        channelId,
    })

}

export const channelMembersTrigger = async (eventId: string, channelId: string) => {

    return cloudRequest('channelMembersTrigger', {
        eventId,
        channelId,
    })

}

export const userOfflineTrigger = async (eventId: string, userId: string) => {

    return cloudRequest('userOfflineTrigger', {
        eventId,
        userId,
    })

}

export const createNewChannel = async (eventId: string) => {

    return cloudRequest('createNewChannel', {
        eventId,
    })

}

export const joinGlobalChannel = async (eventId: string) => {

    return cloudRequest('joinGlobalChannel', {
        eventId,
    })

}

export const leaveGlobalChannel = async (eventId: string) => {

    return cloudRequest('leaveGlobalChannel', {
        eventId,
    })

}

export const joinGlobalStage = async (eventId: string) => {

    return cloudRequest('enterGlobalStage', {
        eventId,
    })

}

export const leaveGlobalStage = async (eventId: string) => {

    return cloudRequest('leaveGlobalStage', {
        eventId,
    })

}

export const setEventPassword = async (eventId: string, password: string) => {

    return cloudRequest('setEventPassword', {
        eventId,
        password,
    })

}

export const joinEvent = async (eventId: string, password?: string) => {

    return cloudRequest('joinEvent', {
        eventId,
        password,
    })

}

export const updateEventHifiCapacity = async (eventId: string, hifiCapacity: HifiCapacity) => {

    return cloudRequest('convertEventHifiSpaceSizes', {
        eventId,
        hifiCapacity,
    })

}

export const createNewBillingAccount = async (accountName: string): Promise<{
    billingAccountId: string,
}> => {

    return cloudRequest('createUserStripeCustomerAndStoreIt', {
        accountName,
    })

}

type Data = {
    paymentMethods: {
        data: Array<any>,
    },
}

export const getCustomerPaymentMethods = async (customerId: string): Promise<Array<any>> => {

    console.log('getCustomerPaymentMethods', customerId)

    return cloudRequest('getCustomerPaymentMethods', {
        customerId,
    }).then(response => {
        console.log('response', response)
        return (response as Data).paymentMethods.data
    })

}


export const createStripeSubscription = async (
    customerId: string,
    priceId: string,
    billingAccountId: string,
    planCategory: string,
    paymentMethodId: string,
): Promise<{
    subscriptionId: string,
    clientSecret: string,
}> => {

    console.log('createStripeSubscription', customerId, priceId, billingAccountId, planCategory)

    return cloudRequest('createStripeSubscription', {
        customerId,
        priceId,
        billingAccountId,
        planCategory,
        paymentMethodId,
    })

}

export const createCustomerSetupIntent = async (customerId: string): Promise<Stripe.SetupIntent> => {

    console.log('createCustomerSetupIntent', customerId)

    return cloudRequest('createCustomerSetupIntent', {
        customerId,
    })

}

export const setCustomerDefaultPaymentMethod = async (customerId: string, paymentMethodId: string): Promise<Stripe.SetupIntent> => {

    console.log('setCustomerDefaultPaymentMethod', customerId)

    return cloudRequest('setCustomerDefaultPaymentMethod', {
        customerId,
    })

}

export const fetchCustomerSubscriptions = async (customerId: string): Promise<Stripe.ApiListPromise<Stripe.Subscription>> => {

    console.log('fetchCustomerSubscriptions', customerId)

    return cloudRequest('fetchCustomerSubscriptions', {
        customerId,
    })

}

export const detachPaymentMethod = async (paymentMethodId: string): Promise<Stripe.Response<Stripe.PaymentMethod>> => {

    console.log('detachPaymentMethod', paymentMethodId)

    return cloudRequest('detachPaymentMethod', {
        paymentMethodId,
    })

}

export const cancelSubscription = async (subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>> => {

    console.log('cancelSubscription', subscriptionId)

    return cloudRequest('cancelSubscription', {
        subscriptionId,
    })

}

export const undoCancelSubscription = async (subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>> => {

    console.log('undoCancelSubscription', subscriptionId)

    return cloudRequest('undoCancelSubscription', {
        subscriptionId,
    })

}

export const fetchSubscription = async (subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>> => {

    console.log('fetchSubscription', subscriptionId)

    return cloudRequest('fetchSubscription', {
        subscriptionId,
    })

}

export const fetchSubscriptionInvoices = async (customerId: string, subscriptionId: string): Promise<Stripe.Response<Stripe.Invoice>> => {

    console.log('fetchSubscriptionInvoices', subscriptionId)

    return cloudRequest('fetchSubscriptionInvoices', {
        customerId,
        subscriptionId,
    })

}

export const updateSubscriptionPaymentMethod = async (subscriptionId: string, paymentMethodId: string): Promise<Stripe.Response<Stripe.Subscription>> => {

    console.log('updateSubscriptionPaymentMethod', subscriptionId, paymentMethodId)

    return cloudRequest('updateSubscriptionPaymentMethod', {
        paymentMethodId,
        subscriptionId,
    })

}

export const addEventToSubscription = async (subscriptionId: string, billingAccountId: string, eventId: string): Promise<any> => {

    return cloudRequest('addEventToSubscription', {
        eventId,
        subscriptionId,
        billingAccountId,
    })

}

export const disconnectEventFromSubscription = async (eventId: string): Promise<any> => {

    return cloudRequest('disconnectEventFromSubscription', {
        eventId,
    })

}

export const generateEmailInvitationCodes = async (emails: string[]): Promise<any> => {

    return cloudRequest('generateEmailInvitationCodes', {
        emails,
    })

}

export const deleteInvitation = async (inviteCode: string): Promise<any> => {

    return cloudRequest('deleteInvitation', {
        inviteCode,
    })

}

export const sendInvitation = async (inviteCode: string): Promise<any> => {

    return cloudRequest('sendInvitation', {
        inviteCode,
    })

}

export const sendAllPendingInvites = async (): Promise<any> => {

    return cloudRequest('sendAllPendingInvites', {})

}

export const redeemInvitationCode = async (inviteCode: string): Promise<{
    success: boolean,
    reason?: string,
}> => {

    return cloudRequest('redeemInvitationCode', {
        inviteCode,
    })

}

export const saveEventRoomSceneryAsTemplate = async (eventId: string, roomId: string): Promise<any> => {

    return cloudRequest('saveEventRoomSceneryAsTemplate', {
        eventId,
        roomId,
    })

}
