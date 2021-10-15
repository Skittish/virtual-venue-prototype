import {useEffect} from "react";
import {proxy, useProxy, ref} from "valtio";
import {getUserRef} from "../firebase/refs";
import {getCurrentUserId} from "./auth";
import {getFirestoreUserRef} from "../firebase/firestore/refs";
import {FirestoreUser} from "../firebase/firestore/types";

export type UserData = {
    events: {
        [key: string]: boolean,
    },
    joinedEvents: {
        [key: string]: {
            joined: number,
        }
    }
}

export const userDataProxy = proxy<{
    loading: boolean,
    loaded: boolean,
    firestoreData: FirestoreUser | null,
    data: UserData | null,
    sessionId: string,
}>({
    loading: false,
    loaded: false,
    firestoreData: null,
    data: null,
    sessionId: '',
})

export const useUserSessionId = () => {
    return useProxy(userDataProxy).sessionId
}

export const useUserData = () => {
    return useProxy(userDataProxy).data
}

export const useWatchUserData = () => {

    useEffect(() => {

        userDataProxy.loading = true
        userDataProxy.loaded = false

        const userId = getCurrentUserId()

        const userRef = getUserRef(userId)
        const firestoreUserRef = getFirestoreUserRef(userId)

        firestoreUserRef.onSnapshot(snapshot => {
            const data = snapshot.data()
            if (data) {
                userDataProxy.firestoreData = ref(data) as FirestoreUser
            }
        })

        userRef.on('value', (snapshot) => {
            userDataProxy.loading = false
            userDataProxy.loaded = true
            const data = snapshot.val()
            if (data) {
                userDataProxy.data = ref(data) as UserData
            }
        })

        return () => {
            userRef.off('value')
        }

    }, [])

}
