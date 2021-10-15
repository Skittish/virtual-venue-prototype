import React, {useEffect, useMemo, useState} from "react";
import Stripe from "stripe";
import {getCustomerPaymentMethods} from "../../firebase/events";
import {PaymentMethodPreview} from "./PaymentMethodPreview";
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import { StyledHeading } from "../../ui/typography/headings";
import { StyledSmallRoundButton } from "../../ui/buttons";
import {AddPaymentMethodModal} from "./AddPaymentMethodModal";
import {DeletePaymentMethodModal} from "./DeletePaymentMethodModal";

const StyledHeader = styled.header`
`

export const StyledOptions = styled.div`
  margin: ${THEME.spacing.$1b}px 0; 
`

const StyledList = styled.ul`

    > li {
      
      &:not(:first-child) {
        margin-top: ${THEME.spacing.$1b}px;
      }
      
    }

`

export const useCustomerPaymentMethods = (customerId: string) => {


    const [loading, setLoading] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [paymentMethods, setPaymentMethods] = useState<Stripe.PaymentMethod[]>([])

    const {
        fetch,
    } = useMemo(() => ({
        fetch: () => {

            if (!customerId) return

            setLoading(true)

            getCustomerPaymentMethods(customerId)
                .then((response) => {
                    setPaymentMethods(response)
                    setLoaded(true)
                    setLoading(false)
                })
        }
    }), [customerId])



    useEffect(() => {

        fetch()

    }, [fetch])

    return {
        loading,
        loaded,
        fetch,
        paymentMethods,
        setPaymentMethods,
    }

}

export const BillingPaymentSection: React.FC<{
    billingAccountId: string,
    stripeCustomerId: string,
}> = ({billingAccountId, stripeCustomerId}) => {

    const {
        loading,
        loaded,
        paymentMethods,
        setPaymentMethods,
        fetch: fetchPaymentMethods,
    } = useCustomerPaymentMethods(stripeCustomerId)

    const [showAddPaymentMethodModal, setShowAddPaymentMethodModal] = useState(false)
    const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<Stripe.PaymentMethod | null>(null)

    const {
        showDeleteCardModal,
    } = useMemo(() => ({
        showDeleteCardModal: (id: string) => {
            const matchedMethod = paymentMethods.find((method) => method.id === id)
            if (matchedMethod) {
                setPaymentMethodToDelete(matchedMethod)
            }
        },
    }), [paymentMethods])

    const {
        onDeletePaymentMethod,
    } = useMemo(() => ({
        onDeletePaymentMethod: () => {
            if (!paymentMethodToDelete) return
            setPaymentMethods(state => {
                return state.filter(method => method.id !== paymentMethodToDelete.id)
            })
            setPaymentMethodToDelete(null)
            fetchPaymentMethods()
        }
    }), [paymentMethodToDelete, fetchPaymentMethods])

    return (
        <>
            <StyledHeader>
                <StyledHeading>Payment Methods</StyledHeading>
            </StyledHeader>
            <StyledOptions>
                <StyledSmallRoundButton onClick={() => {
                    setShowAddPaymentMethodModal(true)
                }}>
                    Add new payment method
                </StyledSmallRoundButton>
            </StyledOptions>
            {
                loaded ? (
                    <StyledList>
                        {
                            paymentMethods.map((method) => (
                                <li key={method.id}>
                                    <PaymentMethodPreview method={method} onDelete={(id: string) => {
                                        showDeleteCardModal(id)
                                    }}/>
                                </li>
                            ))
                        }
                    </StyledList>
                ) : (
                    <div>
                        loading payment methods...
                    </div>
                )
            }
            {
                showAddPaymentMethodModal && (
                    <AddPaymentMethodModal customerId={stripeCustomerId} onClose={() => {
                        setShowAddPaymentMethodModal(false)
                    }} onCompleted={() => {
                        setShowAddPaymentMethodModal(false)
                        fetchPaymentMethods()
                    }}/>
                )
            }
            {
                paymentMethodToDelete && (
                    <DeletePaymentMethodModal billingAccountId={billingAccountId} customerId={stripeCustomerId} method={paymentMethodToDelete} onClose={() => {
                        setPaymentMethodToDelete(null)
                    }} onDelete={onDeletePaymentMethod}/>
                )
            }
        </>
    )
}
