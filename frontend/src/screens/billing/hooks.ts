import {useEffect, useState} from "react";
import {getBillingAccountsRef, getFirestoreUserRef} from "../../firebase/firestore/refs";
import {getCurrentUserId} from "../../state/auth";
import {FirestoreBillingAccountData, FirestoreUser} from "../../firebase/firestore/types";

export const useFirestoreUser = () => {
    const [user, setUser] = useState<FirestoreUser | null>(null)

    useEffect(() => {
        const ref = getFirestoreUserRef(getCurrentUserId())
        ref.onSnapshot(snapshot => {
            setUser(snapshot.data() as FirestoreUser)
        })
    }, [])

    return user
}

export const useUserBillingAccounts = () => {

    const user = useFirestoreUser()

    const billingAccounts = user ? user.billingAccounts ?? [] : []

    return billingAccounts
}

export const useBillingAccounts = (userId: string) => {

    const [data, setData] = useState<Record<string, FirestoreBillingAccountData>>({})
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {

        const ref = getBillingAccountsRef()

        const query = ref.where('creatorId', '==', userId)

        query.get()
            .then(querySnapshot => {
                const accounts: Record<string, FirestoreBillingAccountData> = {}
                querySnapshot.forEach((doc) => {
                    accounts[doc.id] = doc.data() as FirestoreBillingAccountData
                });
                setData(accounts)
                setLoaded(true)
            })

    }, [userId])

    return {
        data,
        loaded,
    }

}
