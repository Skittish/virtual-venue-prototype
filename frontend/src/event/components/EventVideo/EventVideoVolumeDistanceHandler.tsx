import React, {useEffect} from "react"
import { audioState } from "../../../state/audio";
import {useStoredObjectRef} from "../../../state/objects";
import {calculateVectorsDistance} from "../../../utils/vectors";
import {lerp} from "../../../utils/numbers";

const refDistance = 30
const rolloffFactor = 20
const maxVolume = 0.15
const minVolume = 0.02

const EventVideoVolumeDistanceHandler: React.FC<{
    videoId: string,
    position: [number, number, number]
}> = ({videoId, position}) => {

    const playerObjectRef = useStoredObjectRef('player')

    useEffect(() => {

        if (!playerObjectRef) return

        const [x, y] = position

        const interval = setInterval(() => {

            const playerObject = playerObjectRef.current

            if (!playerObject) return

            const distance = calculateVectorsDistance(x, playerObject.position.x, y, playerObject.position.y)

            const inverse = refDistance / (refDistance + rolloffFactor * (Math.max(distance, refDistance) - refDistance))

            const inverseVolume = lerp(minVolume, maxVolume, inverse)

            audioState.videoDistances[videoId] = inverseVolume
        }, 100)

        return () => {
            clearInterval(interval)
        }

    }, [playerObjectRef])

    return null
}

export default EventVideoVolumeDistanceHandler
