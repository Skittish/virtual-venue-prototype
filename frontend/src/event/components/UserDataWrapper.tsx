import React, {useEffect} from "react"
import {useCurrentUserId, useIsAuthenticated} from "../../state/auth";
import {setUserOnline} from "../../firebase/database";
import {getEventUserRef} from "../../firebase/refs";
import {useEventId} from "./EventDataWrapper";

const UserDataWrapper: React.FC = ({children}) => {

    const authenticated = useIsAuthenticated()
    const userId = useCurrentUserId()
    const eventId = useEventId()

    useEffect(() => {

        if (authenticated && userId) {

            setUserOnline(eventId, userId)

            const userRef = getEventUserRef(eventId, userId)

            userRef.onDisconnect().update({
                online: false,
                socketId: '',
            })

            return () => {
                userRef.onDisconnect().cancel()
            }

        }

    }, [authenticated, userId, eventId])

    return (
        <>
            {children}
        </>
    )
}

export default UserDataWrapper
