import React, {useLayoutEffect, useMemo, useRef} from "react"
import ReactDOM from "react-dom";
import {embeddedVideoProxy} from "../../../state/event/embeddedVideo";
import {ref} from "valtio";
import styled from "styled-components";

interface PortalProps {
    children: React.ReactNode
}

export const VIDEO_DIMENSIONS = {
    width: 560,
    height: 315,
}

export const videoPortalId = 'video-portal'

const StyledVideoContainer = styled.div`
  width: ${VIDEO_DIMENSIONS.width}px; 
  height: ${VIDEO_DIMENSIONS.height}px;
  background-color: black;
`

export const getVideoPortalId = (videoId: string) => {
    return `${videoPortalId}-${videoId}`
}

function Portal({ children }: PortalProps) {
    const root = useMemo(() => document.createElement('div'), [])
    return ReactDOM.createPortal(<div>{children}</div>, root)
}

const EventUIVideoContainer: React.FC<{
    videoId: string,
}> = ({videoId}) => {
    const htmlRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        embeddedVideoProxy.videoRefs[videoId] = ref(htmlRef)
        return () => {
            delete embeddedVideoProxy.videoRefs[videoId]
        }
    }, [])

    return (
        <Portal>
            <StyledVideoContainer id={getVideoPortalId(videoId)} ref={htmlRef}/>
        </Portal>
    )
}

export default EventUIVideoContainer