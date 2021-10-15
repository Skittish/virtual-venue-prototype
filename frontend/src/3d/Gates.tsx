import React from "react"

const Gates: React.FC = () => {
    const gateDistance = 25
    return (
        <group rotation={[Math.PI / 2, Math.PI / 4, 0]}>
            <mesh position={[0, 0, -gateDistance]}>
                <torusBufferGeometry args={[20, 3, 16, 100]} />
                <meshStandardMaterial color='cyan' />
            </mesh>

            <mesh position={[0, 0, gateDistance]}>
                <torusBufferGeometry args={[20, 3, 16, 100]} />
                <meshStandardMaterial color='pink' />
            </mesh>

            <mesh
                position={[gateDistance, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
            >
                <torusBufferGeometry args={[20, 3, 16, 100]} />
                <meshStandardMaterial color='limegreen' />
            </mesh>

            <mesh
                position={[-gateDistance, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
            >
                <torusBufferGeometry args={[20, 3, 16, 100]} />
                <meshStandardMaterial color='yellow' />
            </mesh>
        </group>
    )
}

export default Gates