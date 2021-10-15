import React, {useEffect, useMemo, useRef, useState} from "react"
import {Link, useParams} from "react-router-dom";
import {getFirestoreEventRef, getSubscriptionRef} from "../../firebase/firestore/refs";
import {FirestoreEventData, FirestoreSubscriptionData} from "../../firebase/firestore/types";
import {getSubscriptionName, useSubscriptionCurrentPeriodEnd} from "./SubscriptionPreview";
import {format, parse} from "date-format-parse";
import { UndoCancelSubscriptionModal } from "./UndoCancelSubscriptionModal";
import {Stripe} from "stripe";
import {CancelSubscriptionModal} from "./CancelSubscriptionModal";
import { StyledHeading, StyledLargeHeading } from "../../ui/typography/headings";
import {FaArrowLeft} from "react-icons/all";
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import { StyledSmallRoundButton, StyledTextHoverButton } from "../../ui/buttons";
import {fetchSubscription, fetchSubscriptionInvoices, updateSubscriptionPaymentMethod} from "../../firebase/events";
import {FormatDate} from "../../components/FormatDate";
import {FormatCurrency} from "../../components/FormatCurrency";
import {SelectPaymentMethodModal} from "./SelectPaymentMethodModal";
import {useCustomerPaymentMethods} from "./BillingPaymentSection";
import {SubscriptionPaymentMethod} from "./SubscriptionPaymentMethod";
import {AddEventModal} from "./AddEventModal";
import {cssRoundedItem, cssSelectable, StyledContainer} from "./PaymentMethodPreview";
import {RemoveEventFromSubscriptionModal} from "./RemoveEventFromSubscriptionModal";

export const StyleBackLink = styled.a`
  color: inherit;
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  margin-bottom: ${THEME.spacing.$2}px;
  
  svg {
    margin-right: 4px;
  }
  
  &:hover {
    text-decoration: underline;
  }
  
`

export const StyledHeader = styled.header`
  margin-bottom: ${THEME.spacing.$1b}px;
`

const StyledTitle = styled(StyledLargeHeading)`
  margin-top: ${THEME.spacing.$2}px;
`

const StyledInfo = styled.div`

    p {
      
      &:not(:first-child) {
        margin-top: ${THEME.spacing.$1b}px;
      }
      
      &:not(:last-child) {
        margin-bottom: ${THEME.spacing.$1b}px;
      }
      
    }

`

const StyledSection = styled.section`
    margin-top: ${THEME.spacing.$3}px;
  
    h3 {
      margin-bottom: ${THEME.spacing.$1b}px;
    }
  
`

export const useSubscriptionConnectedEvents = (subscription: FirestoreSubscriptionData | null) => {

    const connectedEvents = useMemo(() => {
        if (subscription && subscription.connectedEvents) {
            return Object.keys(subscription.connectedEvents)
        }
        return []
    }, [subscription])

    const [eventsData, setEventsData] = useState<Record<string, FirestoreEventData>>({})

    useEffect(() => {

        connectedEvents.forEach(eventId => {
            const ref = getFirestoreEventRef(eventId)
            ref.get().then(snapshot => {
                setEventsData(state => ({
                    ...state,
                    [eventId]: snapshot.data() as FirestoreEventData,
                }))
            })
        })

    }, [connectedEvents])

    return useMemo(() => {

        const events: Record<string, FirestoreEventData> = {}
        let loading = connectedEvents.length > 0 && Object.keys(eventsData).length === 0

        connectedEvents.forEach(eventId => {
            if (eventsData[eventId]) {
                events[eventId] = eventsData[eventId]
            } else {
                loading = true
            }
        })

        return {
            events,
            loading,
        }

    }, [connectedEvents, eventsData])

}

const StyledList = styled.ul`
    margin-top: ${THEME.spacing.$1b}px;

    > li {
      
      &:not(:first-child) {
        margin-top: ${THEME.spacing.$1}px;
      }
      
    }

`

const StyledEventContainer = styled.div`
  ${cssRoundedItem};
  max-width: 400px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  grid-column-gap: ${THEME.spacing.$1}px;
`

const StyledEventTitle = styled.a`
  color: inherit;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
  
`


const ConnectedEvents: React.FC<{
    subscription: FirestoreSubscriptionData,
    subscriptionId: string,
    billingAccountId: string,
}> = ({subscriptionId, subscription, billingAccountId}) => {

    const [showAddEventModal, setShowAddEventModal] = useState(false)
    const [eventToRemove, setEventToRemove] = useState<null | {
        id: string,
        event: FirestoreEventData,
    }>(null)

    const {events: connectedEvents, loading: loadingConnectedEvents} = useSubscriptionConnectedEvents(subscription)

    return (
        <>
            <StyledSection>
                <StyledHeading>
                    Connected Events
                </StyledHeading>
                <div>
                    <StyledSmallRoundButton onClick={() => {
                        setShowAddEventModal(true)
                    }}>
                        Add event
                    </StyledSmallRoundButton>
                </div>
                <StyledList>
                    {
                        Object.entries(connectedEvents).map(([id, event]) => (
                            <li key={id}>
                                <StyledEventContainer>
                                    <StyledEventTitle href={`/event/${id}`} target={'_blank'}>
                                        {id}
                                    </StyledEventTitle>
                                    <StyledTextHoverButton onClick={() => {
                                        setEventToRemove({
                                            id,
                                            event,
                                        })
                                    }}>
                                        Remove
                                    </StyledTextHoverButton>
                                </StyledEventContainer>
                            </li>
                        ))
                    }
                </StyledList>
            </StyledSection>
            {
                showAddEventModal && (
                    <AddEventModal subscriptionId={subscriptionId} billingAccountId={billingAccountId} onSelect={() => {}} onClose={() => {
                        setShowAddEventModal(false)
                    }}/>
                )
            }
            {
                eventToRemove && (
                    <RemoveEventFromSubscriptionModal onClose={() => {
                        setEventToRemove(null)
                    }} id={eventToRemove.id} event={eventToRemove.event}/>
                )
            }
        </>
    )

}

export const getSubscriptionAudioUsageTotalMinutes = (subscription: FirestoreSubscriptionData): number => {

    const {
        audioUsage = {},
    } = subscription

    const {
        totalMinutes = 0,
    } = audioUsage

    return totalMinutes

}

const Content: React.FC = () => {

    const fetchedRef = useRef(false)
    const [loaded, setLoaded] = useState(false)
    const [subscription, setSubscription] = useState<FirestoreSubscriptionData | null>(null)
    const [showUndoCancelModal, setShowUndoCancelModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)

    const {id, billingAccountId} = useParams<{
        id: string,
        billingAccountId: string,
    }>()

    const updateSubscription = (response: Stripe.Response<Stripe.Subscription>) => {
        setSubscription(state => ({
            ...state,
            ...response,
        }))
    }

    useEffect(() => {
        const ref = getSubscriptionRef(id, billingAccountId)
        ref.onSnapshot(snapshot => {
            const data = snapshot.data()
            console.log('data', data)
            setSubscription(data as FirestoreSubscriptionData)
            setLoaded(true)
        })
    }, [id, billingAccountId])

    useEffect(() => {

        if (fetchedRef.current) return

        if (!subscription) return

        if (subscription.lastUpdated && (subscription.lastUpdated.seconds * 1000) < Date.now() - (30 * 60 * 1000)) {
            fetchedRef.current = true
            fetchSubscription(id)
                .then((response) => {
                    console.log('response', response)
                })
        }


    }, [id, subscription])

    const currentPeriodEnd = useSubscriptionCurrentPeriodEnd(subscription)


    const {customer} = subscription ?? {}

    const [loadedInvoiceData, setLoadedInvoiceData] = useState(false)
    const [invoiceData, setInvoiceData] = useState<Stripe.Invoice | null>(null)

    useEffect(() => {
        if (!customer || typeof customer !== 'string') return

        fetchSubscriptionInvoices(customer, id)
            .then((response) => {
                setInvoiceData(response)
                setLoadedInvoiceData(true)
            })

    }, [customer, id])

    const customerId = customer ?? ''

    if (!loaded) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    if (!subscription) {
        return (
            <div>
                No subscription found.
            </div>
        )
    }

    const isPendingCancellation = !!subscription.cancel_at_period_end

    const isActive = subscription.status === 'active'

    const totalMinutes = getSubscriptionAudioUsageTotalMinutes(subscription)

    return (
        <>
            <div>
                <StyledHeader>
                    <StyleBackLink as={Link} to={`/billing/account/${billingAccountId}`}>
                        <FaArrowLeft size={12}/>
                        Back to subscriptions
                    </StyleBackLink>
                    <StyledTitle>
                        {getSubscriptionName(subscription)}
                    </StyledTitle>
                </StyledHeader>
                <StyledInfo>
                    <p>
                        Subscription status: {subscription.status}
                    </p>
                    {
                        (isPendingCancellation && isActive) && (
                            <>
                                <p>
                                    Cancellation pending. This subscription will expire on {currentPeriodEnd}.
                                </p>
                                <StyledSmallRoundButton onClick={() => {
                                    setShowUndoCancelModal(true)
                                }}>
                                    Undo cancellation
                                </StyledSmallRoundButton>
                            </>
                        )
                    }
                    {
                        (!isPendingCancellation && isActive) && (
                            <>
                                <StyledSmallRoundButton onClick={() => {
                                    setShowCancelModal(true)
                                }}>Cancel subscription</StyledSmallRoundButton>
                            </>
                        )
                    }
                </StyledInfo>
                <ConnectedEvents subscription={subscription} subscriptionId={subscription.id} billingAccountId={billingAccountId}/>
                <StyledSection>
                    <StyledHeading>
                        Current Billing Period
                    </StyledHeading>
                    {
                        !loadedInvoiceData ? (
                            <>
                                <p>
                                    Loading...
                                </p>
                            </>
                        ) : (
                            <>
                                <p>
                                    Next billing date: <FormatDate date={(invoiceData?.period_end ?? 0) * 1000}/>
                                </p>
                                <p>
                                    Current total amount due: <FormatCurrency amount={(invoiceData?.total ?? 0) / 100}/>
                                </p>
                                <p>
                                    Current usage: {(totalMinutes / 60).toFixed(1)} hours
                                </p>
                            </>
                        )
                    }
                    <SubscriptionPaymentMethod customerId={customerId as string} subscription={subscription}/>
                </StyledSection>
                <StyledSection>
                    <StyledHeading>
                        Past Invoices
                    </StyledHeading>
                </StyledSection>
            </div>
            {
                showUndoCancelModal && (
                    <UndoCancelSubscriptionModal onClose={() => {
                        setShowUndoCancelModal(false)
                    }} onComplete={updateSubscription} subscription={subscription}/>
                )
            }
            {
                showCancelModal && (
                    <CancelSubscriptionModal subscription={subscription} onClose={() => {
                        setShowCancelModal(false)
                    }} onComplete={updateSubscription}/>
                )
            }
        </>
    )

}

const StyledWrapper = styled.div`
  max-width: 800px;
  margin: ${THEME.spacing.$5}px auto;
`

export const SubscriptionScreen: React.FC = () => {

    return (
        <StyledWrapper>
            <Content/>
        </StyledWrapper>
    )

}
