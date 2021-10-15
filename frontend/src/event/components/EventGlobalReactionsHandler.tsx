import React, {useCallback, useEffect} from "react"
import {getEventChatReactionsRef} from "../../firebase/refs";
import {getEventId} from "../../state/event/event";
import {proxy, useProxy} from "valtio";
import {EventReactionData} from "../../firebase/types";
import create from "zustand";

const useGlobalReactionsStore = create<{
    reactions: Record<string, EventReactionData>
}>(set => ({
    reactions: {},
}))

const handleReactionUpdate = (value: Record<string, EventReactionData>) => {
    const update: Record<string, EventReactionData> = {}
    const reactions = useGlobalReactionsStore.getState().reactions
    Object.entries(value).forEach(([key, data]) => {
        if (!reactions[key] || reactions[key].key !== data.key) {
            update[key] = data
        }
    })
    useGlobalReactionsStore.setState(state => {
        return {
            reactions: {
                ...state.reactions,
                ...update,
            }
        }
    })
}


export const useUserReaction = (userId: string) => {
    const userReaction = useGlobalReactionsStore(useCallback((state) => {
        return state.reactions[userId] ?? null
    }, [userId]))
    return userReaction
}

export const EventGlobalReactionsHandler: React.FC = () => {

    useEffect(() => {
        const ref = getEventChatReactionsRef(getEventId())
        ref.on('child_changed', (snapshot) => {
            const value = snapshot.val() as Record<string, EventReactionData>
            if (value) {
                handleReactionUpdate(value)
            }
        })
        // ref.on('child_removed', (snapshot) => {
        //     const value = snapshot.val() as Record<string, EventReactionData>
        // })
        return () => {
            ref.off('child_changed')
            // ref.off('child_removed')
        }
    }, [])

    return null
}
