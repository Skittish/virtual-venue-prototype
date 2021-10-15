import {Elements, CardElement, useStripe, useElements} from '@stripe/react-stripe-js';
import React, {useEffect, useMemo, useState} from "react"
import {Link, useParams} from "react-router-dom";
import {getBillingAccountRef, getBillingAccountSubscriptionsRef} from "../../firebase/firestore/refs";
import {
    createCustomerSetupIntent,
    createStripeSubscription,
    getCustomerPaymentMethods,
    setCustomerDefaultPaymentMethod
} from "../../firebase/events";
import Modal from "../../components/Modal";
import {stripePromise} from "../../stripe/stripe";
import styled, {css} from "styled-components";
import {THEME} from "../../ui/theme";
import {FirestoreSubscriptionData} from "../../firebase/firestore/types";
import {SubscriptionPreview} from "./SubscriptionPreview";
import Stripe from "stripe";
import {BillingAccountSubscriptions} from "./BillingAccountSubscriptions";
import {BillingPaymentSection} from "./BillingPaymentSection";
import { Context } from './BillingAccountScreen.context';
import { StyledLargeHeading } from '../../ui/typography/headings';
import {getBillingAccountName} from "../../firebase/firestore/billingAccount";
import {StyleBackLink} from "./SubscriptionScreen";
import {FaArrowLeft} from "react-icons/all";

const StyledCardInputWrapper = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: ${THEME.spacing.$1b}px;
`

export const AddPaymentMethodModal: React.FC<{
    customerId: string,
    billingAccountId: string,
    onClose: () => void,
}> = ({customerId, billingAccountId, onClose}) => {

    const stripe = useStripe();
    const elements = useElements();
    const [name, setName] = useState('')

    const handleSubmit = async (event: any) => {
        // Block native form submission.
        event.preventDefault();

        console.log('created stripe subscription')

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            return;
        }

        // Get a reference to a mounted CardElement. Elements knows how
        // to find your CardElement because there can only ever be one of
        // each type of element.
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            return
        }

        const setupIntent = await createCustomerSetupIntent(customerId)

        // Use your card Element with other Stripe.js APIs
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            console.log('[error]', error);
            return
        }

        if (!setupIntent.client_secret) {
            console.log('no client secret')
            return
        }

        console.log('[PaymentMethod]', paymentMethod);
        // todo - subscribe...

        stripe.confirmCardSetup(setupIntent.client_secret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name,
                },
            }
        }).then((result) => {
            if(result.error) {
                alert(result.error.message);
            } else {

                if (result.setupIntent.payment_method) {
                    void setCustomerDefaultPaymentMethod(customerId, result.setupIntent.payment_method)
                }

                console.log('card successfully added')

            }
        });

    };

    return (
        <Modal isOpen onRequestClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div>
                    <input value={name} onChange={event => setName(event.target.value)} type="text" placeholder="Name"/>
                </div>
                <StyledCardInputWrapper>
                    <CardElement
                        options={{
                            hidePostalCode: true,
                            style: {
                                base: {
                                    iconColor: '#FFF',
                                    fontSize: '16px',
                                    color: '#FFF',
                                    '::placeholder': {
                                        color: 'rgba(255,255,255,0.66)',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                                complete: {
                                    iconColor: '#FFF',
                                },
                            },
                        }}
                    />
                </StyledCardInputWrapper>
                <div>
                    <button type="submit">
                        Subscribe
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export const InvoicesSection: React.FC = () =>
{
    return (
        <div>
            Display invoices
        </div>
    )
}

export type BillingAccount =
{
    creatorId: string,
        stripeCustomerId
:
    string,
}

export const cssContainer = css`
  max-width: 960px;
  margin: ${THEME.spacing.$6}px auto;
`

export const StyledContainer = styled.div`
  ${cssContainer};
  display: grid;
  grid-template-columns: 1fr auto;
  grid-column-gap: ${THEME.spacing.$2}px;
`

export const BillingAccountScreen: React.FC = () =>
{

    const {id} = useParams<{
        id: string,
    }>()

    const [billingAccount, setBillingAccount] = useState<BillingAccount | null>(null)

    useEffect(() => {

        const ref = getBillingAccountRef(id)

        ref.onSnapshot(snapshot => {
            setBillingAccount(snapshot.data() as BillingAccount)
        })

    }, [id])

    console.log('billingAccount', billingAccount)

    const {stripeCustomerId = ''} = billingAccount ?? {}

    return (
        <Context.Provider value={{billingAccountId: id,}}>
            <Elements stripe={stripePromise}>
                <StyledContainer>
                    <div>
                        <header>
                            <StyleBackLink as={Link} to={`/billing`}>
                                <FaArrowLeft size={12}/>
                                Back to billing accounts
                            </StyleBackLink>
                            <StyledLargeHeading>
                                {billingAccount ? getBillingAccountName(billingAccount, id) : 'Loading...'}
                            </StyledLargeHeading>
                        </header>
                        <BillingAccountSubscriptions billingAccountId={id} customerId={stripeCustomerId}/>
                    </div>
                    <div>
                        <BillingPaymentSection billingAccountId={id} stripeCustomerId={stripeCustomerId}/>
                    </div>
                </StyledContainer>
            </Elements>
        </Context.Provider>
    )
}
