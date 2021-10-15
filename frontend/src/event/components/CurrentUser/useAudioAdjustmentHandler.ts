import {useHifiCommunicator} from "../../audio/EventHifiAudioHandler";
import {useEffect} from "react";
import {useCollidedChannelZone, useIsPlayerInsideAnyStage} from "../../../state/collisions";
import {getHifiApiDataBaseState, updateHifiBaseState} from "../../audio/hifiAudio";
import {useUsersList} from "../../../state/event/users";
import {useCurrentRoomAudioConfig} from "../../../state/event/rooms";
import {joinGlobalStage, leaveGlobalStage} from "../../../firebase/events";
import {getEventId} from "../../../state/event/event";
import {useAssetInstance} from "../EventUI/AssetManager/SelectedAssetInstance";
import {useChannelManualAttenuation} from "../../../state/audio";

declare var HighFidelityAudio: any

const useChannelZoneAttenuation = () => {
    return useChannelManualAttenuation()
}

export const useAudioAdjustmentHandler = () => {

    const communicator = useHifiCommunicator()
    const insideStage = useIsPlayerInsideAnyStage()

    const numberOfUsers = useUsersList().length + 1
    const roomAudioConfig = useCurrentRoomAudioConfig()
    const channelZoneAttenuation = useChannelZoneAttenuation()
    const roomUserAttenuation = channelZoneAttenuation ?? roomAudioConfig?.userAttenuation
    const roomUserRolloff = roomAudioConfig?.userRolloff

    useEffect(() => {
        if (!communicator) return
        updateHifiBaseState(numberOfUsers, insideStage, roomUserAttenuation, roomUserRolloff)
        try {
            const data = new HighFidelityAudio.HiFiAudioAPIData(getHifiApiDataBaseState());
            communicator.updateUserDataAndTransmit(data)
        } catch (error) {
            console.error(error)
        }
    }, [communicator, insideStage, numberOfUsers, roomUserAttenuation, roomUserRolloff])

    useEffect(() => {
        if (insideStage) {
            joinGlobalStage(getEventId())
            return () => {
                leaveGlobalStage(getEventId())
            }
        }
    }, [insideStage])

}
