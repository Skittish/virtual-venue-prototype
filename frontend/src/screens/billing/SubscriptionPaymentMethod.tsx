import React, {useMemo, useState} from "react"
import {StyledSmallRoundButton} from "../../ui/buttons";
import {useCustomerPaymentMethods} from "./BillingPaymentSection";
import {Stripe} from "stripe";
import {updateSubscriptionPaymentMethod} from "../../firebase/events";
import {FirestoreSubscriptionData} from "../../firebase/firestore/types";
import {SelectPaymentMethodModal} from "./SelectPaymentMethodModal";
import {PaymentMethodPreview} from "./PaymentMethodPreview";
import {THEME} from "../../ui/theme";
import styled from "styled-components";
import { StyledHeading } from "../../ui/typography/headings";

const StyledContainer = styled.div`
  margin-top: ${THEME.spacing.$2}px;
  margin-left: ${THEME.spacing.$2}px;
  max-width: 400px;
  
  button {
    margin-top: ${THEME.spacing.$1b}px;
  }
  
`

export const SubscriptionPaymentMethod: React.FC<{
    customerId: string,
    subscription: FirestoreSubscriptionData,
}> = ({customerId, subscription}) => {

    const {
        default_payment_method
    } = subscription

    const [showSelectPaymentMethodModal, setShowSelectPaymentMethodModal] = useState(false)

    const {
        loaded: loadedPaymentMethods,
        loading: loadingPaymentMethods,
        paymentMethods,
    } = useCustomerPaymentMethods(customerId)

    const [updatingPaymentMethod, setUpdatingPaymentMethod] = useState(false)

    const onNewPaymentMethodSelected = (method: Stripe.PaymentMethod) => {
        setUpdatingPaymentMethod(true)
        console.log('onNewPaymentMethodSelected', method)
        updateSubscriptionPaymentMethod(subscription.id, method.id)
            .finally(() => {
                setUpdatingPaymentMethod(false)
            })
    }

    const paymentMethod = useMemo(() => {
        if (!default_payment_method) return null
        return paymentMethods.find((method) => method.id === default_payment_method)
    }, [default_payment_method, paymentMethods])

    console.log('paymentMethod', paymentMethod)

    return (
        <>
            <StyledContainer>
                <StyledHeading>Payment Method</StyledHeading>
                {
                    loadedPaymentMethods ? (
                        <>
                            {
                                paymentMethod ? (
                                    <PaymentMethodPreview method={paymentMethod}/>
                                ) : (
                                    <p>
                                        No payment method specified. Your default payment method will be used.
                                    </p>
                                )
                            }
                            <StyledSmallRoundButton onClick={() => {
                                setShowSelectPaymentMethodModal(true)
                            }}>
                                {
                                    updatingPaymentMethod ? "Updating..." : paymentMethod ? "Change payment method" : "Set payment method"
                                }
                            </StyledSmallRoundButton>
                        </>
                    ) : (
                        <div>
                            Loading...
                        </div>
                    )
                }
            </StyledContainer>

            {
                showSelectPaymentMethodModal && (
                    <SelectPaymentMethodModal paymentMethods={paymentMethods} onClose={() => {
                        setShowSelectPaymentMethodModal(false)
                    }} onSelect={onNewPaymentMethodSelected}/>
                )
            }
        </>
    )
}
