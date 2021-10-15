import React, {MutableRefObject, useEffect, useRef} from "react"
import {a, useSpring} from "@react-spring/three";
import {CSS3DObject} from "three/examples/jsm/renderers/CSS3DRenderer";
import {Object3D} from "three";
import {VIDEO_SCREEN_SCALE, VIDEO_SCREEN_Z_OFFSET} from "../customElements/VideoScreen";
import {SceneryInstance} from "../../../state/event/rooms";
import {useVideoRef} from "../../../state/event/embeddedVideo";
import {useIsVideoFocused} from "../../../state/ui";

const DOMElement: React.FC<{
    dom: MutableRefObject<HTMLElement>,
    groupRef: MutableRefObject<Object3D>,
}> = ({dom, groupRef}) => {
    const ref = useRef<CSS3DObject>(null!)
    useEffect(() => {
        ref.current = new CSS3DObject(dom.current)
        const group = groupRef.current
        group.add(ref.current)
        return () => {
            if (group) {
                group.remove(ref.current)
            }
        }
    }, [dom])
    return null
}

export const useVideoSpring = (isFocused: boolean) => {
    const { spring } = useSpring({
        spring: isFocused ? 1 : 0,
        config: {
            mass: 1,
            tension: 170,
            friction: 100,
        }
    })
    const rotation = spring.to([0, 1], [Math.PI / 3, Math.PI / 1.9])
    const scale = spring.to([0, 1], [1, 1.75])
    const position = spring.to([0, 1], [VIDEO_SCREEN_Z_OFFSET, VIDEO_SCREEN_Z_OFFSET + 8])
    return {
        rotation,
        scale,
        position,
    }
}

export const VideoCSSElement: React.FC<{
    video: SceneryInstance,
}> = ({
    video,
}) => {
    const videoId = video.key
    const groupRef = useRef<Object3D>(null!)
    const videoRef = useVideoRef(videoId)
    const isFocused = useIsVideoFocused(videoId)
    const {
        rotation,
        scale,
        position,
    } = useVideoSpring(isFocused)

    if (!videoRef) return null

    return (
        <a.group position-x={video.x} position-y={video.y} position-z={position}>
            <group
                   scale={[VIDEO_SCREEN_SCALE, VIDEO_SCREEN_SCALE, VIDEO_SCREEN_SCALE]}>
                <a.group rotation-x={rotation} scale-x={scale} scale-y={scale} scale-z={scale}>
                    <group ref={groupRef}>
                        <DOMElement dom={videoRef} groupRef={groupRef}/>
                    </group>
                </a.group>
            </group>
        </a.group>
    )
}
