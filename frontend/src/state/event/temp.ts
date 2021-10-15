import {SPECIAL_ASSETS} from "../../3d/scenery/config";
import {useCurrentRoom} from "./rooms";

export const useCurrentRoomVideoElements = () => {
    const room = useCurrentRoom()
    const scenery = room?.scenery ?? null
    if (!scenery) return []
    return Object.entries(scenery).filter(([key, instance]) => {
        return instance.assetKey === SPECIAL_ASSETS._videoScreen.key
    })
}