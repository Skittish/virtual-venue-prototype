import { Box } from "@react-three/drei";
import React from "react"
import {tileSize} from "./Floor";

const Divider: React.FC<{
    position: [number, number, number],
    rotation?: [number, number, number]
}> = ({position, rotation = [0, 0, 0]}) => {
    return (
        <Box args={[2, 40, tileSize * 0.5]} position={position} rotation={rotation}>
            <meshStandardMaterial
                color='#666666'
                metalness={0.5}
                roughness={0.5}
            />
        </Box>
    )
}

const Dividers: React.FC = () => {
    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            <Divider position={[0, 0, -tileSize * 0.5]} />
            <Divider position={[0, 0, tileSize * 0.5]} />
            <Divider
                position={[-tileSize * 0.5, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
            />
            <Divider
                position={[tileSize * 0.5, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
            />
        </group>
    )
}

export default Dividers