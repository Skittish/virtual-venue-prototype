import {getEventUserRef} from "./refs";
import firebase from "firebase";
type Reference = firebase.database.Reference;

export const getServerTimestamp = (): number => {
    return firebase.database.ServerValue.TIMESTAMP as number
}

export const setUserOnline = (eventId: string, userId: string) => {
    const userRef = getEventUserRef(eventId, userId)
    return userRef.update({
        online: true,
    })
}

export const updateUserAnimal = (eventId: string, userId: string, animal: string) => {
    const userRef = getEventUserRef(eventId, userId)
    return userRef.update({
        animal,
        isSelectingAnimal: false,
    })
}

export const setUserJoined = (eventId: string, userId: string, name: string, animal: string) => {
    const userRef = getEventUserRef(eventId, userId)
    return userRef.update({
        name,
        animal,
        online: true,
        joined: true,
        kicked: false,
    })
}

export const updateUserData = (userRef: Reference, x: number, y: number, angle: number) => {
    return userRef.update({
        x,
        y,
        angle,
    })
}
