import {getEventSceneryInstanceRef, getVideoDataRef} from "./refs";

export const setStageIsPublic = (id: string, isPublic: boolean) => {
    const ref = getEventSceneryInstanceRef(id)
    return ref.update({
        isPublic,
    })
}

export const setVideoIsPublic = (id: string, isPublic: boolean) => {
    const ref = getEventSceneryInstanceRef(id)
    return ref.update({
        isPublic,
    })
}

export const setVideoIsLivestream = (id: string, isLivestream: boolean) => {
    const ref = getVideoDataRef(id)
    return ref.update({
        isLivestream,
    })
}

export const setVideoDefaultVolume = (id: string, defaultVolume: number) => {
    const ref = getVideoDataRef(id)
    return ref.update({
        defaultVolume,
    })
}
