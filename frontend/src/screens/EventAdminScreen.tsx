import React, {useEffect, useMemo, useState} from "react"
import {get} from 'lodash'
import AuthRequiredWrapper from "../components/AuthRequiredWrapper"
import AuthWrapper from "../event/components/AuthWrapper"
import {useParams} from "react-router-dom";
import {
    getFirestoreEventRef,
    getFirestoreEventSubscriptionUsageRef,
    getSubscriptionRef
} from "../firebase/firestore/refs";
import {
    FirestoreEventData,
    FirestoreEventSubscriptionUsageData,
    FirestoreSubscriptionData
} from "../firebase/firestore/types";
import {EVENT_QUOTA_CAPACITY, EVENT_QUOTA_USER_CAPACITY} from "../firebase/firestore/data";
import styled from "styled-components";
import {THEME} from "../ui/theme";
import {getSubscriptionPlanFromSubscriptionData} from "../data/subscriptions";

export const useFirestoreEventData = (eventId: string) => {
    const [loaded, setLoaded] = useState(false)
    const [data, setData] = useState<FirestoreEventData | null>(null)
    const [subscriptionData, setSubscriptionData] = useState<null | {
        id: string,
        data: FirestoreSubscriptionData,
    }>(null)

    useEffect(() => {

        const ref = getFirestoreEventRef(eventId)

        ref.onSnapshot((doc) => {
            setData(doc?.data() as FirestoreEventData ?? null)
            setLoaded(true)
        })

    }, [])

    const {
        connectedSubscription
    } = data ?? {}

    const {
        subscriptionId,
        billingAccountId,
    } = connectedSubscription ?? {}

    useEffect(() => {
        if (!subscriptionId || !billingAccountId) return
        setSubscriptionData(null)

        const ref = getSubscriptionRef(subscriptionId, billingAccountId)

        ref.onSnapshot(doc => {
            const data = doc?.data() as FirestoreSubscriptionData
            setSubscriptionData(data ? {
                id: doc.id,
                data,
            } : null)
        })

    }, [subscriptionId, billingAccountId])

    const subscription = useMemo(() => {
        if (subscriptionData && subscriptionData.id === subscriptionId) {
            return subscriptionData.data
        }
        return null
    }, [subscriptionId, subscriptionData])

    return {
        loaded,
        data,
        subscription,
        loadingSubscription: subscriptionId && !subscription,
    }
}

const getEventHasConnectedSubscription = (event: FirestoreEventData) => {
    return !!event.connectedSubscription
}

const getEventAudioCapacity = (event: FirestoreEventData) => {
    const bonusMinutes = get(event, 'audioUsage.bonusFreeMinutes', 0)
    return 300 + bonusMinutes
}

const getEventUserCapacity = (event: FirestoreEventData) => {
    return 25
}

const doesEventHaveUnlimitedCapacity = (event: FirestoreEventData) => {
    return get(event, 'audioUsage.unlimitedCapacity', false)
}

const getEventAudioUsage = (event: FirestoreEventData) => {
    return get(event, 'audioUsage.noSubscriptionUsageTotal', 0)
}

const StyledContainer = styled.div`
  text-align: center;
  font-size: 0.9rem;
  
  h3 {
    font-size: 1.1em;
    font-weight: 800;
  }
  
  p {
    margin-top: ${THEME.spacing.$1}px;
  }
  
  a {
    color: inherit;
    text-decoration: underline;
  }
  
`

const SubscriptionAudioUsage: React.FC<{
    eventId: string,
    billingAccountId: string,
    subscriptionId: string,
    currentPeriodStart: number,
}> = ({eventId, billingAccountId, subscriptionId, currentPeriodStart}) => {

    const [loaded, setLoaded] = useState(false)
    const [usageData, setUsageData] = useState<FirestoreEventSubscriptionUsageData | null>(null)

    useEffect(() => {

        const ref = getFirestoreEventSubscriptionUsageRef(eventId).doc(subscriptionId)

        ref.onSnapshot(snapshot => {
            const data = snapshot.data()
            setUsageData(data as FirestoreEventSubscriptionUsageData ?? null)
            setLoaded(true)
        })

    }, [subscriptionId, eventId])

    const currentUsagePeriod = usageData ? usageData[currentPeriodStart.toString()] : null

    console.log('currentUsagePeriod', currentUsagePeriod)

    return (
        <>
            <p>
                <a href={`/billing/account/${billingAccountId}/subscription/${subscriptionId}`} target={'_blank'} rel="noreferrer">View subscription</a>
            </p>
            {
                !!currentUsagePeriod && (
                    <p>
                        {
                            (currentUsagePeriod.totalUsage / 60).toFixed(1)
                        } audio user-hours used
                    </p>
                )
            }
        </>
    )

}

export const EventAudioUsageView: React.FC<{
    eventId: string,
    linkToAdminPage?: boolean,
}> = ({eventId, linkToAdminPage}) => {

    const {loaded, data, subscription, loadingSubscription} = useFirestoreEventData(eventId)

    const subscriptionPlan = useMemo(() => {
        if (!subscription) return null
        return getSubscriptionPlanFromSubscriptionData(subscription)
    }, [subscription])

    if (!loaded || loadingSubscription) {
        return (
            <StyledContainer>
                loading event data...
            </StyledContainer>
        )
    }

    if (!data) {
        return null
    }

    // todo - check if has subscription...
    const hasSubscription = getEventHasConnectedSubscription(data)

    const unlimitedCapacity = doesEventHaveUnlimitedCapacity(data)
    const capacity = getEventAudioCapacity(data)
    const usage = getEventAudioUsage(data)
    const userCapacity = getEventUserCapacity(data)
    const remainder = capacity > usage ? capacity - usage : 0

    return (
        <StyledContainer>
            <div>
                <h3>
                    Subscription:{` `}
                    {
                        subscription ? subscriptionPlan?.title : "Trial Plan"
                    }
                </h3>
                {
                    subscription ? (
                        <SubscriptionAudioUsage eventId={eventId} subscriptionId={data.connectedSubscription?.subscriptionId ?? ''}
                                                billingAccountId={data.connectedSubscription?.billingAccountId ?? ''}
                                                currentPeriodStart={data.connectedSubscription?.currentPeriodStart ?? 0}
                        />
                    ) : (
                        <>
                            <p>
                                {remainder} of {capacity} minutes remaining.
                            </p>
                            {
                                !unlimitedCapacity && (
                                    <p>
                                        {userCapacity} person capacity
                                    </p>
                                )
                            }
                            <p>
                                <a href={`/billing/upgrade/${eventId}`} target={'_blank'} rel={"noreferrer"}>Upgrade now</a>
                            </p>
                        </>
                    )
                }
            </div>
        </StyledContainer>
    )
}

const Inner: React.FC<{
    eventId: string,
}> = ({eventId}) => {
    return (
        <div>
            <EventAudioUsageView eventId={eventId}/>
        </div>
    )
}

export const EventAdminScreen: React.FC = () => {

    const { eventID } = useParams<{
        eventID: string,
    }>()

    return (
        <AuthWrapper>
            <AuthRequiredWrapper>
                <Inner eventId={eventID}/>
            </AuthRequiredWrapper>
        </AuthWrapper>
    )
}
