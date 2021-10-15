import {createContext, useContext, useMemo} from "react";
import {get} from "lodash"
import {FirestoreEventData} from "../../firebase/firestore/types";

export type State = {
    firestoreEvent: FirestoreEventData,
}

export const Context = createContext<State>(null!)

export const useFirestoreEventData = () => {
    return useContext(Context).firestoreEvent
}

export const useIsEventAudioDisabled = () => {
    const event = useFirestoreEventData()

    return useMemo(() => {
        const freeAudioDisabled = get(event, 'audioUsage.freeAudioDisabled', false)
        const ignoreTrialLimit = get(event, 'audioUsage.ignoreTrialLimit', false)
        return freeAudioDisabled && !ignoreTrialLimit && !event.connectedSubscription
    }, [event])

}
