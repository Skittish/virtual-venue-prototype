import React, {useState} from "react"
import Modal from "../../components/Modal";
import {StyledHeading} from "../../ui/typography/headings";
import {StyledContainer} from "./CancelSubscriptionModal";
import {StyledSmallRoundButton} from "../../ui/buttons";
import {FirestoreSubscriptionData} from "../../firebase/firestore/types";
import {useSubscriptionCurrentPeriodEnd} from "./SubscriptionPreview";
import {undoCancelSubscription} from "../../firebase/events";
import {Stripe} from "stripe";

export const UndoCancelSubscriptionModal: React.FC<{
    onClose: () => void,
    subscription: FirestoreSubscriptionData,
    onComplete: (response: Stripe.Response<Stripe.Subscription>) => void,
}> = ({subscription, onComplete, onClose}) => {

    const currentPeriodEnd = useSubscriptionCurrentPeriodEnd(subscription)

    const [busy, setBusy] = useState(false)
    const [completed, setCompleted] = useState(false)

    const undo = () => {
        if (busy) return
        setBusy(true)
        undoCancelSubscription(subscription.id) .then((response) => {
            onComplete(response)
            setCompleted(true)
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
                    Undo Cancellation
                </StyledHeading>
                {
                    completed ? (
                        <>
                            <p>
                                Cancellation undone.
                            </p>
                            <p>
                                This subscription will no longer be canceled on {currentPeriodEnd}.
                            </p>
                            <div>
                                <StyledSmallRoundButton onClick={onClose}>
                                    Done
                                </StyledSmallRoundButton>
                            </div>
                        </>
                    ) : (
                        <>
                            <p>
                                This subscription will no longer be canceled on {currentPeriodEnd}.
                            </p>
                            <div>
                                <StyledSmallRoundButton onClick={undo}>
                                    {
                                        busy ? "Processing..." : "Undo cancellation"
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
