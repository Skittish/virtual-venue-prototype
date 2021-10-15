import {Plane} from "@react-three/drei"
import {MouseEvent} from "react-three-fiber/canvas"
import React, {MutableRefObject, useRef} from "react"
import {inputsProxy, inputsRawState} from "../../../gameplay/inputs/state";
import {Object3D} from "three";
import {calculateVectorBetweenVectors, calculateVectorsDistance} from "../../../utils/vectors";
import {clearSelectedAssets, EDIT_MODE, editingProxy} from "../../../state/editing";
import {uiProxy} from "../../../state/ui";
import {addSceneryInstance} from "../../../firebase/rooms";
import {useCurrentRoomId} from "../../../state/event/users";
import {SPECIAL_ASSETS} from "../../../3d/scenery/config";

const calculateTargetPositionSpeed = (distance: number) => {
    switch (true) {
        case distance > 20:
            return 1.5
        case distance > 15:
            return 1.25
        case distance > 5:
            return 1
        default:
            return 0.75
    }
}

const handleAddSceneryInstance = (room: string, x: number, y: number) => {
    const {id} = addSceneryInstance(room, editingProxy.addingSpecialAssetKey || editingProxy.addingAssetKey, x, y)

    if (editingProxy.addingSpecialAssetKey) {
        const specialAsset = SPECIAL_ASSETS[editingProxy.addingSpecialAssetKey]
        if (!specialAsset) {
            console.warn(`No special asset found for: ${editingProxy.addingSpecialAssetKey}`)
            return
        }
        if (specialAsset.onCreated) {
            specialAsset.onCreated(id)
        }
    }
}

const CurrentUserInteractivePlane: React.FC<{
    playerRef: MutableRefObject<Object3D>
}> = ({playerRef}) => {

    const currentRoom = useCurrentRoomId()

    const localRef = useRef({
        active: false,
        pointerDown: 0,
        pointerUp: 0,
    })

    const onClick = (event: MouseEvent) => {
        event.stopPropagation()
        const {point} = event
        const {x, y} = point
        if (uiProxy.editMode) {
            if (editingProxy.editMode === EDIT_MODE.add) {
                handleAddSceneryInstance(currentRoom, x, y)
            } else if (editingProxy.editMode === EDIT_MODE.remove) {
                // deleteSelectedAssets(currentRoom)
            } else {
                clearSelectedAssets()
            }
            return
        }
        inputsRawState.active = false
        const playerX = playerRef.current.position.x
        const playerY = playerRef.current.position.y
        const distance = calculateVectorsDistance(playerX, x, playerY, y)
        inputsProxy.targetPositionSpeed = calculateTargetPositionSpeed(distance)
        inputsProxy.targetPosition = [x, y]
    }

    const calculateTargetVelocity = (event: MouseEvent) => {
        const {point} = event
        const {x, y} = point
        if (uiProxy.editMode) {
            editingProxy.position.x = x
            editingProxy.position.y = y
            return
        }
        if (!localRef.current.active) return
        const currentX = playerRef.current.position.x
        const currentY = playerRef.current.position.y
        const vector = calculateVectorBetweenVectors(x, currentX, y, currentY)
        const distance = calculateVectorsDistance(currentX, x, currentY, y)
        inputsProxy.targetPositionSpeed = calculateTargetPositionSpeed(distance)
        inputsProxy.targetVelocity = vector
    }

    const onPointerDown = (event: MouseEvent) => {
        event.stopPropagation()
        inputsProxy.targetPosition = null
        localRef.current.active = true
        localRef.current.pointerDown = Date.now()
        calculateTargetVelocity(event)

        const diff = Date.now() - localRef.current.pointerUp
        inputsProxy.running = diff < 500

    }

    const onPointerUp = (event: MouseEvent) => {
        event.stopPropagation()
        localRef.current.active = false
        localRef.current.pointerUp = Date.now()
        inputsProxy.targetVelocity = null

        const diff = Date.now() - localRef.current.pointerDown

        if (diff < 400) {
            onClick(event)
        } else {
            inputsProxy.running = false
        }

        localRef.current.pointerDown = 0

    }

    const onPointerLeave = (event: MouseEvent) => {
        // event.stopPropagation()
        localRef.current.active = false
        localRef.current.pointerDown = 0
        inputsProxy.targetVelocity = null
        inputsProxy.running = false
    }

    const onPointerMove = (event: MouseEvent) => {
        // event.stopPropagation()
        calculateTargetVelocity(event)
    }

    const onPointerEnter = (event: MouseEvent) => {
        // event.stopPropagation()
    }

    return (
        <Plane visible={false} position={[0, 0, 0.005]} args={[1000, 1000]}
               onPointerDown={onPointerDown}
               onPointerUp={onPointerUp}
               onPointerOver={onPointerEnter}
               onPointerOut={onPointerLeave}
               onPointerMove={onPointerMove}
        />
    )
}

export default CurrentUserInteractivePlane
