import React, {useEffect, useState} from "react";
import Modal from "../../components/Modal";
import {Stripe} from "stripe";
import { StyledHeading } from "../../ui/typography/headings";
import {PaymentMethodCardPreview, PaymentMethodNamePreview} from "./PaymentMethodPreview";
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import {StyledSmallRoundButton} from "../../ui/buttons";
import {detachPaymentMethod, fetchCustomerSubscriptions, getCustomerPaymentMethods} from "../../firebase/events";
import { Link } from "react-router-dom";

const StyledHeader = styled.header`
  text-align: center;
  margin-bottom: ${THEME.spacing.$2}px;
`

const StyledFooter = styled.footer`
  margin-top: ${THEME.spacing.$2}px;
`

const getActiveSubscriptions = (subscriptions: Stripe.Subscription[]): Stripe.Subscription[] => {

    return subscriptions.filter(subscription => {
        return subscription.status === 'active'
    })

}

const getSubscriptionsUsingPaymentMethod = (id: string, subscriptions: Stripe.Subscription[]): Stripe.Subscription[] => {

    return subscriptions.filter(subscription => {
        return subscription.default_payment_method === id && subscription.status === 'active'
    })

}

const StyledErrorSection = styled.div`
  margin-top: ${THEME.spacing.$1b}px;
  
  p {
    margin: ${THEME.spacing.$1b}px 0;
  }
  
  li {
    margin-top: ${THEME.spacing.$1}px;
  }
  
  a {
    color: inherit;
  }
  
`

export const DeletePaymentMethodModal: React.FC<{
    billingAccountId: string,
    customerId: string,
    method: Stripe.PaymentMethod,
    onClose: () => void,
    onDelete: () => void,
}> = ({billingAccountId, customerId, onClose, onDelete, method}) => {

    const [error, setError] = useState(false)
    const [busy, setBusy] = useState(false)
    const [connectedSubscriptions, setConnectedSubscriptions] = useState<Stripe.Subscription[]>([])
    const [isFinalCard, setIsFinalCard] = useState(false)

    const deleteCard = async () => {
        if (busy) return
        setBusy(true)
        setConnectedSubscriptions([])
        setIsFinalCard(false)

        let canDelete = true

        const customerSubscriptions = await fetchCustomerSubscriptions(customerId)

        const subscriptions = getSubscriptionsUsingPaymentMethod(method.id, customerSubscriptions.data)
        const activeSubscriptions = getActiveSubscriptions(customerSubscriptions.data)

        if (subscriptions.length > 0) {
            canDelete = false
            setConnectedSubscriptions(subscriptions)
        }

        const paymentMethods = await getCustomerPaymentMethods(customerId)

        if (paymentMethods.length <= 1 && activeSubscriptions.length > 0) {
            canDelete = false
            setIsFinalCard(true)
        }

        if (canDelete) {
            detachPaymentMethod(method.id)
                .then(() => {
                    onDelete()
                })
                .catch((error) => {
                    console.error(error)
                    setError(true)
                    setBusy(false)
                })
        } else {
            setError(true)
            setBusy(false)
        }

    }

    return (
        <Modal isOpen onRequestClose={onClose}>
            <div>
                <StyledHeader>
                    <StyledHeading>
                        Delete Card
                    </StyledHeading>
                </StyledHeader>
                <div>
                    <PaymentMethodNamePreview method={method}/>
                    <PaymentMethodCardPreview method={method}/>
                </div>
                <StyledFooter>
                    <StyledSmallRoundButton fullWidth onClick={deleteCard}>
                        {
                            busy ? "Deleting..." : "Delete Card"
                        }
                    </StyledSmallRoundButton>
                    {
                        error && (
                            <StyledErrorSection>
                                <h4>
                                    Unable to delete the card.
                                </h4>
                                {
                                    (connectedSubscriptions.length > 0) && (
                                        <div>
                                            <p>
                                                Please remove this card from the following subscriptions:
                                            </p>
                                            <ul>
                                                {
                                                    connectedSubscriptions.map((subscription) => (
                                                        <li key={subscription.id}>
                                                            <a href={`/billing/account/${billingAccountId}/subscription/${subscription.id}`} target={'_blank'}>
                                                                Subscription ({subscription.id})
                                                            </a>
                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        </div>
                                    )
                                }
                                {
                                    isFinalCard && (
                                        <div>
                                            <p>
                                                You have active subscriptions, so you need to add another card before you can delete this one.
                                            </p>
                                        </div>
                                    )
                                }
                            </StyledErrorSection>
                        )
                    }
                </StyledFooter>
            </div>
        </Modal>
    );
};
