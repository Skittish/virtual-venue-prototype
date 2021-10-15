import React, {useEffect} from "react"
import {useUsersList} from "../../state/event/users";
import EventUser from "./EventUser/EventUser";
import {getEventUsersDataRef} from "../../firebase/refs";
import {useEventStoreEventId} from "../../state/event/event";
import {LimitNumberOfVisiblePlayers, MAX_NUMBER_OF_MODELS} from "./EventListeners";
import {randomDataProxy} from "../../3d/Camera";

export type PlayerPositions = {
    [key: string]: {
        lastUpdated: number,
        x: number,
        y: number,
        targetAngle: number,
        previousX: number,
        previousY: number,
    }
}

type Update = {
    x: number,
    y: number,
    angle: number,
}

const storedPlayerPositions: PlayerPositions = {}

const useDataListener = () => {

    const eventId = useEventStoreEventId()

    useEffect(() => {
        getEventUsersDataRef(eventId).on('value', (snapshot) => {
            const data = snapshot.val()
            if (data) {
                Object.entries(data).forEach(([key, update]) => {
                    const {x, y, angle} = update as Update
                    if (storedPlayerPositions[key]) {
                        const previousX = storedPlayerPositions[key].x
                        const previousY = storedPlayerPositions[key].y
                        if (previousX !== x || previousY !== y) {
                            storedPlayerPositions[key].lastUpdated = Date.now()
                            storedPlayerPositions[key].x = x
                            storedPlayerPositions[key].y = y
                            storedPlayerPositions[key].targetAngle = angle
                            storedPlayerPositions[key].previousX = previousX
                            storedPlayerPositions[key].previousY = previousY
                        }
                    } else {
                        storedPlayerPositions[key] = {
                            x,
                            y,
                            targetAngle: angle,
                            previousX: x,
                            previousY: y,
                            lastUpdated: Date.now()
                        }
                    }
                })
            }
        })
    }, [eventId])

}

const EventUsers: React.FC = () => {

    const users = useUsersList()

    useDataListener()

    useEffect(() => {
        randomDataProxy.numberOfUsersInRoomExceedsLimit = users.length > MAX_NUMBER_OF_MODELS
    }, [users])

    return (
        <>
            <LimitNumberOfVisiblePlayers users={users}/>
            {
                users.map((userId) => <EventUser playerPositions={storedPlayerPositions} userId={userId} key={userId}/>)
            }
        </>
    )
}

export default EventUsers
