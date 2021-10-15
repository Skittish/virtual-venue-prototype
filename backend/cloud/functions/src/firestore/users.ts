import {getFirestoreUserRef} from "./refs";
import * as admin from "firebase-admin";
import {FirestoreUserData} from "./types";

export const addBillingAccountToUser = (userId: string, billingAccountId: string) => {
    const ref = getFirestoreUserRef(userId)

    return ref.set({
        ['billingAccounts']: admin.firestore.FieldValue.arrayUnion(billingAccountId) as unknown as string[],
    }, {
        merge: true,
    })

}

export const fetchFirestoreUser = async (userId: string): Promise<FirestoreUserData | null> => {

    const ref = getFirestoreUserRef(userId)

    return ref.get().then(snapshot => snapshot.data() ?? null)

}
