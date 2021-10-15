import {getFirestoreEventRef} from "./refs";

export const fetchFirestoreEvent = (eventId: string) => {

    return getFirestoreEventRef(eventId).get().then(snapshot => snapshot.data())

}
