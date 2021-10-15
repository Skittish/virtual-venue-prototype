import React, {useEffect, useMemo, useRef} from "react"
import {proxy, useProxy} from "valtio";
import {debounce, throttle} from "lodash-es";
import {playersDistance} from "./EventUser/EventUserPhysics";
import {EventGlobalChannelHandler} from "./EventGlobalChannelHandler";
import { EventGlobalReactionsHandler } from "./EventGlobalReactionsHandler";

export const hiddenPlayersProxy = proxy<{
    hiddenPlayers: Record<string, boolean>,
    closePlayers: Record<string, number>,
    distantPlayers: Record<string, number>,
}>({
    hiddenPlayers: {},
    closePlayers: {},
    distantPlayers: {},
})

export const useIsPlayerModelHidden = (id: string) => {
    return useProxy(hiddenPlayersProxy).hiddenPlayers[id] ?? false
}

export const setClosePlayer = (id: string, isClose: boolean) => {
    if (isClose) {
        hiddenPlayersProxy.closePlayers[id] = Date.now()
    } else {
        delete hiddenPlayersProxy.closePlayers[id]
    }
}

export const setDistantPlayer = (id: string, isClose: boolean) => {
    if (isClose) {
        hiddenPlayersProxy.distantPlayers[id] = Date.now()
    } else {
        delete hiddenPlayersProxy.distantPlayers[id]
    }
}

export const MAX_NUMBER_OF_MODELS = 40

const calculateAndDetermineHiddenPlayers = (closePlayers: Record<string, number>, distantPlayers: Record<string, number>, roomPlayers: string[]) => {

    const sortedClosePlayers = Object.entries(closePlayers).sort((entryA, entryB) => {
        return entryA[1] - entryB[1]
    })

    // prefer newer distant players
    const sortedDistantPlayers = Object.entries(distantPlayers).sort((entryA, entryB) => {
        return entryB[1] - entryA[1]
    })

    const sortedPlayers: string[] = sortedClosePlayers.map(([id]) => id)

    sortedDistantPlayers.forEach(([id]) => {
        if (!sortedPlayers.includes(id)) {
            sortedPlayers.push(id)
        }
    })

    const visiblePlayers: string[] = []

    sortedPlayers.forEach((playerId, index) => {
        if (index < MAX_NUMBER_OF_MODELS) {
            visiblePlayers.push(playerId)
        }
    })

    roomPlayers.forEach(playerId => {
        if (visiblePlayers.includes(playerId)) {
            delete hiddenPlayersProxy.hiddenPlayers[playerId]
        } else {
            if (visiblePlayers.length < MAX_NUMBER_OF_MODELS) {
                visiblePlayers.push(playerId)
                delete hiddenPlayersProxy.hiddenPlayers[playerId]
            } else {
                hiddenPlayersProxy.hiddenPlayers[playerId] = true
            }
        }
    })

}

const calculateAndDetermineHiddenPlayersDebounced = throttle(calculateAndDetermineHiddenPlayers, 250)

const DetermineHiddenPlayers: React.FC<{
    users: string[],
}> = ({users}) => {

    const usersRef = useRef(users)

    useEffect(() => {
        usersRef.current = users
    }, [users])

    useEffect(() => {

        const interval = setInterval(() => {

            const userIds = usersRef.current
            const sortedUsers = Object.entries(playersDistance).sort(([,valueA], [,valueB]) => {
                return valueA - valueB
            }).map(([id]) => id)

            const visiblePlayers: string[] = []

            sortedUsers.forEach((playerId, index) => {
                if (index < MAX_NUMBER_OF_MODELS) {
                    visiblePlayers.push(playerId)
                }
            })

            userIds.forEach(playerId => {
                if (visiblePlayers.includes(playerId)) {
                    if (hiddenPlayersProxy.hiddenPlayers[playerId]) {
                        delete hiddenPlayersProxy.hiddenPlayers[playerId]
                    }
                } else {
                    if (visiblePlayers.length < MAX_NUMBER_OF_MODELS) {
                        visiblePlayers.push(playerId)
                        if (hiddenPlayersProxy.hiddenPlayers[playerId]) {
                            delete hiddenPlayersProxy.hiddenPlayers[playerId]
                        }
                    } else {
                        if (!hiddenPlayersProxy.hiddenPlayers[playerId]) {
                            hiddenPlayersProxy.hiddenPlayers[playerId] = true
                        }
                    }
                }
            })

        }, 100)

        return () => {
            clearInterval(interval)
        }

    }, [])

    return null
}

export const LimitNumberOfVisiblePlayers: React.FC<{
    users: string[],
}> = ({users}) => {
    const numberOfUsersInRoom = users.length

    const maxNumberOfUsersReached = numberOfUsersInRoom >= MAX_NUMBER_OF_MODELS

    useEffect(() => {
        if (!maxNumberOfUsersReached) {
            hiddenPlayersProxy.hiddenPlayers = {}
        }
    }, [maxNumberOfUsersReached])

    return (
        <>
            {
                maxNumberOfUsersReached && (
                    <DetermineHiddenPlayers users={users}/>
                )
            }
        </>
    )
}

export const EventListeners: React.FC = () => {
    return (
        <>
            <EventGlobalReactionsHandler/>
        </>
    )
}
