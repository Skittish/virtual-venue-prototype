import {fetchFirestoreEvent} from "./subscriptions";
import {getRequestUserId} from "../utils/common";

export const checkIfUserIsEventAdmin = async (eventId: string, userId: string): Promise<boolean> => {

    const event = await fetchFirestoreEvent(eventId)

    return event.creatorId === userId

}

export const ensureUserIsEventAdmin = async (eventId: string, req: any, res: any, callback: () => void) => {

    const userId = getRequestUserId(req)

    const hasPermission = await checkIfUserIsEventAdmin(eventId, userId)

    if (!hasPermission) {

        return res.status(401).send('Unauthorized')

    }

    callback()

}
