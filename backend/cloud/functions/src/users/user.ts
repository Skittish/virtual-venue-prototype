import {getFirestoreUserRef} from "../firestore/refs";
import {FirestoreUserData} from "../firestore/types";

export const getFirestoreUser = (userId: string): Promise<FirestoreUserData | undefined> => {

    const ref = getFirestoreUserRef(userId)

    return ref.get().then(response => response.data())

}
