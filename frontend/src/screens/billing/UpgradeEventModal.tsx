import React, {useEffect, useState} from "react"
import Modal from "../../components/Modal"
import {getBillingAccountSubscriptionsRef} from "../../firebase/firestore/refs";
import {FirestoreSubscriptionData} from "../../firebase/firestore/types";
import { StyledRoundedButton, StyledSmallRoundButton } from "../../ui/buttons";
import { StyledHeading } from "../../ui/typography/headings";
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import {getSubscriptionName} from "./SubscriptionPreview";
import {StyledLightButton} from "./AddEventModal";
import {addEventToSubscription} from "../../firebase/events";
import {useHistory} from "react-router-dom";

const StyledHeader = styled.header`
  text-align: center;
`

const StyledFooter = styled.footer`
    margin-top: ${THEME.spacing.$3}px;
    display: flex;
    justify-content: center;
    align-items: center;

    span {
      margin-right: ${THEME.spacing.$1b}px;
    }

`

const StyledList = styled.ul`
  margin-top: ${THEME.spacing.$2}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  > li {
    
    &:not(:first-child) {
      margin-top: ${THEME.spacing.$1b}px;
    }
    
  }

`

export const UpgradeEventModal: React.FC<{
    eventId: string,
    billingAccountId: string,
    onClose: () => void,
    onCreateNewSubscription: (eventId: string) => void,
}> = ({billingAccountId, eventId, onClose, onCreateNewSubscription}) => {

    const [subscriptionsLoaded, setSubscriptionsLoaded] = useState(false)
    const [subscriptions, setSubscriptions] = useState<Record<string, FirestoreSubscriptionData>>({})
    const [promptToSelect, setPromptToSelect] = useState(false)

    const openCreateNewSubscriptionModal = () => {
        onCreateNewSubscription(eventId)
        onClose()
    }

    useEffect(() => {

        // todo - load all subscriptions belonging to this billing account...

        const ref = getBillingAccountSubscriptionsRef(billingAccountId)

        ref.get().then(snapshot => {

            console.log('loaded subscriptions...')
            const data: Record<string, FirestoreSubscriptionData> = {}

            snapshot.docs.forEach(doc => {
                const subscription = doc.data() as FirestoreSubscriptionData
                // only include active subscriptions...
                if (subscription.status === 'active') {
                    data[doc.id] = subscription
                }
            })

            setSubscriptions(data)
            setSubscriptionsLoaded(true)

        })

    }, [billingAccountId])

    const history = useHistory();

    useEffect(() => {
        if (subscriptionsLoaded) {

            if (Object.keys(subscriptions).length > 0) {
                setPromptToSelect(true)
            } else {
                openCreateNewSubscriptionModal()
            }

        }
    }, [subscriptions, subscriptionsLoaded])

    const [addingEventToSubscription, setAddingEventToSubscription] = useState(false)

    const addToSubscription = (subscriptionId: string) => {
        setAddingEventToSubscription(true)
        addEventToSubscription(subscriptionId, billingAccountId, eventId)
            .then(() => {
                history.replace(`/billing/account/${billingAccountId}/subscription/${subscriptionId}`)
            })
            .catch((error) => {
                console.error(error)
                setAddingEventToSubscription(false)
            })
    }

    return (
        <Modal wider isOpen onRequestClose={() => {
            history.replace(`/billing/account/${billingAccountId}`)
            onClose()
        }}>
            <div>
                {
                    addingEventToSubscription ? (
                        <div>
                            adding to subscription...
                        </div>
                    ) : !subscriptionsLoaded ? (
                        <div>
                            loading...
                        </div>
                    ) : (
                        <>
                            {
                                promptToSelect && (
                                    <div>
                                        <section>
                                            <StyledHeader>
                                                <StyledHeading>
                                                    Add event '{eventId}' to an existing subscription
                                                </StyledHeading>
                                            </StyledHeader>
                                            <StyledList>
                                                {
                                                    Object.entries(subscriptions).map(([subscriptionId, subscription]) => (
                                                        <li key={subscriptionId}>
                                                            <StyledLightButton onClick={() => {
                                                                addToSubscription(subscriptionId)
                                                            }}>
                                                                {getSubscriptionName(subscription)}
                                                            </StyledLightButton>
                                                        </li>
                                                    ))
                                                }
                                            </StyledList>
                                        </section>
                                        <StyledFooter>
                                            <span>
                                                or
                                            </span>
                                            <StyledSmallRoundButton onClick={openCreateNewSubscriptionModal}>
                                                Create new subscription
                                            </StyledSmallRoundButton>
                                        </StyledFooter>
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </div>
        </Modal>
    )
}
