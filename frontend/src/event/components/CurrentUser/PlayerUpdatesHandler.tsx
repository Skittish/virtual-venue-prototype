import React, {MutableRefObject, useCallback, useEffect, useRef} from "react"
import {generateRandomId} from "../../../utils/ids";
import {Context, UpdateSubscription} from "./PlayerUpdatesHandler.context";
import {useStoredObjectRef} from "../../../state/objects";

export const PlayerUpdatesHandler: React.FC = ({children}) => {

    const subscriptionsRef = useRef<Record<string, MutableRefObject<UpdateSubscription>>>({})
    const playerObjectRef = useStoredObjectRef('player')
    const playerRotationObjectRef = useStoredObjectRef('playerRotation')

    const subscribe = useCallback((callbackRef: MutableRefObject<UpdateSubscription>) => {
        const id = generateRandomId()
        subscriptionsRef.current[id] = callbackRef
        return () => {
            delete subscriptionsRef.current[id]
        }
    }, [])

    return (
        <Context.Provider value={{subscribe}}>
            {children}
        </Context.Provider>
    )
}
