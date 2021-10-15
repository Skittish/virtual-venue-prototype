import React, {useCallback, useEffect} from "react"
import {useFrame} from "react-three-fiber";
import {Vec2} from "planck-js";
import hotkeys from "hotkeys-js";
import {inputs, isKeyActive} from "./config";
import {inputsProxy, inputsRawState} from "./state";
import {vectorToAngle} from "../../utils/angles";
import {angleToVector} from "../../utils/vectors";

const vector = Vec2(0, 0)

const calculateRawInput = () => {

    const up = isKeyActive(inputs.up)
    const down = isKeyActive(inputs.down)
    const right = isKeyActive(inputs.right)
    const left = isKeyActive(inputs.left)
    const shift = isKeyActive(inputs.shift)

    const vertical = up ? 1 : down ? -1 : 0
    const horizontal = right ? 1 : left ? -1 : 0

    if (vertical !== 0 || horizontal !== 0) {

        vector.set(horizontal, vertical)

        const originalAngle = vectorToAngle(horizontal, vertical)

        const [xVel, yVel] = angleToVector(originalAngle)

        inputsProxy.targetVelocity = null
        inputsProxy.targetPosition = null
        inputsRawState.active = true
        inputsRawState.horizontal = xVel
        inputsRawState.vertical = yVel
        inputsRawState.running = shift

    } else {

        inputsRawState.active = false
        inputsRawState.horizontal = 0
        inputsRawState.vertical = 0

    }

}

const InputsHandler: React.FC = ({children}) => {

    const onFrame = useCallback(() => {

        calculateRawInput()

    }, [])

    useEffect(() => {

        hotkeys('*', '', () => {})

    }, [])

    useFrame(onFrame)

    return (
        <>
            {children}
        </>
    )
}

export default InputsHandler