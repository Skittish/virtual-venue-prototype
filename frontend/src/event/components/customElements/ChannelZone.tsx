import { Box } from "@react-three/drei"
import React, {useEffect} from "react"
import {SpecialAssetProps} from "./RoomPortal";
import {BodyType, createBoxFixture, createCircleFixture, useBody} from "react-three-game-engine";
import {Vec2} from "planck-js";
import {COLLISION_GROUP_TYPE} from "../../../physics/collisions";
import {useSceneryInstance} from "../../../state/event/rooms";
import {useIsEditMode} from "../../../state/editing";
import {useCollidedChannelZone} from "../../../state/collisions";
import {setChannelManualAttenuation} from "../../../state/audio";
import {useIsChannelConnected, useIsHifiSpaceConnected} from "../../audio/EventHifiAudioHandler";

const Physics: React.FC<{
    uid: string,
    x: number,
    y: number,
    width: number,
    height: number,
}> = ({uid, x, y, width, height}) => {

    useBody(() => ({
        type: BodyType.static,
        position: Vec2(x, y),
        fixtures: [
            createBoxFixture({
                width,
                height,
                fixtureOptions: {
                    isSensor: true,
                    userData: {
                        uid,
                        groupType: COLLISION_GROUP_TYPE.CHANNEL_ZONE,
                    }
                }
            }),
        ],
    }))

    return null
}

export const useChannelZone = (sceneryId: string) => {
    return useSceneryInstance(sceneryId)
}

export const DEFAULT_CHANNEL_ZONE_WIDTH = 50
export const DEFAULT_CHANNEL_ZONE_HEIGHT = 50

export const ChannelZone: React.FC<SpecialAssetProps> = ({temporary, uid, x, y,}) => {

    const asset = useChannelZone(uid) ?? {}
    const channelId = asset?.channelId ?? ''
    const isEditMode = useIsEditMode()
    const collidedChannelZone = useCollidedChannelZone()
    const isCollided = channelId === collidedChannelZone

    const isConnected = useIsChannelConnected(channelId)
    const notConnected = isCollided && !isConnected

    const {
        width = DEFAULT_CHANNEL_ZONE_WIDTH,
        height = DEFAULT_CHANNEL_ZONE_HEIGHT,
        attenuation = '',
    } = asset

    useEffect(() => {
        if (isCollided && attenuation !== '') {
            setChannelManualAttenuation(attenuation)
            return () => {
                setChannelManualAttenuation(undefined)
            }
        }
    }, [isCollided, attenuation])

    return (
        <>
            {
                (isEditMode || notConnected) && (
                    <Box args={[width, height, 1]}>
                        <meshBasicMaterial color="orange" transparent opacity={0.5} />
                    </Box>
                )
            }
            {
                (!temporary && channelId) && (
                    <Physics uid={channelId} width={width} height={height} x={x} y={y} key={[channelId,width,height,x,y].join(',')}/>
                )
            }
        </>
    )
}
