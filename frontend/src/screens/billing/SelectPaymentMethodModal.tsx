import React, {useEffect, useState} from "react"
import Modal from "../../components/Modal"
import {Stripe} from "stripe";
import {PaymentMethodPreview} from "./PaymentMethodPreview";
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import {getCustomerPaymentMethods} from "../../firebase/events";

const StyledList = styled.ul`
  max-height: 400px;
  overflow-y: auto;

    > li {
      &:not(:first-child) {
        margin-top: ${THEME.spacing.$1b}px;
      }
    }

`

export const SelectPaymentMethodModal: React.FC<{
    customerId?: string,
    paymentMethods?: Stripe.PaymentMethod[],
    onClose: () => void,
    onSelect: (method: Stripe.PaymentMethod) => void,
}> = ({customerId, onClose, paymentMethods: passedPaymentMethods, onSelect}) => {

    const [loading, setLoading] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [fetchedPaymentMethods, setPaymentMethods] = useState<Stripe.PaymentMethod[]>([])

    const loadPaymentMethods = !passedPaymentMethods
    const paymentMethods = passedPaymentMethods ?? fetchedPaymentMethods

    useEffect(() => {
        if (!loadPaymentMethods) return

        if (!customerId) return

        setLoading(true)

        getCustomerPaymentMethods(customerId)
            .then((response) => {
                console.log('fetched payment methods', response)
                setPaymentMethods(response)
                setLoaded(true)
                setLoading(false)
            })


    }, [loadPaymentMethods, customerId])

    return (
        <Modal isOpen onRequestClose={onClose} wider>
            <div>
                {
                    loading && (
                        <div>
                            Loading...
                        </div>
                    )
                }
                <StyledList>
                    {
                        paymentMethods.map(method => (
                            <li key={method.id}>
                                <PaymentMethodPreview onSelect={() => {
                                    onSelect(method)
                                    onClose()
                                }} method={method}/>
                            </li>
                        ))
                    }
                </StyledList>
            </div>
        </Modal>
    )
}
