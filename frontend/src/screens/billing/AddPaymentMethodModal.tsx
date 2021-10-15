import React, {useState} from "react";
import {CardElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {createCustomerSetupIntent, setCustomerDefaultPaymentMethod} from "../../firebase/events";
import Modal from "../../components/Modal";
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import { StyledHeading } from "../../ui/typography/headings";
import { StyledSmallRoundButton } from "../../ui/buttons";
import {StyledInput} from "../../ui/inputs";
import {Stripe} from "stripe";

const StyledInputWrapper = styled.div`
  margin-top: ${THEME.spacing.$1b}px;
`

const StyledCardInputWrapper = styled(StyledInputWrapper)`
  background-color: rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  padding: ${THEME.spacing.$1b}px;
`

const StyledHeader = styled.header`
  margin-bottom: ${THEME.spacing.$2}px;
  text-align: center;
`

const StyledSubmitWrapper = styled.div`
  margin-top: ${THEME.spacing.$1b}px;
`

export const AddPaymentMethodModal: React.FC<{
    customerId: string,
    onClose: () => void,
    onCompleted: (paymentMethod?: Stripe.PaymentMethod) => void,
}> = ({customerId, onClose, onCompleted}) => {

    const stripe = useStripe();
    const elements = useElements();
    const [name, setName] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (event: any) => {
        // Block native form submission.
        event.preventDefault();

        if (submitting) return

        setSubmitting(true)

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            setSubmitting(false)
            return;
        }

        // Get a reference to a mounted CardElement. Elements knows how
        // to find your CardElement because there can only ever be one of
        // each type of element.
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setSubmitting(false)
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
            setSubmitting(false)
            return
        }

        if (!setupIntent.client_secret) {
            console.log('no client secret')
            setSubmitting(false)
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

                onCompleted({
                    ...paymentMethod,
                    id: result.setupIntent.payment_method,
                } as unknown as Stripe.PaymentMethod)

            }
        });

    };

    return (
        <Modal isOpen onRequestClose={onClose}>
            <form onSubmit={handleSubmit}>
                <StyledHeader>
                    <StyledHeading>
                        Add Payment Method
                    </StyledHeading>
                </StyledHeader>
                <StyledInputWrapper>
                    <StyledInput slim slimmer smallerFont fullWidth value={name} onChange={event => setName(event.target.value)} type="text" placeholder="Name"/>
                </StyledInputWrapper>
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
                <StyledSubmitWrapper>
                    <StyledSmallRoundButton fullWidth type="submit">
                        {
                            submitting ? "Submitting..." : "Add Card"
                        }
                    </StyledSmallRoundButton>
                </StyledSubmitWrapper>
            </form>
        </Modal>
    )
}
