import {proxy, useProxy} from "valtio";
import {useIsAdmin} from "../../event/components/EventUI/EventUISettingsModal";
import {useCurrentUserId} from "../auth";

export type CurrentTimeData = {
    value: number,
    timestamp: number,
    userTimestamp: number,
}

export type VideoData = {
    isLivestream?: boolean,
    director?: string,
    activeDirector?: string,
    url?: string,
    playing?: boolean,
    currentTime?: CurrentTimeData,
    defaultVolume?: number,
}

export type SessionData = {
    eventConfig?: {
        eventIsClosed?: boolean,
        publicEditingEnabled?: boolean,
    },
    video?: VideoData,
    videos?: {
        [key: string]: VideoData,
    }
    roomPortals?: {
        [key: string]: string,
    }
}

export const sessionDataProxy = proxy<{
    data: SessionData
}>({
    data: {},
})

export const useEventIsClosed = () => {
    const data = useProxy(sessionDataProxy).data
    return data.eventConfig?.eventIsClosed ?? false
}

export const useEventIsPublicEditingEnabled = () => {
    const data = useProxy(sessionDataProxy).data
    return data.eventConfig?.publicEditingEnabled ?? false
}

export const useCanEditEvent = () => {
    const isAdmin = useIsAdmin()
    return useEventIsPublicEditingEnabled() || isAdmin
}

export const useVideo = (uid: string): VideoData | null => {
    const data = useProxy(sessionDataProxy).data
    return data.videos && data.videos[uid] ? data.videos[uid] : null
}

export const useIsVideoDirector = (video: VideoData | null) => {
    const userId = useCurrentUserId()
    return video ? video.director === userId : false
}

export const getVideoState = (video: VideoData | null) => {
    const playing = video?.playing ?? false
    return {
        playing,
    }
}

export const getVideoActiveDirector = (video: VideoData | null) => {
    return video?.activeDirector ?? ''
}

export const useVideoState = (videoId: string) => {
    const video = useVideo(videoId)
    return getVideoState(video)
}

export const useSessionVideo = (): VideoData | null => {
    const data = useProxy(sessionDataProxy).data
    return data.video ?? null
}

export const useSessionData = (): SessionData => {
    return useProxy(sessionDataProxy).data
}

export const useSessionVideoUrl = (): string => {
    const data = useProxy(sessionDataProxy).data
    return data.video && data.video.url ? data.video.url : ''
}

export const getVideoCurrentTime = (videoData: VideoData | null): CurrentTimeData => {
    if (videoData) {
        if (videoData.currentTime) {
            return videoData.currentTime
        }
    }
    return {
        value: 0,
        timestamp: 0,
        userTimestamp: 0,
    }
}

export const getVideoSeekToValue = (
    videoCurrentTime: number,
    videoDuration: number,
    videoServerTime: number,
    serverTimestamp: number,
    userTimestamp: number,
): number => {

    const serverTimestampDifference = Math.abs(Date.now() - serverTimestamp)
    const userTimestampDifference = Math.abs(Date.now() - userTimestamp)

    const timestamp = userTimestampDifference < (3 * 1000) ? userTimestampDifference : serverTimestampDifference

    const timestampDifference = timestamp / 1000

    let targetTime = videoServerTime + timestampDifference

    if (targetTime > videoDuration) {
        targetTime = videoServerTime
    }

    if (Math.abs(targetTime - videoCurrentTime) < (3000 / 1000)) {
        return -1
    }

    if (targetTime < videoDuration) {
        return targetTime
    }

    return -1
}
