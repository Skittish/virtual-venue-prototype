import React, {useEffect, useMemo, useState} from "react";
import {FirestoreSubscriptionData} from "../../firebase/firestore/types";
import {getBillingAccountSubscriptionsRef} from "../../firebase/firestore/refs";
import {SubscriptionPreview} from "./SubscriptionPreview";
import {CreateSubscriptionModal} from "./CreateSubscriptionModal";
import { StyledHeading } from "../../ui/typography/headings";
import { StyledSmallRoundButton } from "../../ui/buttons";
import {StyledOptions} from "./BillingPaymentSection";
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import {CancelSubscriptionModal} from "./CancelSubscriptionModal";
import {Link, useParams} from "react-router-dom";
import {FaArrowLeft} from "react-icons/all";
import {StyleBackLink} from "./SubscriptionScreen";
import {UpgradeEventModal} from "./UpgradeEventModal";

const StyledSection = styled.section`

    &:not(:first-child) {
      margin-top: ${THEME.spacing.$5}px;
    }

`

const StyledSubscriptionList = styled.ul`
  margin-top: ${THEME.spacing.$2}px;
  
  > li {
    &:not(:first-child) {
      margin-top: ${THEME.spacing.$2}px;
    }
  }
  
`

export const BillingAccountSubscriptions: React.FC<{
    billingAccountId: string,
    customerId: string,
}> = ({
          billingAccountId, customerId,
      }) => {

    const {eventId = ''} = useParams<{
        eventId?: string,
    }>()

    const [showUpgradeEventModal, setShowUpgradeEventModal] = useState(!!eventId)
    const [defaultCreateSubscriptionEvent, setDefaultCreateSubscriptionEvent] = useState('')
    const [showCreateSubscriptionModal, setShowCreateSubscriptionModal] = useState(false)
    const [subscriptions, setSubscriptions] = useState<FirestoreSubscriptionData[]>([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {

        const ref = getBillingAccountSubscriptionsRef(billingAccountId)

        ref.get().then(snapshot => {
            setSubscriptions(snapshot.docs.map(doc => doc.data()) as FirestoreSubscriptionData[])
        })
            .finally(() => {
                setLoaded(true)
            })

    }, [billingAccountId])

    const {
        activeSubscriptions,
        pendingSubscriptions,
        inactiveSubscriptions,
    } = useMemo(() => {
        const activeSubscriptions: FirestoreSubscriptionData[] = []
        const pendingSubscriptions: FirestoreSubscriptionData[] = []
        const inactiveSubscriptions: FirestoreSubscriptionData[] = []
        subscriptions.forEach(subscription => {
            if (subscription.status === 'active') {
                activeSubscriptions.push(subscription)
            } else if (subscription.status === 'canceled') {
                inactiveSubscriptions.push(subscription)
            } else {
                pendingSubscriptions.push(subscription)
            }
        })
        return {
            activeSubscriptions,
            pendingSubscriptions,
            inactiveSubscriptions,
        }
    }, [subscriptions])

    if (!loaded) {
        return (
            <div>
                Loading subscriptions...
            </div>
        )
    }

    console.log('activeSubscriptions', activeSubscriptions)

    return (
        <>
            <section>
                <StyledSection>
                    <header>
                        <StyledHeading>
                            Active Subscriptions
                        </StyledHeading>
                        <StyledOptions>
                            <StyledSmallRoundButton onClick={() => {
                                setShowCreateSubscriptionModal(true)
                            }}>Create new subscription
                            </StyledSmallRoundButton>
                        </StyledOptions>
                    </header>
                    <StyledSubscriptionList>
                        {
                            activeSubscriptions.map(subscription => (
                                <li key={subscription.id}>
                                    <SubscriptionPreview subscription={subscription}/>
                                </li>
                            ))
                        }
                    </StyledSubscriptionList>
                </StyledSection>
                <StyledSection>
                    <header>
                        <StyledHeading>
                            Pending Subscriptions
                        </StyledHeading>
                    </header>
                    <StyledSubscriptionList>
                        {
                            pendingSubscriptions.map(subscription => (
                                <li key={subscription.id}>
                                    <SubscriptionPreview subscription={subscription}/>
                                </li>
                            ))
                        }
                    </StyledSubscriptionList>
                </StyledSection>
                <StyledSection>
                    <header>
                        <StyledHeading>
                            Canceled Subscriptions
                        </StyledHeading>
                    </header>
                    <StyledSubscriptionList>
                        {
                            inactiveSubscriptions.map(subscription => (
                                <li key={subscription.id}>
                                    <SubscriptionPreview subscription={subscription}/>
                                </li>
                            ))
                        }
                    </StyledSubscriptionList>
                </StyledSection>
            </section>
            {
                showCreateSubscriptionModal && (
                    <CreateSubscriptionModal eventId={defaultCreateSubscriptionEvent} billingAccountId={billingAccountId} customerId={customerId} onClose={() => {
                        setShowCreateSubscriptionModal(false)
                    }}/>
                )
            }
            {
                showUpgradeEventModal && (
                    <UpgradeEventModal eventId={eventId} billingAccountId={billingAccountId} onClose={() => {
                        setShowUpgradeEventModal(false)
                    }} onCreateNewSubscription={(eventId) => {
                        setDefaultCreateSubscriptionEvent(eventId)
                        setShowCreateSubscriptionModal(true)
                    }}/>
                )
            }
        </>
    )
}
