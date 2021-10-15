import {subscribe, useProxy} from "valtio";
import {uiProxy} from "../../../state/ui";
import {EDIT_MODE, editingProxy, setAssetEditingOverlapping} from "../../../state/editing";
import {useEffect, useRef} from "react";
import {useCurrentRoom} from "../../../state/event/rooms";
import {circleIntersects} from "../../../utils/intersections";

export const useOverlapHandler = () => {

    const isEditing = useProxy(uiProxy).editMode
    const editMode = useProxy(editingProxy).editMode
    const isRemoveMode = isEditing && editMode === EDIT_MODE.remove
    const room = useCurrentRoom()
    const roomRef = useRef(room)

    useEffect(() => {
        roomRef.current = room
    }, [room])

    useEffect(() => {
        if (!isRemoveMode) return

        const checkForOverlappingAssets = () => {

            if (!roomRef.current) return

            const mainRadius = 1
            const instanceRadius = 1

            const {x, y} = editingProxy.position
            const {scenery = {}} = roomRef.current
            Object.entries(scenery).forEach(([key, instance]) => {
                const instanceX = instance.x
                const instanceY = instance.y
                const intersects = circleIntersects(x, y, mainRadius, instanceX, instanceY, instanceRadius)
                setAssetEditingOverlapping(key, intersects)
            })
        }

        subscribe(editingProxy.position, () => {
            checkForOverlappingAssets()
        })

        checkForOverlappingAssets()

    }, [isRemoveMode])

}