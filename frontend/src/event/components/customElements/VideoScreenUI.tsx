import React, {useEffect, useMemo, useState} from "react"
import { Range } from 'react-range';
import styled from "styled-components";
import {StyledPlayWrapper, StyledRoundButton, StyledSmallRoundButton} from "../../../ui/buttons";
import {FaPause, FaPlay} from "react-icons/fa";
import {eventVideoProxy} from "../EventVideo/EventVideoUIHandler";
import {useIsVideoDirector, useVideo, useVideoState} from "../../../state/event/sessionData";
import {getCurrentUserId, useCurrentUserId} from "../../../state/auth";
import {Html} from "@react-three/drei";
import {VIDEO_SCREEN_HEIGHT} from "./VideoScreen";
import {useHtmlRoot} from "../../../state/misc";
import {setVideoState, useVideoLocalState} from "../../../state/event/videos";
import {useIsVideoScreenCollided} from "../../../state/collisions";
import {setFocusedVideo} from "../../../state/ui";
import {useIsEventCreator} from "../../../state/event/event";
import {getVideoDataRef} from "../../../firebase/refs";
import {useIsAdmin, useIsSpeaker} from "../EventUI/EventUISettingsModal";
import {useChannelZone} from "./ChannelZone";
import {setVideoDefaultVolume, setVideoIsLivestream, setVideoIsPublic} from "../../../firebase/placedObjects";
import {THEME} from "../../../ui/theme";
import {setVideoVolume} from "../../../state/audio";

const StyledContent = styled.div`
  white-space: nowrap;
  
  ul {
    display: flex;
    justify-content: center;
    
    &:not(:first-child) {
      margin-top: ${THEME.spacing.$1b}px;
    }
    
  }

  li {

    &:not(:first-child) {
      margin-left: 5px;
    }

  }

`

const useVideoHandler = (uid: string) => {

    const video = useVideo(uid) ?? {}
    const url = video ? video.url : ''
    const {
        isLivestream = false,
        defaultVolume = 50,
    } = video

    const {
        playing
    } = useVideoState(uid)
    const {
        ready
    } = useVideoLocalState(uid)

    const isDirector = useIsVideoDirector(video)

    const {
        onToggle,
    } = useMemo(() => ({
        onToggle: () => {
            const videoRef = getVideoDataRef(uid)
            videoRef.update({
                activeDirector: getCurrentUserId(),
                playing: !playing,
            })
        },
    }), [playing, uid])

    const onChange = () => {
        eventVideoProxy.editingVideoId = uid
    }

    const canPlay = !!url && ready

    return {
        isDirector,
        playing,
        hasVideo: !!url,
        onChange,
        onToggle,
        canPlay,
        isLivestream,
        defaultVolume,
    }

}

const StyledVolumeContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`

const StyledVolume = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 8px;
  align-items: center;
  padding: 4px;
  background-color: rgba(0,0,0,0.5);
`

const VideoScreenUI: React.FC<{
    localVolume: number,
    setLocalVolume: (volume: number) => void,
    volumeUpdated: boolean,
    setVolumeUpdated: (updated: boolean) => void,
    defaultVolume: number,
    uid: string,
    onlyShowFocus: boolean,
    focused: boolean,
    toggleFocus: () => void,
    showFocusOption: boolean,
    setHovered: (hovered: boolean) => void,
    playing: boolean,
    hasVideo: boolean,
    onChange: () => void,
    onToggle: () => void,
    canPlay: boolean,
    isDirector: boolean,
    isLivestream: boolean,
}> = ({
                               localVolume,
                               setLocalVolume,
                               volumeUpdated,
                               setVolumeUpdated,
           defaultVolume,
          uid,
          onlyShowFocus,
          isDirector,
          setHovered,
          playing,
          hasVideo,
          onChange,
          onToggle,
          canPlay,
          focused,
          toggleFocus,
          showFocusOption,
           isLivestream,
      }) => {

    const isEventCreator = useIsEventCreator()

    const showDirectorOptions = canPlay && (isEventCreator || isDirector)

    const isSpeaker = useIsSpeaker()

    const isAdmin = useIsAdmin()

    const asset = useChannelZone(uid) ?? {}

    const {
        isPublic = false,
    } = asset

    const canControlVideo = isAdmin || isSpeaker || isPublic

    const onVolumeChange = (volume: number) => {
        setLocalVolume(volume)
        setVolumeUpdated(true)
    }

    const updateDefaultVideoVolume = () => {
        setVideoDefaultVolume(uid, localVolume)
        setVolumeUpdated(false)
    }

    return (
        <StyledContent onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <StyledVolumeContainer>
                <StyledVolume>
                    <label htmlFor="">
                        Volume
                    </label>
                    <input value={localVolume} onChange={event => {
                        try {
                            onVolumeChange(parseFloat(event.target.value))
                        } catch (e) {
                            console.error(e)
                        }
                    }} type="range" id="vol" name="vol" min="0" max="100"/>
                </StyledVolume>
            </StyledVolumeContainer>
            <ul>
                {
                    (volumeUpdated && isAdmin) && (
                        <li>
                            <StyledSmallRoundButton onClick={updateDefaultVideoVolume}>
                                update default video volume
                            </StyledSmallRoundButton>
                        </li>
                    )
                }
            </ul>
            <ul>
            {
                showFocusOption && (
                    <li>
                        <StyledSmallRoundButton onClick={toggleFocus}>
                            {
                                focused ? "zoom out" : "zoom in"
                            }
                        </StyledSmallRoundButton>
                    </li>
                )
            }
            {
                (canControlVideo || showDirectorOptions) && (
                    <li>
                        <StyledRoundButton onClick={onToggle}>
                            {
                                playing ? <FaPause size={14}/> : (
                                    <StyledPlayWrapper>
                                        <FaPlay size={14}/>
                                    </StyledPlayWrapper>
                                )
                            }
                        </StyledRoundButton>
                    </li>
                )
            }
            {
                canControlVideo && (
                    <>
                        <li>
                            <StyledSmallRoundButton onClick={onChange}>
                                {
                                    !hasVideo ? "share video" : "change video"
                                }
                            </StyledSmallRoundButton>
                        </li>
                    </>
                )
            }
            </ul>
            <ul>
                {
                    canControlVideo && (
                        <>
                            <li>
                                <StyledSmallRoundButton onClick={() => {
                                    setVideoIsLivestream(uid, !isLivestream)
                                }}>
                                    {
                                        isLivestream ? "set as prerecorded video" : "set as livestream"
                                    }
                                </StyledSmallRoundButton>
                            </li>
                        </>
                    )
                }
                {
                    isAdmin && (
                        <li>
                            <StyledSmallRoundButton onClick={() => {
                                setVideoIsPublic(uid, !isPublic)
                            }}>
                                {
                                    isPublic ? "disable public editing" : "enable public editing"
                                }
                            </StyledSmallRoundButton>
                        </li>
                    )
                }
            </ul>
        </StyledContent>
    )
}

const Wrapper: React.FC<{
    tempShowControls: boolean,
    visible: boolean,
    uid: string,
    setHovered: (hovered: boolean) => void,
}> = ({visible, tempShowControls, uid, ...props}) => {

    const videoProps = useVideoHandler(uid)
    const htmlRef = useHtmlRoot()

    const [localVolume, setLocalVolume] = useState(videoProps.defaultVolume ?? 50)
    const [volumeUpdated, setVolumeUpdated] = useState(false)
    const [focused, setFocused] = useState(false)
    const isCollided = useIsVideoScreenCollided(uid)

    useEffect(() => {
        setVideoVolume(uid, localVolume)
    }, [localVolume])

    const toggleFocus = () => {
        setFocused(state => !state)
    }

    useEffect(() => {
        if (!isCollided) return
        if (!focused) return
        setFocusedVideo(uid)
        return () => {
            setFocusedVideo('')
        }
    }, [focused, isCollided])

    if (!visible && !tempShowControls) return null

    return (
        <group position={[0, 0, VIDEO_SCREEN_HEIGHT / 2]}>
            <Html center portal={htmlRef}>
                <VideoScreenUI focused={focused} onlyShowFocus={tempShowControls && !visible} toggleFocus={toggleFocus}
                               showFocusOption={isCollided} localVolume={localVolume}
                               setLocalVolume={setLocalVolume}
                               volumeUpdated={volumeUpdated}
                               setVolumeUpdated={setVolumeUpdated}
                               uid={uid} {...props} {...videoProps}/>
            </Html>
        </group>
    )

}

export default Wrapper
