import React, {useEffect, useState} from "react";
import {useAudioContext, useUserAudioStream} from "../../../state/audio";
import {createAudioMeter} from "../../../gameplay/audio/volume-meter";
import {usePlayerState} from "./context";

const EventUserVolumeDetector: React.FC<{
    userId: string,
}> = ({userId}) => {

    const audioContext = useAudioContext()
    const stream = useUserAudioStream(userId)
    const [meter, setMeter] = useState<any>(null)
    const playerState = usePlayerState()

    useEffect(() => {
        if (stream && audioContext) {
            const streamSource = audioContext.createMediaStreamSource(stream)
            const audioMeter = createAudioMeter(audioContext)
            streamSource.connect(audioMeter);
            setMeter(audioMeter)
        }
    }, [stream, audioContext])

    useEffect(() => {

        if (meter) {
            const interval = setInterval(() => {
                playerState.volume = meter.volume
            }, 250)
            return () => {
                clearInterval(interval)
            }
        }

    }, [meter, playerState])

    return null;
};

export default EventUserVolumeDetector;