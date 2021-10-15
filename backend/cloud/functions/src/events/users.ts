import * as functions from "firebase-functions";
import {fetchEvent} from "./events";
import {getEventChannels, getEventUserGlobalChannels, getUserCurrentChannels, isUserInEventGlobalStage} from "./types";
import {leaveChannel} from "./channels";
import {removeUserFromGlobalChannels} from "./globalChannels";
import {leaveGlobalStage} from "./globalStage";
import {UserRecord} from "firebase-functions/lib/providers/auth";
import {getFirestoreUserRef} from "../firestore/refs";

export const handleUserCreated = async (user: UserRecord) => {

    const ref = getFirestoreUserRef(user.uid)

    return ref.set({}, {
        merge: true,
    })

}

const handleUserOffline = async (eventId: string, userId: string) => {

    const event = await fetchEvent(eventId)

    const channels = getEventChannels(event)

    const currentChannels = getUserCurrentChannels(channels, userId)

    if (currentChannels.length) {
        currentChannels.forEach(channel => {
            // eslint-disable-next-line no-void
            void leaveChannel(eventId, channel.id, userId)
        })
    }

    const userGlobalChannels = getEventUserGlobalChannels(event, userId)

    if (userGlobalChannels.length) {
        // eslint-disable-next-line no-void
        void removeUserFromGlobalChannels(eventId, userGlobalChannels, userId)
    }

    if (isUserInEventGlobalStage(event, userId)) {
        // eslint-disable-next-line no-void
        void leaveGlobalStage(eventId, userId)
    }

}

export const manualUserOfflineTrigger = async (req: any, res: any) => {

    const {
        eventId,
        userId,
    } = req.body as {
        eventId: string,
        userId: string,
    }

    // eslint-disable-next-line no-void
    void handleUserOffline(eventId, userId)

    res.send({})

}

export const userOfflineTrigger = functions.database.ref('/events/{eventId}/users/{userId}/online').onWrite((change, context) => {

    const online = change.after.val();

    if (online) return

    const {
        eventId,
        userId,
    } = context.params as {
        eventId: string,
        userId: string,
    }

    // eslint-disable-next-line no-void
    void handleUserOffline(eventId, userId)

})
