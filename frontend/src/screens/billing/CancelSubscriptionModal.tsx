import React, {useEffect, useState} from "react"
import Modal from "../../components/Modal"
import { StyledSmallRoundButton } from "../../ui/buttons"
import { StyledHeading } from "../../ui/typography/headings"
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import {FirestoreSubscriptionData} from "../../firebase/firestore/types";
import {cancelSubscription} from "../../firebase/events";
import {useSubscriptionCurrentPeriodEnd} from "./SubscriptionPreview";

export const StyledContainer = styled.div`
  text-align: center;
  
  h3 {
    margin-bottom: ${THEME.spacing.$2}px;
  }
  
  p {
    margin-top: ${THEME.spacing.$1b}px;
  }
  
  button {
    margin-top: ${THEME.spacing.$2}px;
  }
  
`

export const CancelSubscriptionModal: React.FC<{
    subscription: FirestoreSubscriptionData,
    onClose: () => void,
    onComplete: (updatedSubscription: any) => void,
}> = ({subscription, onClose, onComplete}) => {

    const currentPeriodEnd = useSubscriptionCurrentPeriodEnd(subscription)

    const [busy, setBusy] = useState(false)
    const [cancelled, setCancelled] = useState(false)

    const cancel = () => {
        if (busy) return
        setBusy(true)

        cancelSubscription(subscription.id)
            .then((response) => {
                onComplete(response)
                setCancelled(true)
                setBusy(false)
            })
            .catch((error) => {
                console.error(error)
            })

    }

    return (
        <Modal isOpen onRequestClose={onClose}>
            <StyledContainer>
                <StyledHeading>
                    Cancel Subscription
                </StyledHeading>
                {
                    cancelled ? (
                        <>
                            <p>
                                Subscription cancelled.
                            </p>
                            <p>
                                Your subscription will remain active until {currentPeriodEnd} upon which you will receive your final invoice.
                            </p>
                            <div>
                                <StyledSmallRoundButton onClick={onClose}>
                                    Close
                                </StyledSmallRoundButton>
                            </div>
                        </>
                    ) : (
                        <>
                            <p>
                                Your subscription will remain active until {currentPeriodEnd} upon which you will receive your final invoice.
                            </p>
                            <div>
                                <StyledSmallRoundButton alert onClick={cancel}>
                                    {
                                        busy ? "Cancelling..." : "Cancel subscription"
                                    }
                                </StyledSmallRoundButton>
                            </div>
                        </>
                    )
                }
            </StyledContainer>
        </Modal>
    )
}
