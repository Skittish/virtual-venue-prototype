import React, {useEffect, useState} from "react"
import Modal from "../../components/Modal"
import { StyledHeading } from "../../ui/typography/headings"
import {getFirestoreEventsRef} from "../../firebase/firestore/refs";
import {useCurrentUserId} from "../../state/auth";
import {FirestoreEventData} from "../../firebase/firestore/types";
import {EventPreview} from "./EventPreview";
import styled from "styled-components";
import {cssResetButton} from "../../ui/buttons";
import {StyledContainer} from "./PaymentMethodPreview";
import {THEME} from "../../ui/theme";
import {addEventToSubscription} from "../../firebase/events";
import {FaArrowsAltH, FaCheck} from "react-icons/all";
import {fetchFirestoreEvent} from "../../firebase/firestore/events";

export const useUserEvents = () => {

    const [data, setData] = useState<Record<string, FirestoreEventData>>({})
    const [loaded, setLoaded] = useState(false)
    const userId = useCurrentUserId()

    useEffect(() => {

        const ref = getFirestoreEventsRef()

        const query = ref.where('creatorId', '==', userId)

        query.get()
            .then(querySnapshot => {
                const results: Record<string, FirestoreEventData> = {}
                querySnapshot.forEach((doc) => {
                    results[doc.id] = doc.data() as FirestoreEventData
                })
                setData(results)
                setLoaded(true)
            })
            .catch((error) => {
                console.warn('Failed to get user events')
                console.error(error)
            })

    }, [userId])

    return {
        data,
        loaded,
        setData,
    }

}

export const StyledLightButton = styled.button`
    ${cssResetButton};
    border: 2px solid rgba(0,0,0,0.1);
    padding: 4px 10px;
    border-radius: 8px;
  
      &:disabled {
        opacity: 0.75;
        border-color: rgba(0,0,0,0.05);
      }
  
    &:not(:disabled) {
  
        &:focus,
        &:hover {
          background-color: rgba(0,0,0,0.1);
        }
      
    }
  
`

const StyledList = styled.ul`
    margin-top: ${THEME.spacing.$1b}px;

    > li {
      
      &:not(:first-child) {
        margin-top: ${THEME.spacing.$1}px;
      }
      
    }

`

const AddingEventView: React.FC<{
    event: FirestoreEventData,
    id: string,
}> = ({event, id}) => {

    return (
        <div>
            Adding {id}...
        </div>
    )

}

const StyledHeader = styled.header`
  margin-bottom: ${THEME.spacing.$1b}px;
`

const StyledMessage = styled.span`
  font-size: 0.8em;
  margin-left: ${THEME.spacing.$1}px;
`

const getEventConnectedSubscription = (event: FirestoreEventData): string => {
    return event.connectedSubscription ? event.connectedSubscription.subscriptionId : ''
}

export const AddEventToSubscription: React.FC<{
    subscriptionId: string,
    billingAccountId: string,
    onSelect: (id: string, event: FirestoreEventData) => void,
}> = ({onSelect, subscriptionId, billingAccountId}) => {

    const [busy, setBusy] = useState(false)
    const [eventBeingAdded, setEventBeingAdded] = useState<any>(null)

    const {
        data,
        loaded,
        setData,
    } = useUserEvents()

    const handleAddEventToSubscription = (id: string, event: FirestoreEventData) => {
        if (busy) return
        setBusy(true)
        addEventToSubscription(subscriptionId, billingAccountId, id)
            .then(() => {
                fetchFirestoreEvent(id)
                    .then((updatedEvent) => {
                        if (updatedEvent) {
                            setData(prevState => ({
                                ...prevState,
                                [id]: updatedEvent as FirestoreEventData,
                            }))
                        }
                        setBusy(false)
                    })
                onSelect(id, event)
            })
            .catch((error) => {
                console.error(error)
            })
    }

    const selectEvent = (id: string, event: FirestoreEventData) => {
        setEventBeingAdded({
            id,
            event,
        })
        handleAddEventToSubscription(id, event)
    }

    return (
            <div>
                {
                    (busy && eventBeingAdded) ? (
                        <AddingEventView id={eventBeingAdded.id} event={eventBeingAdded.event}/>
                    ) : (
                        <section>
                            {
                                loaded ? (
                                    <StyledList>
                                        {
                                            Object.entries(data).map(([id, event]) => {
                                                const connectedSubscription = getEventConnectedSubscription(event)
                                                const alreadyConnected = !!connectedSubscription && connectedSubscription === subscriptionId
                                                const connectedToAnotherEvent = !!connectedSubscription && !alreadyConnected
                                                return (
                                                    <li key={id}>
                                                        <div>
                                                            <StyledLightButton onClick={() => {
                                                                selectEvent(id, event)
                                                            }} disabled={alreadyConnected}>
                                                                {id}
                                                            </StyledLightButton>
                                                            {
                                                                alreadyConnected && (
                                                                    <StyledMessage>
                                                                        <FaCheck size={10}/> Connected
                                                                    </StyledMessage>
                                                                )
                                                            }
                                                            {
                                                                connectedToAnotherEvent && (
                                                                    <StyledMessage>
                                                                        <FaArrowsAltH size={10}/> Connected to other subscription
                                                                    </StyledMessage>
                                                                )
                                                            }
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                    </StyledList>
                                ) : (
                                    <div>
                                        Loading...
                                    </div>
                                )
                            }
                        </section>
                    )
                }
            </div>
    )

}

export const AddEventModal: React.FC<{
    subscriptionId: string,
    billingAccountId: string,
    onClose: () => void,
    onSelect: (id: string, event: FirestoreEventData) => void,
}> = ({onClose, onSelect, subscriptionId, billingAccountId}) => {

    return (
        <Modal isOpen onRequestClose={onClose} wider>
            <div>
                <StyledHeader>
                    <StyledHeading>
                        Add Event to Subscription
                    </StyledHeading>
                </StyledHeader>
                <AddEventToSubscription billingAccountId={billingAccountId} subscriptionId={subscriptionId} onSelect={(id, event) => {
                    onSelect(id, event)
                    onClose()
                }}/>
            </div>
        </Modal>
    )
}
