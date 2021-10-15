import {generateRandomId} from "../../utils/ids";
import {getRandomArrayElement} from "../../utils/arrays";
import {ANIMALS} from "../../3d/animals/animals";
import {getEventUsersRef} from "../refs";

export const fetchEventUsers = (eventId: string) => {

    const ref = getEventUsersRef(eventId)
    return ref.once('value')
        .then(snapshot => snapshot.val())

}

export const removeAllEventBots = async (eventId: string) => {

    const users = await fetchEventUsers(eventId)

    const bots = Object.keys(users).filter(userKey => userKey.startsWith('bot'))

    const update: Record<string, any> = {}

    bots.forEach(botId => {
        update[botId] = null
    })

    getEventUsersRef(eventId)
        .update(update)

}

export const addBotToEvent = (eventId: string) => {

    const id = `bot-${generateRandomId()}`

    const newBot = {
        animal: getRandomArrayElement(Object.keys(ANIMALS)),
        name: 'Bot',
        online: true,
        joined: true,
        currentRoom: 'main',
        isBot: true,
    }

    const ref = getEventUsersRef(eventId)

    return ref.update({
        [id]: newBot,
    })

}

export const addBotsToEvent = (eventId: string, numberOfBots: number) => {
    for (let i = 0; i < numberOfBots; i++) {
        addBotToEvent(eventId)
    }
}
