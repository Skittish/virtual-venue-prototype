import React, {useEffect} from "react"
import SceneryAsset from "../../3d/scenery/SceneryAsset";
import {getEventRoomsDataRef} from "../../firebase/refs";
import {useEventStoreEventId} from "../../state/event/event";
import {RoomsData, setRoom, useCurrentRoom, useCurrentRoomScenery} from "../../state/event/rooms";
import {PlacedAsset} from "./AssetPreview";

const useRoomsData = () => {

    const eventId = useEventStoreEventId()

    useEffect(() => {

        const ref = getEventRoomsDataRef(eventId)

        ref.on('value', (snapshot) => {
            const snapshotData = snapshot.val()
            if (snapshotData) {
                Object.entries(snapshotData as RoomsData).forEach(([roomUid, room]) => {
                    setRoom(roomUid, room)
                })
            }
        })

        return () => {
            ref.off('value')
        }

    }, [eventId])

}

const EventScenery: React.FC = () => {

    useRoomsData()

    const scenery = useCurrentRoomScenery()

    if (!scenery) return null

    return (
        <>
            {
                Object.entries(scenery).map(([key, {model, assetKey, ...data}]) => {
                    if (assetKey) {
                        return <PlacedAsset assetKey={assetKey} id={key} x={data.x} y={data.y} rotation={data.rotation} key={key}/>
                    } else {
                        return null
                    }
                })
            }
        </>
    )
}

export default EventScenery
