import React, {createContext, useContext, useEffect, useState} from "react"
import {getEventRef, getEventSessionDataRef, getEventUserDataRef, getEventUsersRef} from "../../firebase/refs";
import firebase from "firebase";
import {addUsers, useCurrentSessionIsActiveSession, Users} from "../../state/event/users";
import {setEventId, setEventInitialData} from "../../state/event/event";
import {sessionDataProxy} from "../../state/event/sessionData";
import {checkIfEventExists} from "../../firebase/events";
import {LoadingView} from "../../components/AuthRequiredWrapper";
import {generateRandomId} from "../../utils/ids";
import { setEventUserSessionId } from "../../firebase/event";
import { userDataProxy } from "../../state/user";
import { StyledMediumHeading } from "../../ui/typography/headings";
import {Context as FirestoreEventContext} from "./EventDataWrapper.context"
import {EventData} from "../../firebase/types";
import {FirestoreEventData} from "../../firebase/firestore/types";
import {getFirestoreEventRef} from "../../firebase/firestore/refs";
type DataSnapshot = firebase.database.DataSnapshot;

type State = {
    eventID: string,
}

const Context = createContext<State>({
    eventID: '',
})

export const useEventId = (): string => {
    return useContext(Context).eventID
}

const useEventData = (eventId: string) => {

    useEffect(() => {
        setEventId(eventId)
    }, [eventId])

    useEffect(() => {

        const eventRef = getEventRef(eventId)

        eventRef.once('value', (snapshot) => {
            const data = snapshot.val()
            if (data) {
                setEventInitialData(data as EventData)
            } else {
                setEventInitialData({users: {}})
            }
        })

        const sessionDataRef = getEventSessionDataRef(eventId)

        sessionDataRef.on('value', (snapshot) => {
            const data = snapshot.val()
            if (data) {
                sessionDataProxy.data = data
            }
        })

        return () => {
            sessionDataRef.off('value')
        }

    }, [eventId])

    useEffect(() => {

        const onUpdate = (snapshot: DataSnapshot) => {

            const data = snapshot.val()

            if (data) {
                addUsers(data as Users)
            }

        }

        const ref = getEventUsersRef(eventId)

        ref.on('value', onUpdate)

        return () => {
            ref.off('value', onUpdate)
        }

    }, [eventId])

}

export const useFirestoreEvent = (eventId: string) => {

    const [loading, setLoading] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [data, setData] = useState<FirestoreEventData | null>(null)

    useEffect(() => {

        const ref = getFirestoreEventRef(eventId)

        ref.onSnapshot(snapshot => {
            setData(snapshot.data() as FirestoreEventData | null ?? null)
            setLoaded(true)
            setLoading(false)
        })

    }, [eventId])

    return {
        loading,
        loaded,
        data,
    }

}

const EventDataWrapper: React.FC<{
    eventID: string,
}> = ({children, eventID}) => {
    useEventData(eventID)
    const [{loading, exists}, setState] = useState({
        loading: true,
        exists: false,
    })
    const {
        loaded: loadedFirestoreEvent,
        data: firestoreEvent,
    } = useFirestoreEvent(eventID)

    const [userSessionId] = useState(() => generateRandomId())
    const [hasSetUserSessionId, setHasSetUserSessionId] = useState(false)

    useEffect(() => {
        checkIfEventExists(eventID)
            .then((exists) => {
                setState({
                    loading: false,
                    exists,
                })
                if (exists) {
                    setEventUserSessionId(eventID, userSessionId)
                        .then(() => {
                            userDataProxy.sessionId = userSessionId
                            setHasSetUserSessionId(true)
                        })
                }
            })
            .catch((error) => {
                console.error(error)
                setState({
                    loading: false,
                    exists: false,
                })
            })
    }, [])

    if (!loadedFirestoreEvent || loading || (exists && !hasSetUserSessionId)) {
        return (
            <LoadingView>
                <StyledMediumHeading>
                    loading...
                </StyledMediumHeading>
            </LoadingView>
        )
    }

    if (!exists || !firestoreEvent) {
        return (
            <LoadingView>
                <StyledMediumHeading>
                    {eventID} does not exist
                </StyledMediumHeading>
            </LoadingView>
        )
    }

    return (
        <Context.Provider value={{eventID}}>
            <FirestoreEventContext.Provider value={{firestoreEvent}}>
                {children}
            </FirestoreEventContext.Provider>
        </Context.Provider>
    )
}

export default EventDataWrapper
