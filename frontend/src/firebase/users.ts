import {getCurrentUserId} from "../state/auth";
import {getUserBadgeInfoRef, getUserJoinedEventsRef, getUserRef} from "./refs";
import {getServerTimestamp} from "./database";
import firebase from "firebase/app";

export const storeCreatedEventWithinUser = (eventId: string) => {
    const userId = getCurrentUserId()
    const ref = getUserRef(userId)
    return ref.update({
        [`events/${eventId}`]: true,
    })
}

export const storeJoinedEventWithinUser = (eventId: string) => {
    const userId = getCurrentUserId()
    const ref = getUserJoinedEventsRef(userId)
    return ref.update({
        [`${eventId}/joined`]: getServerTimestamp(),
    })
}

export const updateUserBadgeInfo = (name: string, bio: string) => {
    const ref = getUserBadgeInfoRef(getCurrentUserId())
    const user = firebase.auth().currentUser;
    user?.updateProfile({
        displayName: name,
    })
    return ref.update({
        name,
        bio,
    })
}

export const updateUserBadgeAvatar = (avatar: string) => {
    const ref = getUserBadgeInfoRef(getCurrentUserId())
    const user = firebase.auth().currentUser;
    user?.updateProfile({
        photoURL: avatar
    })
    return ref.update({
        avatar,
    })
}
