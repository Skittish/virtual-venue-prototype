import create from "zustand";
import {proxy, useProxy} from "valtio";
import {AudioListener} from "three";
import {logConnectionMessage} from "../gameplay/connections/debugging";
import {AudioSystem} from "../gameplay/audio/loopHack";
import {getCurrentUserId} from "./auth";

export const useAudioState = create<{
    audioStream: MediaStream | null,
}>(() => ({
    audioStream: null,
}))

export const useAudioElements = create<{
    audioElements: {
        [key: string]: HTMLAudioElement,
    },
    audioListener: AudioListener | null,
    audioStreams: {
        [key: string]: any,
    },
    audioContext: AudioContext | null,
    audioSystem: AudioSystem | null,
}>(() => ({
    audioElements: {},
    audioListener: null,
    audioStreams: {},
    audioContext: null,
    audioSystem: null,
}))

export const setAudioSystem = (audioSystem: AudioSystem) => {
    return useAudioElements.setState({
        audioSystem,
    })
}

export const useAudioSystem = (): AudioSystem | null => {
    return useAudioElements(state => state.audioSystem)
}

export const useAudioContext = (): AudioContext | null => {
    return useAudioElements(state => state.audioContext)
}

export const setAudioContext = (context: AudioContext) => {
    return useAudioElements.setState({
        audioContext: context,
    })
}

export const addAudioStream = (userId: string, stream: any) => {

    logConnectionMessage(`Add audio stream for ${userId}`)

    useAudioElements.setState(state => {
        return {
            audioStreams: {
                ...state.audioStreams,
                [userId]: stream,
            }
        }
    })

    return () => {
        logConnectionMessage(`Remove audio stream for ${userId}`)
        useAudioElements.setState(state => {
            const updatedElements = {
                ...state.audioStreams,
            }
            delete updatedElements[userId]
            return {
                audioStreams: updatedElements,
            }
        })
    }

}

export const useUserAudioStream = (userId: string): any | null => {
    return useAudioElements(state => state.audioStreams[userId] ?? null)
}

export const setAudioListener = (listener: AudioListener) => {
    useAudioElements.setState({
        audioListener: listener,
    })
}

export const useAudioListener = (): AudioListener | null => {
    return useAudioElements(state => state.audioListener ?? null)
}

export const useAudioElement = (userId: string): HTMLAudioElement | null => {
    return useAudioElements(state => state.audioElements[userId] ?? null)
}

export const addAudioElement = (userId: string, audioElement: HTMLAudioElement) => {

    useAudioElements.setState(state => {
        return {
            audioElements: {
                ...state.audioElements,
                [userId]: audioElement,
            }
        }
    })

    return () => {
        useAudioElements.setState(state => {
            const updatedElements = {
                ...state.audioElements,
            }
            delete updatedElements[userId]
            return {
                audioElements: updatedElements,
            }
        })
    }

}

export const audioState = proxy<{
    micGranted: boolean,
    micRejected: boolean,
    micMuted: boolean,
    muted: boolean,
    siteInteracted: boolean,
    distanceVolume: number,
    videoDistances: {
        [key: string]: number,
    },
    videoVolumes: Record<string, number>,
    channelManualAttenuation: undefined | number,
}>({
    micGranted: false,
    micRejected: false,
    micMuted: true,
    muted: true,
    siteInteracted: false,
    distanceVolume: 1,
    videoDistances: {},
    videoVolumes: {},
    channelManualAttenuation: undefined,
})

export const setChannelManualAttenuation = (attenuation: undefined | number) => {
    audioState.channelManualAttenuation = attenuation
}

export const useChannelManualAttenuation = () => {
    return useProxy(audioState).channelManualAttenuation
}

const normalizeVolume = (volume: number) => {
    return (volume / 100) * 5
}

export const setVideoVolume = (id: string, volume: number) => {
    audioState.videoVolumes[id] = normalizeVolume(volume)
}

export const setMicMuted = (muted: boolean) => {
    audioState.micMuted = muted
}

export const useVideoDistanceVolume = (videoId: string) => {
    const volumeMultiplier = useVideoVolumeMultiplier(videoId) ?? 1
    const volume = useProxy(audioState).videoDistances[videoId] ?? 1
    return volume * volumeMultiplier
}

export const useVideoVolumeMultiplier = (videoId: string) => {
    return useProxy(audioState).videoVolumes[videoId]
}

export const useIsMicMuted = (): boolean => {
    return useProxy(audioState).micMuted
}

export const useIsMuted = (): boolean => {
    return useProxy(audioState).muted
}

export const useSiteInteracted = (): boolean => {
    return useProxy(audioState).siteInteracted
}

export const setAudioStream = (stream: MediaStream | null) => {
    useAudioState.setState({audioStream: stream})
    addAudioStream(getCurrentUserId(), stream)
}

export const useAudioStream = () => {
    return useAudioState(state => state.audioStream)
}
