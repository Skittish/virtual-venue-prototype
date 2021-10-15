import React, {useEffect, useRef, useState} from "react"
import {AudioListener, PositionalAudio} from "three";
import {useProxy} from "valtio";
import {PositionalAudioHelper} from "three/examples/jsm/helpers/PositionalAudioHelper";
import { Group } from "three";
import {useThree} from "react-three-fiber";
import {
    useAudioContext,
    useAudioElement,
    useAudioListener,
    useAudioSystem,
    useIsMuted,
    useUserAudioStream
} from "../../../state/audio";
import {AudioSystem} from "../../../gameplay/audio/loopHack";

const SHOULD_CREATE_SILENT_AUDIO_ELS = /chrome/i.test(navigator.userAgent);
function createSilentAudioEl(stream: any) {
    const audioEl = new Audio();
    audioEl.setAttribute("autoplay", "autoplay");
    audioEl.setAttribute("playsinline", "playsinline");
    audioEl.srcObject = stream;
    audioEl.volume = 0; // we don't actually want to hear audio from this element
    return audioEl;
}

const EventUserAudio: React.FC<{
    userId: string,
    audioSystem: AudioSystem,
    audioListener: AudioListener,
}> = ({userId, audioListener, audioSystem}) => {

    const groupRef = useRef<Group>(null!)
    const audioRef = useRef<null | PositionalAudio>(null)
    const stream = useUserAudioStream(userId)
    const audioContext = useAudioContext()
    const muted = useIsMuted()



    useEffect( () => {
        if (!audioContext) return
        if (!stream) return

        let audioObj: any

        if (SHOULD_CREATE_SILENT_AUDIO_ELS) {
            audioObj = createSilentAudioEl(stream);
        }

        const group = groupRef.current
        const audio = new PositionalAudio( audioListener )

        // const mediaStreamSource = audio.context.createMediaStreamSource(stream);
        // @ts-ignore
        // audio.setNodeSource(mediaStreamSource);

        // audio.setNodeSource()

        // const mediaStreamSource = audio.context.createMediaStreamSource(stream);
        // audio.setMediaStreamSource(mediaStreamSource);

        group.add(audio)
        audio.setRefDistance(5)
        audio.setMediaStreamSource(stream)
        audio.setVolume(muted ? 0 : 1)
        audioRef.current = audio

        return () => {
            if (audioObj) {
                audioObj.srcObject = null
            }
            group.remove(audio)
            audioRef.current = null
        }

    }, [audioContext, stream, audioListener, audioSystem])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current?.setVolume(muted ? 0 : 1)
        }
    }, [muted])

    return (
        <group ref={groupRef}>
        </group>
    )

}

const Wrapper: React.FC<{
    userId: string,
}> = ({userId}) => {
    const audioListener = useAudioListener()
    const audioSystem = useAudioSystem()
    if (!audioSystem) return null
    if (!audioListener) return null
    return <EventUserAudio audioSystem={audioSystem} audioListener={audioListener} userId={userId}/>
}

export default Wrapper