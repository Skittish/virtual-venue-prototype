import React, {memo, useRef} from "react"
import { Canvas, useFrame, useThree } from "react-three-fiber/css3d"
import { VideoCSSElement } from "./EventVideo/VideoCSSElement"
import {Camera, Object3D, PerspectiveCamera} from "three";
import {proxy, useProxy} from "valtio";
import {useCurrentRoomVideoElements} from "../../state/event/temp";

export const cameraStateProxy = proxy<{
    camera: PerspectiveCamera | null,
}>({
    camera: null,
})

const RenderHandler: React.FC = () => {
    const camera = useProxy(cameraStateProxy).camera
    const {gl, scene} = useThree()
    useFrame(() => {
        if (!camera || !camera.projectionMatrix) return
        gl.render(scene, camera as unknown as Camera)
    }, -1)
    return null
}

const VideosHandler: React.FC = () => {
    const videoElements = useCurrentRoomVideoElements()
    return (
        <>
            {
                videoElements.map(([key, video]) => (
                    <VideoCSSElement video={video} key={key}/>
                ))
            }
        </>
    )
}

export const EventCSSCanvasInner: React.FC = () => {
    return (
        <>
            <Canvas>
                <RenderHandler/>
                <VideosHandler/>
            </Canvas>
        </>
    )
}

/*

Wrapping this in memo because whenever <Canvas> re-renders, it causes the videos to "remount".

 */
export const EventCSSCanvas =  memo(EventCSSCanvasInner)
