import create from "zustand";
import {useEffect, useMemo} from "react";
import {playerProxy} from "./player";

type Store = {
    roomPortals: Record<string, boolean>,
    videoScreens: Record<string, boolean>,
    stages: Record<string, boolean>,
    disabledStages: Record<string, boolean>,
    channelZones: Record<string, boolean>,
}

export const useCollisionsStore = create<Store>(() => ({
    roomPortals: {},
    videoScreens: {},
    stages: {},
    disabledStages: {},
    channelZones: {},
}))

export const setStageDisabled = (id: string, disabled: boolean) => {
    useCollisionsStore.setState(state => {
        const updatedDisabledStages = {
            ...state.disabledStages,
        }
        if (disabled) {
            updatedDisabledStages[id] = true
        } else {
            delete updatedDisabledStages[id]
        }
        return {
            disabledStages: updatedDisabledStages
        }
    })
}

export const setChannelZoneCollided = (uid: string, collided: boolean) => {
    useCollisionsStore.setState(state => ({
        channelZones: {
            ...state.channelZones,
            [uid]: collided,
        }
    }))
}

export const useCollidedChannelZone = () => {
    const channelZones = useCollisionsStore(state => state.channelZones)
    const collidedZones = Object.entries(channelZones).filter(([, collided]) => {
        return !!collided
    }).map(([id]) => id)
    return collidedZones.length > 0 ? collidedZones[0] : ''
}

export const setRoomPortalCollided = (uid: string, collided: boolean) => {
    useCollisionsStore.setState(state => ({
        roomPortals: {
            ...state.roomPortals,
            [uid]: collided,
        }
    }))
}

export const useIsRoomPortalCollided = (uid: string): boolean => {
    return useCollisionsStore(state => state.roomPortals[uid]) ?? false
}

export const setVideoScreenCollided = (uid: string, collided: boolean) => {
    useCollisionsStore.setState(state => {
        if (!collided) {
            const update = {
                ...state.videoScreens,
            }
            delete update[uid]
            return {
                videoScreens: update
            }
        }
        return {
            videoScreens: {
                ...state.videoScreens,
                [uid]: collided,
            }
        }
    })
}

const videoScreensSelector = (state: Store) => state.videoScreens

export const useCollidedVideoScreens = () => {
    return useCollisionsStore(videoScreensSelector)
}

export const useIsVideoScreenCollided = (uid: string): boolean => {
    return useCollisionsStore(state => state.videoScreens[uid]) ?? false
}

export const useCollidedVideo = () => {
    const videoScreens = useCollidedVideoScreens()

    const activeVideoScreen = useMemo(() => {
        const screens = Object.keys(videoScreens)
        if (screens.length === 0) return ''
        return screens[0]
    }, [videoScreens])

    return activeVideoScreen
}

export const setStageCollided = (uid: string, collided: boolean) => {
    useCollisionsStore.setState(state => ({
        stages: {
            ...state.stages,
            [uid]: collided,
        }
    }))
}

export const useStagesPlayerInsideOf = () => {
    const disabledStages = useCollisionsStore(state => state.disabledStages)
    const stages = useCollisionsStore(state => state.stages)
    const stagesInsideOf = Object.entries(stages).filter(([id, inside]) => {
        return inside && !disabledStages[id]
    })
    return stagesInsideOf.map(([id]) => id)
}

export const useIsPlayerInsideStage = (stageId: string) => {
    const stages = useStagesPlayerInsideOf()
    return stages.includes(stageId)
}

export const useIsPlayerInsideAnyStage = () => {
    const stagesInsideOf = useStagesPlayerInsideOf()
    const insideStage = stagesInsideOf.length > 0
    useEffect(() => {
        playerProxy.insideStage = insideStage
    }, [insideStage])
    return insideStage
}
