import React from "react"
import { Engine } from "react-three-game-engine"

// @ts-ignore
import PhysicsWorker from '../../workers/physics/physics.worker';

const physicsWorker = new PhysicsWorker()

const EngineWrapper: React.FC = ({children}) => {

    return (
        <Engine physicsWorker={physicsWorker}>
            {children}
        </Engine>
    )
}

export default EngineWrapper