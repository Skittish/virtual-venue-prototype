import React, {useEffect, useMemo, useRef, useState} from "react"
import EventUIVideoContainer from "../EventUI/EventUIVideoContainer";
import EventUIVideoPortal from "../EventUI/EventUIVideoPortal";
import ReactPlayer from "react-player";
import styled from "styled-components";
import {
    getVideoActiveDirector,
    getVideoCurrentTime,
    getVideoSeekToValue,
    getVideoState,
    useVideo
} from "../../../state/event/sessionData";
import {setVideoState} from "../../../state/event/videos";
import {useCurrentUserId} from "../../../state/auth";
import {getVideoDataRef} from "../../../firebase/refs";
import {getServerTimestamp} from "../../../firebase/database";
import {useIsMuted, useVideoDistanceVolume, useVideoVolumeMultiplier} from "../../../state/audio";
import {useCurrentRoomVideoElements} from "../../../state/event/temp";

const StyledVideo = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

const VideoElement: React.FC<{
    videoId: string,
}> = ({videoId}) => {

    const videoRef = useRef<ReactPlayer>(null)
    const video = useVideo(videoId)
    const url = video ? video.url : ''
    const {playing} = getVideoState(video)
    const muted = useIsMuted()
    const volume = useVideoDistanceVolume(videoId)
    const userId = useCurrentUserId()
    const isActiveDirector = userId === getVideoActiveDirector(video)
    const videoDataRef = useRef(video)
    const videoHistoryRef = useRef<Record<string, boolean>>({})
    const [queueEnded, setQueueEnded] = useState(false)

    useEffect(() => {
        if (!queueEnded) return
        const timeout = setTimeout(() => {
            getVideoDataRef(videoId).update({
                playing: false,
            })
        }, 2500)
        return () => {
            clearTimeout(timeout)
        }
    }, [queueEnded])

    useEffect(() => {
        videoDataRef.current = video
    }, [video])

    useEffect(() => {

        if (!isActiveDirector) return

        const dataRef = getVideoDataRef(videoId)

        const getTime = () => {
            return videoRef.current ? videoRef.current.getCurrentTime() ?? 0 : 0
        }

        if (playing) {

            const interval = setInterval(() => {
                dataRef.update({
                    ['currentTime/value']: getTime(),
                    ['currentTime/timestamp']: getServerTimestamp(),
                    ['currentTime/userTimestamp']: Date.now(),
                })
            }, 2500)

            return () => {
                clearInterval(interval)
            }

        }

    }, [isActiveDirector])

    useEffect(() => {
        setVideoState(videoId, {
            ready: false,
        })
        // timeout in case the original onReady event doesn't fire
        const timeout = setTimeout(() => {
            setVideoState(videoId, {
                ready: true,
            })
        }, 1000)
        return () => {
            clearTimeout(timeout)
        }
    }, [url])

    const {
        onEnded,
        onReady,
        onPlay,
        onPause,
    } = useMemo(() => ({
        onEnded: () => {
            if (!isActiveDirector) return
            setQueueEnded(true)
        },
        onReady: () => {
            setVideoState(videoId, {
                ready: true,
            })
        },
        onPlay: () => {
            setQueueEnded(false)
            if (!url) return
            if (!videoRef.current) return
            if (videoHistoryRef.current[url]) return
            videoHistoryRef.current[url] = true
            const {
                value: serverCurrentTime,
                timestamp: currentTimeTimestamp,
                userTimestamp,
            } = getVideoCurrentTime(videoDataRef.current)

            const currentTime = videoRef.current.getCurrentTime()
            const duration = videoRef.current.getDuration() ?? 0

            const seekTo = getVideoSeekToValue(
                currentTime,
                duration,
                serverCurrentTime,
                currentTimeTimestamp,
                userTimestamp,
            )

            if (seekTo >= 0 && !videoDataRef.current?.isLivestream) {
                videoRef.current.seekTo(seekTo)
            }
        },
        onPause: () => {
            // todo ...
        },
    }), [isActiveDirector, url])

    const {
        value: serverCurrentTime,
        timestamp: currentTimeTimestamp,
        userTimestamp,
    } = getVideoCurrentTime(video)

    useEffect(() => {
        if (isActiveDirector) return
        if (!videoRef.current) return

        const currentTime = videoRef.current.getCurrentTime()
        const duration = videoRef.current.getDuration() ?? 0

        const {
            value: serverCurrentTime,
            timestamp: currentTimeTimestamp,
            userTimestamp,
        } = getVideoCurrentTime(videoDataRef.current)

        const seekTo = getVideoSeekToValue(
            currentTime,
            duration,
            serverCurrentTime,
            currentTimeTimestamp,
            userTimestamp,
        )

        if (seekTo >= 0 && !videoDataRef.current?.isLivestream) {
            videoRef.current.seekTo(seekTo)
        }

    }, [isActiveDirector, serverCurrentTime, currentTimeTimestamp, userTimestamp])

    return (
        <>
            <EventUIVideoContainer videoId={videoId}/>
            <EventUIVideoPortal videoId={videoId}>
                <StyledVideo>
                    <ReactPlayer key={url} url={url} ref={videoRef}
                                 playing={playing}
                                 onReady={onReady}
                                 onPlay={onPlay}
                                 onPause={onPause}
                                 onEnded={onEnded}
                                 width='100%'
                                 height='100%'
                                 muted={muted}
                                 volume={volume}
                                 config={{
                                     youtube: {
                                         playerVars: {
                                             controls: 0,
                                         }
                                     }
                                 }}
                    />
                </StyledVideo>
            </EventUIVideoPortal>
        </>
    )
}

const EventVideoElements: React.FC = () => {
    const videoElements = useCurrentRoomVideoElements()
    return (
        <>
            {videoElements.map(([key, video]) => (
                <VideoElement videoId={key} key={key}/>
            ))}
        </>
    )
}

export default EventVideoElements
