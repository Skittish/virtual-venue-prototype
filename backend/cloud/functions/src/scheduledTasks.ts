/* eslint-disable no-void */
import * as admin from "firebase-admin"
import {getEventsRef} from "./events/refs";
import {
    VirtualVenueEvent,
    HifiSpaceData,
    getEventChannels, getEventGlobalChannels,
} from "./events/types";
import {generateHifiAdminToken, retrieveHifiAppSpaces, retrieveUsersInHifiSpace} from "./events/hifi";
import {
    getBillingAccountSubscriptionRef,
    getEventsDataRef,
    getFirestoreEventRef, getFirestoreEventSubscriptionUsageRef,
    getPendingRawEventsDayRef,
    getPendingRawEventsRef, getProcessedRawEventsDayRef,
} from "./firestore/refs";
import {fetchFirestoreEvents, getEventFreeMinutes, setEventFreeAudioDisabled} from "./firestore/event";
import {DEFAULT_EVENT_QUOTA_CAPACITY, getQuotaCapacity} from "./events/quotaCapacity";
import {
    FirestoreEventConnectedSubscriptionData,
    FirestoreEventData,
    FirestoreSubscriptionData,
} from "./firestore/types";
import {isStagingEnv} from "./utils/env";
import {app} from "./app";
// eslint-disable-next-line import/no-extraneous-dependencies
import {File} from "@google-cloud/storage/build/src/file";
import {fetchBillingAccounts, fetchBillingAccountSubscriptions} from "./firestore/billing";
import {createSubscriptionUsageRecord} from "./stripe/subscription";
import {get} from "lodash";

export const fetchAllEvents = (): Promise<Record<string, VirtualVenueEvent>> => {
    const ref = getEventsRef()
    return ref.once('value').then(snapshot => snapshot.val())
}

export const getRecentlyActiveEvents = (events: Record<string, FirestoreEventData>) => {
    // todo - determine recently active events
    return events
}

export const getEventSpaceIds = (event: VirtualVenueEvent): string[] => {
    const spaceIds: Record<string, string> = {}
    const channels = getEventChannels(event)
    Object.values(channels).forEach(channel => {
        spaceIds[channel.hifi.spaceId] = ''
    })
    const globalChannels = getEventGlobalChannels(event)
    Object.values(globalChannels).forEach(channel => {
        spaceIds[channel.hifi.spaceId] = ''
    })
    return Object.keys(spaceIds)
}

export const getFirestoreEventSpaceIds = (event: FirestoreEventData): string[] => {
    return event.spaces ?? []
}

export const getNumberOfUsersConnectedToSpace = async (spaceId: string, adminJwt: string) => {

    try {
        const users = await retrieveUsersInHifiSpace(spaceId, adminJwt)
        const numberOfUsers = users ? users.length : 0
        if (numberOfUsers === undefined) {
            // todo - log error?
            return 0
        }
        return numberOfUsers
    } catch (e) {
        console.error(e)
        return 0
    }

}

export const isEventDevelopmentEvent = (event: VirtualVenueEvent): boolean => {
    return event?.eventData?.isDevelopmentEvent ?? false
}

export const getEventQuotaUsageForTheMonth = (event: FirestoreEventData): number => {

    const {
        hifiUsage = {},
    } = event

    let total = 0

    Object.entries(hifiUsage).forEach(([dayId, value]) => {
        total += value
    })

    return total
}

export const getEventQuotaAllowance = (event: FirestoreEventData): number => {
    const {quotaCapacity = DEFAULT_EVENT_QUOTA_CAPACITY} = event
    return getQuotaCapacity(quotaCapacity)
}

export const isEventCloseToExceedingQuota = (event: FirestoreEventData, currentUsage: number) => {
    const usageSoFar = getEventQuotaUsageForTheMonth(event)
    const allowance = getEventQuotaAllowance(event)

    const excessAmount = (currentUsage * 2) + usageSoFar + (allowance / 4)

    return excessAmount >= allowance

}

export const OLDprocessEventPerMinuteUsage = async (eventId: string, event: FirestoreEventData, hifiSpaces: Record<string, HifiSpaceData>) => {

    // console.log(`processEventPerMinuteUsage: ${eventId}`)

    let totalCount = 0
    const spaceCounts: Record<string, number> = {}

    const spaceIds = getFirestoreEventSpaceIds(event)

    spaceIds.forEach(spaceId => {
        const matchedSpace = hifiSpaces[spaceId]
        if (matchedSpace) {
            const spaceCount = matchedSpace["connected-user-count"] ?? 0
            totalCount += spaceCount
            spaceCounts[spaceId] = spaceCount
        }
    })

    const processNow = isEventCloseToExceedingQuota(event, totalCount)
    const result: StoredRawEventData = {
        totalCount,
        lastUpdate: Date.now(),
    }
    if (processNow) {
        void OLDupdateEventStoredValue(eventId, totalCount)
        result.alreadyProcessed = true
    }
    return result

}

export const fetchHifiSpaces = (jwt: string): Promise<Record<string, HifiSpaceData>> => {
    return retrieveHifiAppSpaces(jwt).then(spaces => {
        const allSpaces: Record<string, HifiSpaceData> = {}
        spaces.forEach(space => {
            allSpaces[space["space-id"]] = space
        })
        return allSpaces
    })
}

export const fetchCrossEnvHifiSpaces = (adminDevJwt: string, adminProdJwt: string): Promise<Record<string, HifiSpaceData>> => {
    const prodSpacesPromise = retrieveHifiAppSpaces(adminProdJwt)
    const devSpacesPromise = retrieveHifiAppSpaces(adminDevJwt)

    return Promise.all([prodSpacesPromise, devSpacesPromise]).then(([prodSpaces, devSpaces]) => {
        const allSpaces: Record<string, HifiSpaceData> = {}
        prodSpaces.forEach(space => {
            allSpaces[space["space-id"]] = space
        })
        devSpaces.forEach(space => {
            allSpaces[space["space-id"]] = space
        })
        return allSpaces
    })
}

const processEvent = (eventId: string, event: FirestoreEventData, hifiSpaces: Record<string, HifiSpaceData>) => {

    const {
        connectedSubscription,
    } = event

    let totalCount = 0
    // let totalCount = Math.floor(Math.random() * 30)
    const spaceCounts: Record<string, number> = {}

    const spaceIds = getFirestoreEventSpaceIds(event)

    spaceIds.forEach(spaceId => {
        const matchedSpace = hifiSpaces[spaceId]
        if (matchedSpace) {
            const spaceCount = matchedSpace["connected-user-count"] ?? 0
            totalCount += spaceCount
            spaceCounts[spaceId] = spaceCount
        }
    })

    const update: ProcessedEventAudioUsageData = {
        connectedSubscription,
        totalCount,
        lastUpdate: Date.now(),
    }

    // todo - better determine whether to process immediately or not
    const processNow = totalCount > 0

    if (processNow) {
        void updateEventAudioUsage(eventId, update)
        update.alreadyProcessed = true
    }

    const isFreeEvent = !connectedSubscription
    const freeAudioDisabled = get(event, 'audioUsage.freeAudioDisabled', false)
    const ignoreTrialLimit = get(event, 'audioUsage.ignoreTrialLimit', false)

    const audioDisabled = freeAudioDisabled && !ignoreTrialLimit

    if (isFreeEvent && !audioDisabled) {

        const noSubscriptionUsageTotal = get(event, 'audioUsage.noSubscriptionUsageTotal', 0)
        const newTotal = noSubscriptionUsageTotal + totalCount

        if ((newTotal >= getEventFreeMinutes(event)) && !ignoreTrialLimit) {
            void setEventFreeAudioDisabled(eventId)
        }

    }

    return update

}

const storage = app.storage()

const storeUnprocessedAudioUsage = async (id: string, data: any) => {

    // console.time('loadData')
    // const fileData = await fetchBucketJsonFile('audio-usage', 'unprocessed.json') ?? {}
    // console.timeEnd('loadData')

    const file = storage.bucket('audio-usage').file(`unprocessed/${id}.json`)

    await file.save(JSON.stringify(data), {
        contentType: 'application/json',
    }).then(function(err: any) {
        // eslint-disable-next-line eqeqeq
        if (err && err.length != 0) {
            console.error("The file is not saved", err);
            return false;
        } else {
            return true;
        }
    });

}
const audioUsageBucket = storage.bucket('audio-usage')
const audioUsageRawBucket = storage.bucket('audio-usage-raw-backup')

const processSubscriptionAudioUsage = async (subscriptionId: string, subscription: FirestoreSubscriptionData, billingAccountId: string) => {

    const {
        audioUsage,
    } =  subscription

    if (!audioUsage) {
        return
    }

    const {
        pendingMinutes,
    } = audioUsage

    if (pendingMinutes && pendingMinutes >= 60) {

        const ref = getBillingAccountSubscriptionRef(billingAccountId, subscriptionId)
        const numberOfHours = Math.floor(pendingMinutes / 60)
        const minutesToDeduct = numberOfHours * 60

        await ref.update({
            ['audioUsage.usageLastBilled']: admin.firestore.FieldValue.serverTimestamp(),
            ['audioUsage.pendingMinutes']: admin.firestore.FieldValue.increment(-minutesToDeduct),
            ['audioUsage.processedMinutes']: admin.firestore.FieldValue.increment(minutesToDeduct),
        })

        try {
            await createSubscriptionUsageRecord(subscriptionId, numberOfHours)
        } catch (error) {
            console.error(error)
            // todo - log to sentry
            await ref.update({
                ['audioUsage.processedMinutes']: admin.firestore.FieldValue.increment(-minutesToDeduct),
                ['audioUsage.failedToProcessMinutes']: admin.firestore.FieldValue.increment(minutesToDeduct),
            })
        }

    }

}

export const processSubscriptionsAudioUsage = async () => {

    const billingAccounts = await fetchBillingAccounts()

    Object.keys(billingAccounts).forEach(async (billingAccountId) => {
        const subscriptions = await fetchBillingAccountSubscriptions(billingAccountId)

        Object.entries(subscriptions).forEach(([subscriptionId, subscription]) => {
            void processSubscriptionAudioUsage(subscriptionId, subscription, billingAccountId)
        })

    })

    // console.log('billingAccounts', billingAccounts)

}

export type ProcessedEventAudioUsageData = {
    totalCount: number,
    lastUpdate: number,
    alreadyProcessed?: boolean,
    connectedSubscription?: FirestoreEventConnectedSubscriptionData
}

export type ProcessedAudioUsageData = Record<string, ProcessedEventAudioUsageData>

const updateSubscriptionAudioUsage = (subscriptionId: string, billingAccountId: string, amount: number, eventId: string) => {

    const subscriptionRef = getBillingAccountSubscriptionRef(billingAccountId, subscriptionId)

    return subscriptionRef.update({
        ['audioUsage.lastUpdated']: admin.firestore.FieldValue.serverTimestamp(),
        ['audioUsage.pendingMinutes']: admin.firestore.FieldValue.increment(amount),
        ['audioUsage.totalMinutes']: admin.firestore.FieldValue.increment(amount),
        [`audioUsage.events.${eventId}`]: admin.firestore.FieldValue.increment(amount),
    })

}

const updateEventAudioUsage = async (eventId: string, eventData: ProcessedEventAudioUsageData) => {

    const {
        dayId,
    } = getTimeIds()

    const amount = eventData.totalCount

    const eventRef = getFirestoreEventRef(eventId)

    const update: Record<string, any> = {
        ['audioUsage.lastUpdated']: admin.firestore.FieldValue.serverTimestamp(),
        ['audioUsage.currentTotal']: admin.firestore.FieldValue.increment(amount),
        ['audioUsage.overallTotal']: admin.firestore.FieldValue.increment(amount),
        [`audioUsage.perDay.${dayId.toString()}`]: admin.firestore.FieldValue.increment(amount),
    }

    if (eventData.connectedSubscription) {

        const {
            subscriptionId,
            billingAccountId,
            currentPeriodStart = 0,
        } = eventData.connectedSubscription

        const currentPeriod = currentPeriodStart.toString()

        const eventSubscriptionUsageRef = getFirestoreEventSubscriptionUsageRef(eventId).doc(subscriptionId)

        void eventSubscriptionUsageRef.set({
            [`${currentPeriod}`]: {
                totalUsage: admin.firestore.FieldValue.increment(amount),
            },
        }, {
            merge: true,
        })

        await updateSubscriptionAudioUsage(subscriptionId, billingAccountId, amount, eventId)
    } else {
        update['audioUsage.noSubscriptionUsageTotal'] = admin.firestore.FieldValue.increment(amount)
    }

    return eventRef.update(update)

}

const processAudioUsageFile = async (file: File) => {
    // @ts-ignore
    const data = await file.download().then(response => JSON.parse(response.toString('utf8'))) as ProcessedAudioUsageData
    const newFile = audioUsageRawBucket.file(file.name.replace('unprocessed/', 'processed/'))
    void file.move(newFile)

    Object.entries(data).forEach(([eventId, eventData]) => {
        if (!eventData.alreadyProcessed) {
            if (eventData.totalCount > 0) {
                void updateEventAudioUsage(eventId, eventData)
            }
        }
    })

}

export const processUnprocessedAudioUsage = async () => {

    const [files] = await audioUsageBucket.getFiles({ prefix: 'unprocessed/'});
    files.forEach(async (file) => {
        void processAudioUsageFile(file)
    });

}

/*

process each event's usage per minute

store the information somewhere...

 */

export const getTimeIds = () => {
    const now = Date.now()
    const minuteId = Math.floor(now / 1000 / 60)
    const hourId = Math.floor(minuteId / 60)
    const dayId = Math.floor(hourId / 24)

    return {
        now,
        minuteId,
        hourId,
        dayId,
    }

}

export const processMinutes = async () => {

    const {
        now,
    } = getTimeIds()

    const firestoreEvents = await fetchFirestoreEvents()

    const jwt = await generateHifiAdminToken(isStagingEnv())
    const hifiSpaces = await fetchHifiSpaces(jwt)

    const recentlyActiveEvents = Object.entries(getRecentlyActiveEvents(firestoreEvents))

    const totalUpdates = recentlyActiveEvents.reduce((prev, [id, event]) => {
        const eventUpdate = processEvent(id, event, hifiSpaces)
        // only bother storing events with audio usage
        if (eventUpdate.totalCount > 0) {
            return {
                ...prev,
                [id]: eventUpdate,
            }
        }
        return prev
    }, {})

    await storeUnprocessedAudioUsage(now.toString(), totalUpdates)

}

export const OLDprocessEventsPerMinuteUsage = async () => {

    const now = Date.now()
    const minuteId = Math.floor(now / 1000 / 60)
    const dayId = Math.floor(minuteId / 60 / 24)

    const adminDevJwt = await generateHifiAdminToken(true)
    const adminProdJwt = await generateHifiAdminToken(false)

    const hifiSpaces = await fetchCrossEnvHifiSpaces(adminDevJwt, adminProdJwt)

    const firestoreEvents = await fetchFirestoreEvents()

    const recentlyActiveEvents = Object.entries(getRecentlyActiveEvents(firestoreEvents))
    const promises: Promise<any>[] = recentlyActiveEvents.map(([eventId, event]) => {
        return OLDprocessEventPerMinuteUsage(eventId, event, hifiSpaces)
    })
    const updates: Record<string, any> = {}
    await Promise.all(promises).then((values) => {
        recentlyActiveEvents.forEach(([eventId], index) => {
            updates[eventId] = values[index]
        })
    })

    const ref = getPendingRawEventsRef()

    return ref.doc(dayId.toString()).set({
        [minuteId.toString()]: {
            ...updates,
            created: Date.now(),
        },
    }, {
        merge: true,
    })

}

export type StoredRawEventData = {
    alreadyProcessed?: boolean,
    totalCount: number,
    lastUpdate: number,
}

export type MinuteSnapshot = Record<string, StoredRawEventData>

export type DaySnapshot = Record<string, MinuteSnapshot>

export const fetchAllPendingRawEvents = async (): Promise<{
    id: string,
    data: DaySnapshot,
}[]> => {
    const ref = getPendingRawEventsRef()
    const snapshot = await ref.get()
    return snapshot.docs.map(doc => (
        {
            id: doc.id,
            data: doc.data(),
        }
    ));
}

export const OLDupdateEventStoredValue = (eventId: string, total: number) => {

    console.log('updateEventStoredValue', eventId, total)

    const now = Date.now()
    const minuteId = Math.floor(now / 1000 / 60)
    const dayId = Math.floor(minuteId / 60 / 24)

    const ref = getFirestoreEventRef(eventId)

    return ref.set({
        [`processCount`]: admin.firestore.FieldValue.increment(1),
        [`lastProcessed`]: now,
        [`hifiUsage`]: {
            [dayId]: admin.firestore.FieldValue.increment(total),
        },
    }, {
        merge: true,
    })

}

export const processPendingRawEventData = async () => {

    const pendingRawEventsData = await fetchAllPendingRawEvents()

    const processedEvents: Record<string, number> = {}
    const eventsTotal: Record<string, number> = {}
    const processedDays: {
        id: string,
        processedMinutes: string[],
    }[] = []

    pendingRawEventsData.forEach(day => {
        const {id, data} = day
        const processedMinutes: string[] = []
        Object.entries(data).forEach(([minuteId, minuteData]) => {
            Object.entries(minuteData).forEach(([eventId, eventData]) => {
                const {totalCount = 0, alreadyProcessed} = eventData
                if (alreadyProcessed) return
                processedEvents[eventId] = Date.now()
                if (totalCount > 0) {
                    const previousCount = eventsTotal[eventId] ?? 0
                    eventsTotal[eventId] = eventData.totalCount + previousCount
                }
            })
            processedMinutes.push(minuteId)
        })
        processedDays.push({
            id,
            processedMinutes,
        })
    })

    Object.entries(eventsTotal).forEach(([eventId, total]) => {
        // eslint-disable-next-line no-void
        void OLDupdateEventStoredValue(eventId, total)
    })

    const preppedUpdate: Record<string, any> = {}

    Object.entries(processedEvents).forEach(([eventId, processedTimestamp]) => {
        preppedUpdate[`processedEvents.${eventId}.lastProcessed`] = processedTimestamp
    })

    if (Object.keys(preppedUpdate).length > 0) {

        const ref = getEventsDataRef()

        await ref.update(preppedUpdate)

    }

    pendingRawEventsData.forEach(day => {
        const {id, data} = day
        const dayRef = getProcessedRawEventsDayRef(id)
        // eslint-disable-next-line no-void
        void dayRef.set(data, {
            merge: true,
        })
    })

    processedDays.forEach(({id, processedMinutes}) => {
        const dayRef = getPendingRawEventsDayRef(id)
        const update: Record<string, any> = {}
        if (processedMinutes.length === 0) return
        processedMinutes.forEach(minuteId => {
            update[minuteId] = admin.firestore.FieldValue.delete()
        })
        // eslint-disable-next-line no-void
        void dayRef.update(update)
    })

}