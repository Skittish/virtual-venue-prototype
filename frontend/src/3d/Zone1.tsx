import React from "react"
import {Octahedron} from "@react-three/drei";

const locations = [
    {
        x: -50,
        y: -50,
    },
    {
        x: -80,
        y: -80,
    },
    {
        x: -110,
        y: -110,
    },
    {
        x: -140,
        y: -140,
    },
    {
        x: -170,
        y: -170,
    },
    {
        x: -200,
        y: -200,
    },
    {
        x: -230,
        y: -230,
    },
]

const Zone1: React.FC = () => {
    return (
        <>
            {
                locations.map(({x, y}, index) => (
                    <Octahedron args={[10, 10]} position={[x, y, 0]} key={index.toString()} castShadow receiveShadow>
                        <meshStandardMaterial color='cyan' />
                    </Octahedron>
                ))
            }
        </>
    )
}

export default Zone1