import React from "react"
import {Cylinder} from "@react-three/drei";
import {useProxy} from "valtio";
import {inputsProxy} from "../../../gameplay/inputs/state";

const CurrentUserTargetPosition: React.FC = () => {

    const targetPosition = useProxy(inputsProxy).targetPosition

    let x = 0
    let y = 0

    if (targetPosition) {
        x = targetPosition[0]
        y = targetPosition[1]
    }

    return (
        <Cylinder visible={!!targetPosition} position={[x, y, 0]} args={[0.4, 0.4, 0.2, 20]} rotation={[Math.PI / 2, 0, 0]}/>
    )
}

export default CurrentUserTargetPosition