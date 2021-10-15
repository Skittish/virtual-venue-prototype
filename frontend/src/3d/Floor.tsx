import {Plane} from "@react-three/drei"
import React from "react"

const size = 500
export const tileSize = 250

const color = '#69a74a'

const Floor: React.FC = () => {
    return (
        <>
            <Plane args={[size, size, 64, 64]} receiveShadow>
                <meshStandardMaterial color={color} />
            </Plane>
        </>
    )
}

export default Floor