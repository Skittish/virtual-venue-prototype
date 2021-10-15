import firebase from "firebase/app";
import 'firebase/auth'

export const auth = firebase.auth()

export const signIn = () => {
    return auth.signInAnonymously()
}