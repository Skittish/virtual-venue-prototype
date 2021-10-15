import React, {useEffect, useMemo, useState} from "react"
import Modal from "../../components/Modal";
import { StyledHeading, StyledLargeHeading } from "../../ui/typography/headings";
import styled, {css} from "styled-components";
import {THEME} from "../../ui/theme";
import {
    communityTestPlan,
    getSubscriptionPlanFromId, getSubscriptionPriceId,
} from "../../data/subscriptions";
import {useCustomerPaymentMethods} from "./BillingPaymentSection";
import Stripe from "stripe";
import {StyledRoundedButton, StyledSmallRoundButton, StyledTextHoverButton } from "../../ui/buttons";
import {AddPaymentMethodModal} from "./AddPaymentMethodModal";
import {SelectPaymentMethodModal} from "./SelectPaymentMethodModal";
import {PaymentMethodPreview} from "./PaymentMethodPreview";
import {addEventToSubscription, createStripeSubscription} from "../../firebase/events";
import {useHistory} from "react-router-dom";
import {AddEventToSubscription} from "./AddEventModal";

const cssSelectable = css`
  
  background-color: rgba(0,0,0,0.1);
  cursor: pointer;
  
  &:focus,
  &:hover {
    background-color: rgba(0,0,0,0.25);
  }
`

const cssNotSelectable = css`
  border: 2px solid rgba(0,0,0,0.25);
`

const StyledPreviewWrapper = styled.div`
  position: relative;
`


const cssFadeOnHover = css`
  cursor: default;
  
  &:hover > div:first-child {
    opacity: 0.05;
  }
  
`


const StyledPreviewContainer = styled.div<{
    selectable?: boolean,
    fadeOnHover?: boolean,
}>`
  display: block;
  padding: ${THEME.spacing.$3}px ${THEME.spacing.$2}px;
  text-align: center;
  border-radius: 16px;
  position: relative;
  
  ${props => props.selectable ? cssSelectable : cssNotSelectable};
  ${props => props.fadeOnHover ? cssFadeOnHover : ''};
  
  h3 {
    font-size: 1.5em;
    font-weight: 800;
  }
  
  p {
    font-size: 0.9em;
    margin-top: ${THEME.spacing.$1b}px;
  }
  
`

const StyledContactOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  grid-row-gap: 10px;
  
  div:hover > & {
    visibility: visible;
  }
  
`

const StyledPreviewBody = styled.div`
  margin-top: ${THEME.spacing.$3}px;
  
  p {
    line-height: 1.25;
    margin-top: ${THEME.spacing.$1}px;
  }
  
  h4 {
    font-size: 1.25em;
    font-weight: 800;
    
    span {
      font-size: 1.75em;
    }
    
  }

    p {
    }

`

type Props = {
    onSelected?: () => void,
}

const StyledPreviewMain = styled.div`
`

const SubscriptionPlanPreview: React.FC<{
    title: string,
    subtitle: string,
    body?: any,
    comingSoon?: boolean,
} & Props> = ({title, subtitle, body, onSelected, comingSoon = false}) => {

    const containerProps: any = !!onSelected ? {
        onClick: onSelected,
        role: 'button',
        tabIndex: '0',
        selectable: true,
    } : {
        selectable: true,
    }

    return (
        <StyledPreviewContainer fadeOnHover={comingSoon} {...containerProps}>
            <StyledPreviewMain>
                <h3>{title}</h3>
                <p>
                    {subtitle}
                </p>
                {
                    body && (
                        <StyledPreviewBody>
                            {body}
                        </StyledPreviewBody>
                    )
                }
            </StyledPreviewMain>
            {
                comingSoon && (
                    <StyledContactOverlay>
                        <h3>Coming soon</h3>
                        <StyledSmallRoundButton as='a' href={`mailto:hi@example.com?subject=${title} Subscription`}>Contact us</StyledSmallRoundButton>
                    </StyledContactOverlay>
                )
            }
        </StyledPreviewContainer>
    )
}

const CommunityPlanPreview: React.FC<Props> = (props) => {
    return (
        <SubscriptionPlanPreview {...props} title="Creator/Community" subtitle="Pay-as-you-go monthly pricing" body={(
            <>
                <h4>
                    <span>$20</span> / month
                </h4>
                <p>
                    50 user-hours of audio per month + $0.50 additional user-hours
                </p>
                <p>
                    Unlimited users
                </p>
            </>
        )}/>
    )
}

const EventOrganisersPlanPreview: React.FC<Props> = (props) => {
    return (
        <SubscriptionPlanPreview comingSoon title="Event Organisers" subtitle="Pay only for actual usage" body={(
            <>
                <h4>
                    <span>$1</span> / user / hour
                </h4>
                <p>
                    capped at $5/user per day
                </p>
            </>
        )}/>
    )
}

const CompaniesPlanPreview: React.FC<Props> = (props) => {
    return (
        <SubscriptionPlanPreview comingSoon title="Companies" subtitle="For orgs with over 50 employees" body={(
            <>
                <h4>
                    <span>$10</span> / user / month
                </h4>
                <p>
                    includes 10 hours of audio per user
                </p>
                <p>
                    + $0.50 each additional user-hour
                </p>
            </>
        )}/>
    )
}

const StyledPlansContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: center;
  grid-column-gap: ${THEME.spacing.$1b}px;
`

const StyledPlanSectionHeader = styled.header`
  text-align: center;
  margin: ${THEME.spacing.$3}px 0;
  
  h4 {
    font-size: 1.5rem;
    font-weight: 800;
  }
  
`

const StyledHeader = styled.header`
  text-align: center;
`

const StyledFooter = styled.footer`
  margin-top: ${THEME.spacing.$5}px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  h4 {
    text-transform: uppercase;
    margin-bottom: ${THEME.spacing.$1b}px;
  }
  
  ul {
    list-style-type: disc;
    text-align: left;
    font-size: 1.1rem;
    
    > li {
      &:not(:first-child) {
        margin-top: ${THEME.spacing.$1}px;
      }
    }
    
  }
  
`

const SelectPlanView: React.FC<{
    onPlanSelected: (plan: string) => void,
}> = ({onPlanSelected}) => {

    return (
        <section>
            <StyledPlanSectionHeader>
                <h4>
                    Select a Plan
                </h4>
            </StyledPlanSectionHeader>
            <StyledPlansContainer>
                <CommunityPlanPreview onSelected={() => {
                    onPlanSelected(communityTestPlan.id)
                }}/>
                <EventOrganisersPlanPreview onSelected={() => {}}/>
                <CompaniesPlanPreview onSelected={() => {}}/>
            </StyledPlansContainer>
            <StyledFooter>
                <h4>All plans include</h4>
                <ul>
                    <li>
                        Unlimited rooms
                    </li>
                    <li>
                        Unlimited objects
                    </li>
                    <li>
                        Unlimited stages
                    </li>
                    <li>
                        Unlimited 150-stream audio channels
                    </li>
                    <li>
                        Best-of-class spatial audio
                    </li>
                </ul>
            </StyledFooter>
        </section>
    )

}

const StyledOptions = styled.div`
  
    > * {
      &:not(:first-child) {
        margin-top: ${THEME.spacing.$1b}px;
      }
    }

`

const StyledSelectedMethodContainer = styled.div`
  max-width: 400px;
`

const StyledSummaryBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: ${THEME.spacing.$1b}px;
  align-items: center;
  max-width: 700px;
  margin: ${THEME.spacing.$3}px auto;
`

const StyledSubmitWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const SelectPaymentMethodView: React.FC<{
    customerId: string,
    paymentMethods: Stripe.PaymentMethod[],
    fetchPaymentMethods: () => void,
    onChangePlan: () => void,
    selectedPaymentMethod: Stripe.PaymentMethod | null,
    setSelectedPaymentMethod: (method: Stripe.PaymentMethod | null) => void,
    onSubscribe: () => void,
}> = ({customerId, fetchPaymentMethods, paymentMethods, onChangePlan, onSubscribe, selectedPaymentMethod, setSelectedPaymentMethod}) => {

    useEffect(() => {
        fetchPaymentMethods()
    }, [])

    const [newPaymentMethods, setNewPaymentMethods] = useState<Record<string, Stripe.PaymentMethod>>({})
    const [showAddPaymentMethodModal, setShowAddPaymentMethodModal] = useState(false)
    const [showSelectPaymentMethodModal, setShowSelectPaymentMethodModal] = useState(false)

    const allPaymentMethods = useMemo(() => {
        const all: Stripe.PaymentMethod[] = []
        paymentMethods.forEach(method => {
            if (!newPaymentMethods[method.id]) {
                all.push(method)
            }
        })
        Object.values(newPaymentMethods).forEach(method => {
            all.push(method)
        })
        return all
    }, [paymentMethods, newPaymentMethods])

    return (
        <>
            <div>
                <StyledSummaryBody>
                    <div>
                        <CommunityPlanPreview/>
                        <div>
                            <StyledTextHoverButton onClick={onChangePlan}>
                                Change plan
                            </StyledTextHoverButton>
                        </div>
                    </div>
                    <div>
                        {
                            selectedPaymentMethod ? (
                                <>
                                    <StyledSelectedMethodContainer>
                                        <PaymentMethodPreview method={selectedPaymentMethod}/>
                                        <div>
                                            <StyledTextHoverButton onClick={() => {
                                                setSelectedPaymentMethod(null)
                                            }}>
                                                Change payment method
                                            </StyledTextHoverButton>
                                        </div>
                                    </StyledSelectedMethodContainer>
                                </>
                            ) : (
                                <StyledOptions>
                                    {
                                        paymentMethods.length > 0 && (
                                            <StyledSmallRoundButton onClick={() => {
                                                setShowSelectPaymentMethodModal(true)
                                            }}>
                                                Select existing payment method
                                            </StyledSmallRoundButton>
                                        )
                                    }
                                    <StyledSmallRoundButton onClick={() => {
                                        setShowAddPaymentMethodModal(true)
                                    }}>
                                        Add new payment method
                                    </StyledSmallRoundButton>
                                </StyledOptions>
                            )
                        }
                    </div>
                </StyledSummaryBody>
                {
                    selectedPaymentMethod && (
                        <StyledSubmitWrapper>
                            <StyledRoundedButton onClick={onSubscribe}>
                                Begin Subscription
                            </StyledRoundedButton>
                        </StyledSubmitWrapper>
                    )
                }
            </div>
            {
                showAddPaymentMethodModal && (
                    <AddPaymentMethodModal customerId={customerId} onClose={() => {
                        setShowAddPaymentMethodModal(false)
                    }} onCompleted={(paymentMethod) => {
                        setShowAddPaymentMethodModal(false)
                        if (paymentMethod) {
                            setNewPaymentMethods(state => ({
                                ...state,
                                [paymentMethod.id]: paymentMethod,
                            }))
                            setSelectedPaymentMethod(paymentMethod)
                        }
                    }}/>
                )
            }
            {
                showSelectPaymentMethodModal && (
                    <SelectPaymentMethodModal paymentMethods={allPaymentMethods} onSelect={(method) => {
                        setSelectedPaymentMethod(method)
                        setShowSelectPaymentMethodModal(false)
                    }} onClose={() => {
                        setShowSelectPaymentMethodModal(false)
                    }}/>
                )
            }
        </>
    )

}

const StyledEventsHeader = styled.header`
  text-align: center;
  margin-top: ${THEME.spacing.$3}px;
`

const StyledEventsWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: ${THEME.spacing.$1b}px 0 ${THEME.spacing.$3}px 0;
`

const SelectEventsStage: React.FC<{
    subscriptionId: string,
    billingAccountId: string,
    onDone: () => void,
}> = ({subscriptionId, billingAccountId, onDone}) => {
    return (
        <div>
            <StyledEventsHeader>
                <StyledHeading>
                    Add Events to Subscription
                </StyledHeading>
            </StyledEventsHeader>
            <StyledEventsWrapper>
                <AddEventToSubscription subscriptionId={subscriptionId} billingAccountId={billingAccountId} onSelect={() => {

                }}/>
            </StyledEventsWrapper>
            <StyledSubmitWrapper>
                <StyledRoundedButton onClick={onDone}>
                    Done
                </StyledRoundedButton>
            </StyledSubmitWrapper>
        </div>
    )
}

enum Stages {
    SELECT_PLAN,
    SELECT_PAYMENT_METHOD,
    SUBSCRIBING,
    SELECT_EVENTS,
}

const getHeading = (selectedPlan: string) => {

    const plan = getSubscriptionPlanFromId(selectedPlan)

    if (plan && plan.title) {
        return `New '${plan.title}' Subscription`
    }

    return 'New Subscription'

}

const StyledLoadingMessage = styled.div`
  margin-top: ${THEME.spacing.$3}px;
  text-align: center;
`

export const CreateSubscriptionModal: React.FC<{
    eventId?: string,
    customerId: string,
    billingAccountId: string,
    onClose: () => void,
}> = ({customerId, billingAccountId, eventId = '', onClose}) => {

    const [createdSubscriptionId, setCreatedSubscriptionId] = useState('')
    const [selectedPlan, setSelectedPlan] = useState('')
    const [stage, setStage] = useState<Stages>(Stages.SELECT_PLAN)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Stripe.PaymentMethod | null>(null)

    const {
        loading,
        loaded,
        paymentMethods,
        setPaymentMethods,
        fetch: fetchPaymentMethods,
    } = useCustomerPaymentMethods(customerId)

    const history = useHistory();

    const onSubscribe = () => {
        setStage(Stages.SUBSCRIBING)

        const subscription = getSubscriptionPlanFromId(selectedPlan)

        if (!subscription) {
            console.error('No subscription')
            return
        }

        if (!selectedPaymentMethod) {
            return
        }

        createStripeSubscription(customerId, getSubscriptionPriceId(subscription), billingAccountId, subscription.planCategory, selectedPaymentMethod.id)
            .then(({subscriptionId}) => {
                setCreatedSubscriptionId(subscriptionId)

                if (eventId) {
                    addEventToSubscription(subscriptionId, billingAccountId, eventId)
                        .finally(() => {
                            setStage(Stages.SELECT_EVENTS)
                        })
                } else {
                    setStage(Stages.SELECT_EVENTS)
                }

            })

    }

    const onComplete = () => {
        onClose()
        history.push(`/billing/account/${billingAccountId}/subscription/${createdSubscriptionId}`)
    }

    return (
        <Modal extraWide isOpen onRequestClose={onClose}>
            <div>
                <StyledHeader>
                    <StyledLargeHeading>
                        {
                            stage === Stages.SELECT_EVENTS ? (
                                <>
                                    Subscription Created
                                </>
                            ) : (
                                <>
                                    {getHeading(selectedPlan)}
                                </>
                            )
                        }
                    </StyledLargeHeading>
                </StyledHeader>
                {
                    stage === Stages.SELECT_PLAN && (
                        <SelectPlanView onPlanSelected={(plan: string) => {
                            setSelectedPlan(plan)
                            setStage(Stages.SELECT_PAYMENT_METHOD)
                        }}/>
                    )
                }
                {
                    stage === Stages.SELECT_PAYMENT_METHOD && (
                        <SelectPaymentMethodView onChangePlan={() => {
                            setStage(Stages.SELECT_PLAN)
                        }} customerId={customerId} paymentMethods={paymentMethods}
                                                 selectedPaymentMethod={selectedPaymentMethod}
                                                 setSelectedPaymentMethod={setSelectedPaymentMethod}
                                                 fetchPaymentMethods={fetchPaymentMethods} onSubscribe={onSubscribe}/>
                    )
                }
                {
                    stage === Stages.SUBSCRIBING && (
                        <StyledLoadingMessage>
                            Creating subscription....
                        </StyledLoadingMessage>
                    )
                }
                {
                    stage === Stages.SELECT_EVENTS && (
                        <SelectEventsStage subscriptionId={createdSubscriptionId} billingAccountId={billingAccountId} onDone={onComplete}/>
                    )
                }
            </div>
        </Modal>
    )
}
