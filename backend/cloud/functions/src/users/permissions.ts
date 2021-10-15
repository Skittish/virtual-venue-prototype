import {getFirestoreUser} from "./user";
import {USER_ROLES} from "../firestore/types";

export const getUserRoles = async (userId: string) => {

    const user = await getFirestoreUser(userId)

    return user ? user.roles ?? {} : {}

}

export const doesUserHaveCreateEventPermission = async (userId: string) => {

    const userRoles = await getUserRoles(userId)

    return userRoles[USER_ROLES.admin] || userRoles[USER_ROLES.createEvents]

}
