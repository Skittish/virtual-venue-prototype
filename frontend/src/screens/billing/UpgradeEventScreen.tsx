import React, {useEffect} from "react"
import {useHistory, useParams} from "react-router-dom";
import {useUserBillingAccounts} from "./hooks";
import {getFirestoreUserRef} from "../../firebase/firestore/refs";
import {getCurrentUserId} from "../../state/auth";
import {createNewBillingAccount} from "../../firebase/events";
import {FirestoreUser} from "../../firebase/firestore/types";

export const fetchFirestoreUser = () => {

    const ref = getFirestoreUserRef(getCurrentUserId())

    return ref.get().then(snapshot => {
        return snapshot.data() as FirestoreUser ?? null
    })

}

export const fetchUserBillingAccounts = () => {

    const ref = getFirestoreUserRef(getCurrentUserId())

    return ref.get().then(snapshot => {
        const data = snapshot.data() as FirestoreUser
        if (!data) return null
        return data.billingAccounts
    })

}

export const getUserPrimaryBillingAccount = async () => {

    const firestoreUser = await fetchFirestoreUser()

    if (!firestoreUser) {
        return ''
    }

    const {
        primaryBillingAccount,
        billingAccounts = [],
    } = firestoreUser

    if (primaryBillingAccount) {
        return primaryBillingAccount
    }

    if (billingAccounts.length > 0) {
        return billingAccounts[0]
    }

    return ''

}

export const selectUserPrimaryBillingAccount = async () => {

    const defaultPrimaryBillingAccount = await getUserPrimaryBillingAccount()
    let primaryBillingAccount = defaultPrimaryBillingAccount

    if (!primaryBillingAccount) {
        const newBillingAccount = await createNewBillingAccount('').then(response => response.billingAccountId)
        primaryBillingAccount = newBillingAccount
    }

    return primaryBillingAccount

}

export const UpgradeEventScreen: React.FC = () => {

    const history = useHistory();

    const {id} = useParams<{
        id: string,
    }>()

    useEffect(() => {

        selectUserPrimaryBillingAccount()
            .then(billingAccountId => {
                history.push(`/billing/account/${billingAccountId}/create/${id}`)
            })

    }, [])

    return (
        <div>
            loading data...
        </div>
    )
}
