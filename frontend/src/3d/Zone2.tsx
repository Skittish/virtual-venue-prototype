import { Cylinder } from "@react-three/drei"
import React from "react"

const locations = [
    {
        x: 50,
        y: -50,
    },
    {
        x: 80,
        y: -80,
    },
    {
        x: 110,
        y: -110,
    },
    {
        x: 140,
        y: -140,
    },
    {
        x: 170,
        y: -170,
    },
    {
        x: 200,
        y: -200,
    },
    {
        x: 230,
        y: -230,
    },
]

const Zone2: React.FC = () => {
    return (
        <>
            {
                locations.map(({x, y}, index) => (
                    <Cylinder rotation={[Math.PI / 2, 0, 0]} position={[x, y, 0]} key={index} args={[10, 10, 20, 32]} castShadow receiveShadow>
                        <meshStandardMaterial color='limegreen' />
                    </Cylinder>
                ))
            }
        </>
    )
}

export default Zone2