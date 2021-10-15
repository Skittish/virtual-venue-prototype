import Stripe from "stripe";

export type FirestoreBillingAccountData = {
    accountName?: string,
    creatorId: string,
    stripeCustomerId: string,
}

export type FirestoreEventData = {
    creatorId: string,
    hifiUsage?: Record<string, number>,
    lastProcessed?: number,
    processCount?: number,
    quotaCapacity?: string,
    spaces?: string[],
    connectedSubscription?: {
        billingAccountId: string,
        subscriptionId: string,
        currentPeriodStart?: number,
    },
    audioUsage?: {
        bonusFreeMinutes?: number,
        ignoreTrialLimit?: boolean,
        unlimitedCapacity: boolean,
        freeAudioDisabled?: boolean,
        currentTotal?: number,
        lastUpdated?: any,
        noSubscriptionUsageTotal?: number,
        overallTotal?: number,
        perDay?: Record<string, number>,
    }
}

export type FirestoreEventSubscriptionUsageData = Record<string, {
    totalUsage: number,
}>

export type FirestoreSubscriptionData = {
    id: string,
    current_period_start: number,
    days_until_due?: any,
    status: Stripe.Subscription.Status,
    lastUpdated?: {
        seconds: number
    },
    products?: string[],
    connectedEvents?: {
        [key: string]: {
            connected: any,
        }
    },
    metadata?: {
      billingAccountId?: string,
      planCategory?: string,
    },
    audioUsage?: {
        failedToProcessMinutes?: number,
        processedMinutes?: number,
        pendingMinutes?: number,
        lastUpdated?: any,
        usageLastBilled?: number,
        events?: Record<string, number>,
        totalMinutes?: number,
    }
} & Partial<Stripe.Subscription>

export type StoredEmailInviteData = {
    email: string,
    code: string,
    created: number,
    expires?: string,
    emailSent?: boolean,
    emailSentTimestamp?: number,
    redeemedBy?: string,
    redeemedTimestamp?: number,
    invalidated?: boolean,
}

export type EmailSignupInvitesDocument = {
    invites?: Record<string, StoredEmailInviteData>
}

export const USER_ROLES = {
    admin: 'admin',
    createEvents: 'createEvents',
}

export type FirestoreUser = {
    roles?: {
        [key: string]: boolean,
    },
    billingAccounts?: string[],
    primaryBillingAccount?: string,
}
