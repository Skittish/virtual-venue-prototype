import {FirestoreUser, USER_ROLES} from "./types";
import {useProxy} from "valtio";
import {userDataProxy} from "../../state/user";

export const doesFirestoreUserHaveCreateEventPermissions = (user: FirestoreUser | null) => {
    if (!user) return false
    const {
        roles = {},
    } = user
    return roles[USER_ROLES.createEvents] || roles[USER_ROLES.admin]
}

export const isFirestoreUserAdmin = (user: FirestoreUser | null) => {
    if (!user) return false
    const {
        roles = {},
    } = user
    return roles[USER_ROLES.admin]
}

export const useDoesUserHaveCreateEventPermissions = () => {

    const user = useProxy(userDataProxy).firestoreData

    if (!user) return false

    return doesFirestoreUserHaveCreateEventPermissions(user)

}
