import React, {useEffect, useState} from "react"
import {Box, Html, Plane} from "@react-three/drei";
import {VIDEO_DIMENSIONS} from "../EventUI/EventUIVideoContainer";
import {useHtmlRoot} from "../../../state/misc";
import EventVideoColliders from "../EventVideo/EventVideoColliders";
import VideoScreenUI from "./VideoScreenUI";
import EventUIVideoModal from "../EventUI/EventUIVideoModal";
import Modal from "../../../components/Modal";
import {NoBlending} from "three";
import EventVideoVolumeDistanceHandler from "../EventVideo/EventVideoVolumeDistanceHandler";
import {useIsEditEditingMode, useIsVideoScreenDisabled} from "../../../state/editing";
import {useIsVideoScreenCollided} from "../../../state/collisions";
import { a } from "@react-spring/three";
import {useVideoSpring} from "../EventVideo/VideoCSSElement";
import {useIsVideoFocused} from "../../../state/ui";

export const VIDEO_SCREEN_SCALE = 0.035
export const VIDEO_SCREEN_WIDTH = VIDEO_DIMENSIONS.width * VIDEO_SCREEN_SCALE
export const VIDEO_SCREEN_HEIGHT = VIDEO_DIMENSIONS.height * VIDEO_SCREEN_SCALE

export const VIDEO_SCREEN_Z_OFFSET = 6

const VideoScreen: React.FC<{
    uid: string,
    x: number,
    y: number,
    temporary: boolean,
}> = ({uid, x, y, temporary}) => {

    const [pointerOver, setPointerOver] = useState(false)
    const [hovered, setHovered] = useState(false)
    const [tempShowControls, setTempShowControls] = useState(false)
    const isDisabled = useIsVideoScreenDisabled()
    const isFocused = useIsVideoFocused(uid)
    const isCollided = useIsVideoScreenCollided(uid)

    const {
        rotation,
        scale,
        position,
    } = useVideoSpring(isFocused)

    useEffect(() => {
        if (!isCollided) return
        setTempShowControls(true)
        const timeout = setTimeout(() => {
            setTempShowControls(false)
        }, 1000)
        return () => {
            clearTimeout(timeout)
            setTempShowControls(false)
        }
    }, [isCollided])

    return (
        <>
            <a.group position-x={0} position-y={0} position-z={position}>
                <a.group rotation-x={rotation} scale-x={scale} scale-y={scale} scale-z={scale}>
                    <Plane args={[VIDEO_SCREEN_WIDTH, VIDEO_SCREEN_HEIGHT]}>
                        <meshBasicMaterial colorWrite={false} />
                    </Plane>
                    <Plane args={[VIDEO_SCREEN_WIDTH, VIDEO_SCREEN_HEIGHT]}>
                        <meshBasicMaterial color={"black"} opacity={0} blending={NoBlending} />
                    </Plane>
                    <Box castShadow
                         args={[VIDEO_SCREEN_WIDTH, VIDEO_SCREEN_HEIGHT, 0.002]}
                         onClick={(event) => {
                             if (!temporary && !isDisabled) {
                                 event.stopPropagation()
                             }
                         }}
                         onPointerDown={(event) => {
                             if (!temporary && !isDisabled) {
                                 event.stopPropagation()
                             }
                         }}
                         onPointerOver={() => setPointerOver(true)}
                         onPointerOut={() => setPointerOver(false)}
                    >
                        <meshBasicMaterial transparent opacity={0.5} colorWrite={temporary} color="black" />
                    </Box>
                </a.group>
            </a.group>
            {
                !temporary && (
                    <>
                        <VideoScreenUI tempShowControls={tempShowControls} visible={(pointerOver || hovered)} uid={uid} setHovered={setHovered}/>
                        <EventVideoColliders videoUid={uid} width={VIDEO_SCREEN_WIDTH}
                                         position={[x, y, 0]}/>
                        <EventVideoVolumeDistanceHandler videoId={uid} position={[x, y, 0]}/>
                    </>
                )
            }
        </>
    )
}

export default VideoScreen
