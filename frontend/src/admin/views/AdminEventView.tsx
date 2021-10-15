import React, {useEffect, useRef, useState} from "react"
import {
    channelMembersTrigger,
    createNewBillingAccount,
    updateEventHifiCapacity,
    userOfflineTrigger
} from "../../firebase/events";
import {addBotsToEvent, addBotToEvent, removeAllEventBots} from "../../firebase/event/bots";
import {getEventRef, getEventUserDataRef, getEventUsersRef} from "../../firebase/refs";
import {updateUserData} from "../../firebase/database";
import {HifiCapacity, mappedHifiCapacityNames} from "../../firebase/types";

const useEventUsers = (eventId: string): Record<string, any> => {

     const [users, setUsers] = useState({})

    useEffect(() => {
        const ref = getEventUsersRef(eventId)
        ref.on('value', snapshot => {
            setUsers(snapshot.val())
        })
    }, [])

    return users

}

const EventBot: React.FC<{
    id: string,
    eventId: string,
}> = ({id, eventId}) => {

    const localStateRef = useRef({
        x: Math.random() * 20 * (Math.random() > 0.5 ? 1 : -1),
        y: Math.random() * 20 * (Math.random() > 0.5 ? 1 : -1)
    })

    useEffect(() => {

        const randomDelay = Math.random() * 5

        const ref = getEventUserDataRef(eventId, id)

        const updatePosition = () => {

            const newX = localStateRef.current.x += Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)
            const newY = localStateRef.current.y += Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)

            localStateRef.current.x = newX
            localStateRef.current.y = newY

            updateUserData(ref, newX, newY, Math.random() * Math.PI)

        }

        const interval = setInterval(() => {
            updatePosition()
        }, 500 + randomDelay)

        return () => {
            clearInterval(interval)
        }

    }, [])

    return null
}

const EventUsers: React.FC<{
    eventId: string,
}> = ({eventId}) => {

    const eventUsers = useEventUsers(eventId)

    console.log('eventUsers', eventUsers)

    return (
        <>
            {
                Object.entries(eventUsers).map(([key, user]) => {
                    if (user.isBot) {
                        return <EventBot id={key} eventId={eventId} key={key}/>
                    }
                    return null
                })
            }
        </>
    )
}

const useEventHifiCapacity = (eventId: string) => {
    const [hifiCapacity, setHifiCapacity] = useState('')

    useEffect(() => {
        const ref = getEventRef(eventId).child('eventData/hifi/capacity')
        ref.on('value', (snapshot) => {
            setHifiCapacity(snapshot.val() ?? '')
        })
    }, [])

    return hifiCapacity
}

export const AdminEventView: React.FC<{
    eventId: string,
}> = ({eventId}) => {

    const eventHifiCapacity = useEventHifiCapacity(eventId)

    const [offlineId, setOfflineId] = useState('')
    const [channelId, setChannelId] = useState('')
    const [numberOfBots, setNumberOfBots] = useState(1)
    const [hifiCapacity, setHifiCapacity] = useState(HifiCapacity.regular)
    const [updatingCapacity, setUpdatingCapacity] = useState(false)

    const triggerChannelQueue = () => {
        channelMembersTrigger(eventId, channelId)
    }

    const triggerOffline = () => {
        userOfflineTrigger(eventId, offlineId)
    }

    const updateHifiCapacity = () => {
        if (updatingCapacity) return
        setUpdatingCapacity(true)
        updateEventHifiCapacity(eventId, hifiCapacity)
            .finally(() => {
                setUpdatingCapacity(false)
            })
    }

    return (
        <div>
            <div>
                <div>Event hifi capacity</div>
                <div>
                    Current capacity: {eventHifiCapacity ? mappedHifiCapacityNames[eventHifiCapacity] ?? 'unknown' : ''}
                </div>
                <div>
                    <select value={hifiCapacity} onChange={event => {
                        setHifiCapacity(event.target.value as HifiCapacity)
                    }}>
                        <option value={HifiCapacity.regular}>
                            Default (25)
                        </option>
                        <option value={HifiCapacity.medium}>
                            Medium (50)
                        </option>
                        <option value={HifiCapacity.large}>
                            Large (100)
                        </option>
                        <option value={HifiCapacity.extraLarge}>
                            Extra Large (150)
                        </option>
                    </select>
                </div>
                <div>
                    <button onClick={updateHifiCapacity}>
                        {
                            updatingCapacity ? "updating..." : "Update capacity"
                        }
                    </button>
                </div>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
            <form onSubmit={event => {
                event.preventDefault()
                triggerOffline()
            }}>
                <input value={offlineId} onChange={event => setOfflineId(event.target.value)} type="text"/>
                <button type="submit">Set user offline</button>
            </form>
            <form onSubmit={event => {
                event.preventDefault()
                triggerChannelQueue()
            }}>
                <input value={channelId} onChange={event => setChannelId(event.target.value)} type="text"/>
                <button type="submit">
                    Trigger channel queue
                </button>
            </form>
            <div>
                <EventUsers eventId={eventId}/>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
            <div>
                <div>
                    <input type="number" value={numberOfBots} onChange={event => {
                        setNumberOfBots(parseInt(event.target.value))
                    }} />
                </div>
                <button onClick={() => addBotsToEvent(eventId, numberOfBots)}>
                    add bot
                </button>
            </div>
            <div>
                <button onClick={() => removeAllEventBots(eventId)}>
                    remove all bots
                </button>
            </div>
            {/*<br/>*/}
            {/*<div>*/}
            {/*    <button onClick={() => {*/}
            {/*        createNewBillingAccount()*/}
            {/*    }}>*/}
            {/*        Create new billing account*/}
            {/*    </button>*/}
            {/*</div>*/}
        </div>
    )
}
