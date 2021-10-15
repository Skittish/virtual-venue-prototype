import React, {useEffect, useRef} from "react"
import {Cylinder, Html} from "@react-three/drei";
import {BodyType, createCircleFixture, useBody} from "react-three-game-engine";
import {Vec2} from "planck-js";
import {COLLISION_GROUP_TYPE} from "../../../physics/collisions";
import {useIsRoomPortalCollided} from "../../../state/collisions";
import {useHtmlRoot} from "../../../state/misc";
import RoomPortalUI from "../rooms/RoomPortalUI";

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
                radius: 4,
                fixtureOptions: {
                    isSensor: true,
                    userData: {
                        roomId: uid,
                        groupType: COLLISION_GROUP_TYPE.ROOM_PORTAL,
                    }
                }
            }),
        ],
    }))
    return null
}

export type SpecialAssetProps = {
    uid: string,
    x: number,
    y: number,
    temporary: boolean,
}

const RoomPortal: React.FC<SpecialAssetProps> = ({uid, x, y, temporary}) => {

    const isCollided = useIsRoomPortalCollided(uid)

    const htmlRef = useHtmlRoot()

    return (
        <>
            {
                !temporary && (
                    <group position={[0, 0, 3]}>
                        <Html center portal={htmlRef}>
                            <RoomPortalUI uid={uid} inRange={isCollided}/>
                        </Html>
                    </group>
                )
            }
            {
                !temporary && <Physics uid={uid} x={x} y={y}/>
            }
            <Cylinder rotation={[Math.PI / 2, 0, 0]} args={[4, 4, 0.5, 10]}>
                <meshBasicMaterial color="cyan" transparent opacity={0.5} />
            </Cylinder>
        </>
    )
}

export default RoomPortal