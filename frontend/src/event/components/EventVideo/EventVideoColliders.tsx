import {Box, Circle, Plane } from "@react-three/drei"
import React, {useRef} from "react"
import {BodyType, createBoxFixture, createCircleFixture, useBody, useStoreMesh} from "react-three-game-engine";
import {Vec2} from "planck-js";
import {COLLISION_FILTER_GROUPS, COLLISION_GROUP_TYPE} from "../../../physics/collisions";
import {Object3D} from "three";
import {useStoreObject} from "../../../state/objects";

const collisionWidth = 30
const collisionHeight = 20
const collisionOffset = -15

const EventVideoColliders: React.FC<{
    videoUid?: string,
    position: [number, number, number],
    width: number,
}> = ({videoUid = '', position, width}) => {

    const [x, y] = position

    useBody(() => ({
        type: BodyType.static,
        position: Vec2(x + 0, y + collisionOffset),
        fixtures: [
            createBoxFixture({
                width: collisionWidth,
                height: collisionHeight,
                fixtureOptions: {
                    isSensor: true,
                    filterMaskBits: COLLISION_FILTER_GROUPS.player,
                    userData: {
                        videoId: videoUid,
                        groupType: COLLISION_GROUP_TYPE.VIDEO_MAIN_AREA,
                    }
                }
            })
        ],
    }))

    useBody(() => ({
        type: BodyType.static,
        position: Vec2(x, y - 1),
        fixtures: [
            createBoxFixture({
                width: width,
                height: 2,
            })
        ],
    }))

    const videoRef = useRef<Object3D>(null!)

    useStoreObject(`${videoUid}-video`, videoRef)

    return (
        <>
            {/*<Plane args={[collisionWidth, collisionHeight]} position={[0, collisionOffset, 0.02]}>*/}
            {/*    <meshStandardMaterial color="black" transparent opacity={0.1} />*/}
            {/*</Plane>*/}
            <Box position={[0, -20, 5]} ref={videoRef} visible={false}>
                <meshStandardMaterial color="black" transparent opacity={0.5} />
            </Box>
        </>
    )
}

export default EventVideoColliders