import React, {useMemo, useState} from "react";
import {FirestoreSubscriptionData} from "../../firebase/firestore/types";
import {getSubscriptionPlan, SubscriptionPlan} from "../../data/subscriptions";
import {CancelSubscriptionModal} from "./CancelSubscriptionModal";
import styled from "styled-components";
import { StyledContainer } from "./PaymentMethodPreview";
import { StyledHeading } from "../../ui/typography/headings";
import {Link} from "react-router-dom";
import {useBillingAccountId} from "./BillingAccountScreen.context";
import {THEME} from "../../ui/theme";
import {format} from "date-format-parse";

const StyledHeader = styled.header`

    p {
      font-size: 0.8em;
      margin-top: ${THEME.spacing.$1b}px;
    }

`

const StyledTitle = styled(StyledHeading)`
  color: inherit;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
  
`

export const getSubscriptionPlans = (subscription: FirestoreSubscriptionData) => {
    const {products = []} = subscription
    return products.map(product => getSubscriptionPlan(product)).filter(plan => !!plan)
}

export const getSubscriptionName = (subscription: FirestoreSubscriptionData) => {
    const subscriptionPlans = getSubscriptionPlans(subscription)
    return `${subscriptionPlans.map(plan => plan!.title).join(', ')} Subscription`
}

export const useSubscriptionCurrentPeriodEnd = (subscription?: FirestoreSubscriptionData | null) => {
    const {
        current_period_end,
    } = subscription ?? {}

    const currentPeriodEnd = useMemo(() => {
        if (!current_period_end) return ''
        return format(new Date(current_period_end * 1000), 'YYYY-MM-DD')
    }, [current_period_end])

    return currentPeriodEnd
}

export const SubscriptionPreview: React.FC<{
    subscription: FirestoreSubscriptionData,
}> = ({subscription: passedSubscription}) => {

    const billingAccountId = useBillingAccountId()

    const [subscription, setSubscription] = useState(passedSubscription)

    const [showCancelModal, setShowCancelModal] = useState(false)

    const canCancel = subscription.status === 'active'

    const cancelSubscription = () => {
        setShowCancelModal(true)
    }

    const currentPeriodEnd = useSubscriptionCurrentPeriodEnd(subscription)

    const onSubscriptionCancelled = (updatedSubscription: any) => {
        setSubscription({
            ...passedSubscription,
            ...updatedSubscription,
        })
    }

    return (
        <>
            <StyledContainer>
                <StyledHeader>
                    <StyledTitle as={Link} to={`/billing/account/${billingAccountId}/subscription/${subscription.id}`}>
                        {getSubscriptionName(subscription)}
                    </StyledTitle>
                    {
                        subscription.cancel_at_period_end && (
                            <p>
                                Cancellation pending. This subscription will expire on {currentPeriodEnd}.
                            </p>
                        )
                    }
                </StyledHeader>
            </StyledContainer>
            {
                showCancelModal && (
                    <CancelSubscriptionModal subscription={subscription} onClose={() => {
                        setShowCancelModal(false)
                    }} onComplete={onSubscriptionCancelled}/>
                )
            }
        </>
    );
};
