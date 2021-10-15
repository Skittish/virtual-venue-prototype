export type FirestoreEventConnectedSubscriptionData = {
    billingAccountId: string,
    subscriptionId: string,
    currentPeriodStart?: number,
}

export type FirestoreEventData = {
    creatorId: string,
    hifiUsage?: Record<string, number>,
    lastProcessed?: number,
    processCount?: number,
    quotaCapacity?: string,
    spaces?: string[],
    connectedSubscription?: FirestoreEventConnectedSubscriptionData,
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

export type FirestoreSubscriptionData = {
    connectedEvents?: Record<string, {
        connected: any,
    }>,
    audioUsage?: {
        failedToProcessMinutes?: number,
        processedMinutes?: number,
        pendingMinutes?: number,
        lastUpdated?: any,
        usageLastBilled?: number,
        events?: Record<string, number>,
    }
}

export type FirestoreBillingAccountData = {
    accountName: string,
}

export const USER_ROLES = {
    admin: 'admin',
    createEvents: 'createEvents',
}

export type FirestoreUserData = {
    roles?: {
        [key: string]: boolean,
    }
    billingAccounts?: string[],
    redeemedTokens?: string[],
}

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

export type SiteAdminData = {
    admins?: string[],
    defaultEventRoomTemplate?: string,
}

export type RoomTemplate = {
    scenery: any,
    sceneryHistory: any,
}
