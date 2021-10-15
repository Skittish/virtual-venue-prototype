import React, {useEffect} from "react"
import {setAudioSystem, useAudioContext, useAudioListener} from "../../state/audio";
import {AudioSystem} from "./loopHack";

const SceneAudioHandler: React.FC = () => {

    const audioContext = useAudioContext()
    const audioListener = useAudioListener()

    useEffect(() => {
        if (!audioListener || !audioContext) return
        const audioSystem = new AudioSystem(audioListener)
        setAudioSystem(audioSystem)
    }, [audioListener, audioContext])

    return null
}

export default SceneAudioHandler