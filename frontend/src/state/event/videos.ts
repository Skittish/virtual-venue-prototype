import create from "zustand";

type VideoState = {
    ready: boolean,
    playing: boolean,
}

export const useVideosStore = create<{
    videos: {
        [key: string]: {
            ready: boolean,
            playing: boolean,
        }
    }
}>(() => ({
    videos: {},
}))

export const useVideoLocalState = (videoId: string, video?: Partial<VideoState> | null): VideoState => {
    return useVideosStore(state => state.videos[videoId]) ?? {
        ready: false,
        playing: video?.playing ?? false,
    }
}

export const setVideoState = (videoId: string, videoState: Partial<VideoState>) => {
    useVideosStore.setState(state => {
        return {
            videos: {
                ...state.videos,
                [videoId]: {
                    ...(state.videos[videoId] ?? {
                        ready: false,
                        playing: false,
                    }),
                    ...videoState,
                }
            }
        }
    })
}
