import React, {useEffect, useMemo, useState} from "react"
import {Cylinder, Html} from "@react-three/drei";
import {BodyType, createCircleFixture, useBody} from "react-three-game-engine";
import {Vec2} from "planck-js";
import {COLLISION_GROUP_TYPE} from "../../../physics/collisions";
import {SpecialAssetProps} from "./RoomPortal";
import {useIsAdmin, useIsSpeaker} from "../EventUI/EventUISettingsModal";
import {useHtmlRoot} from "../../../state/misc";
import {StageUI} from "./StageUI";
import {useChannelZone} from "./ChannelZone";
import {setStageDisabled, useIsPlayerInsideStage} from "../../../state/collisions";
import { useIsConnectingToGlobalStages } from "../EventUI/ChannelUI";

const Physics: React.FC<{
    uid: string,
    x: number,
    y: number
}> = ({uid, x, y}) => {
    useBody(() => ({
        type: BodyType.static,
        position: Vec2(x, y),
        fixtures: [
            createCircleFixture({
                radius: 8,
                fixtureOptions: {
                    isSensor: true,
                    userData: {
                        uid,
                        groupType: COLLISION_GROUP_TYPE.STAGE,
                    }
                }
            }),
        ],
    }))
    return null
}

export const Stage: React.FC<SpecialAssetProps> = ({uid, x, y, temporary}) => {

    const isAdmin = useIsAdmin()
    const [pointerOver, setPointerOver] = useState(false)
    const [hovered, setHovered] = useState(false)
    const asset = useChannelZone(uid) ?? {}
    const isInside = useIsPlayerInsideStage(uid)

    const {
        isPublic = false,
    } = asset

    const {
        onPointerOver,
        onPointerOut,
    } = useMemo(() => ({
        onPointerOver: () => {
            setPointerOver(true)
        },
        onPointerOut: () => {
            setPointerOver(false)
        },
    }), [])

    const htmlRef = useHtmlRoot()

    const isSpeaker = useIsSpeaker()

    const canUseStage = isAdmin || isSpeaker || isPublic

    useEffect(() => {
        setStageDisabled(uid, !canUseStage)
    }, [canUseStage])

    const {isConnecting, isConnected} = useIsConnectingToGlobalStages()

    const color = useMemo(() => {
        if (isInside) {
            if (isConnecting) {
                return 'red'
            }
            if (isConnected) {
                return 'green'
            }
        }
        return 'orange'
    }, [isInside, isConnecting, isConnected])

    return (
        <>
            {
                ((pointerOver || hovered) && isAdmin) && (
                    <Html position={[0, -5, 0]} center portal={htmlRef}>
                        <StageUI isPublic={isPublic} id={uid} setHovered={setHovered}/>
                    </Html>
                )
            }
            <Cylinder rotation={[Math.PI / 2, 0, 0]} args={[8, 8, 0.5, 20]} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
                <meshBasicMaterial color={color} transparent opacity={0.5} />
            </Cylinder>
            {
                (!temporary) && (
                    <Physics uid={uid} x={x} y={y}/>
                )
            }
        </>
    )
}
