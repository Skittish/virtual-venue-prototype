import {getEventChatReactionsRef, getEventChatRef, getEventChatSettingsRef} from "../refs";
import {getEventId} from "../../state/event/event";
import {getCurrentUserId} from "../../state/auth";
import {getServerTimestamp} from "../database";
import {generateRandomId} from "../../utils/ids";

export const sendEventChatMessage = (message: string) => {
    const ref = getEventChatRef(getEventId())
    ref.push({
        message,
        author: getCurrentUserId(),
        timestamp: getServerTimestamp(),
    })
}

export const setChatMessageRemoved = (messageId: string, removed: boolean) => {
    const ref = getEventChatRef(getEventId()).child(messageId)
    return ref.update({
        removed,
    })
}

export const setChatUserBanned = (userId: string) => {
    const ref = getEventChatSettingsRef(getEventId())
    return ref.update({
        [`bannedUsers/${userId}`]: {
            banned: true,
        },
    })
}

export const setChatUserNotBanned = (userId: string) => {
    const ref = getEventChatSettingsRef(getEventId())
    return ref.update({
        [`bannedUsers/${userId}`]: null,
    })
}

export const sendUserChatReaction = (userId: string, reaction: string) => {
    const ref = getEventChatReactionsRef(getEventId())
    return ref.update({
        [`users/${userId}`]: {
            key: generateRandomId(),
            reaction,
            timestamp: getServerTimestamp(),
        }
    })
}

export const isStringAnEmoji = (string: string) => {
    try {
        const containsEmoji = /\p{Extended_Pictographic}/u.test(string)
        const strippedEmoji = string.replace(/\p{Extended_Pictographic}/u, '')
        return containsEmoji && strippedEmoji.length === 0
    } catch (e) {
        return false
    }
}
