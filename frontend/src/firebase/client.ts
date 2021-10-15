import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/storage'
import {isProductionEnvironment} from "../utils/env";

const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
}

const stagingFirebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

firebase.initializeApp(isProductionEnvironment() ? firebaseConfig : stagingFirebaseConfig)

export const database = firebase.database()

export const firestoreDatabase = firebase.firestore()

export const storage = firebase.storage()

export {}
