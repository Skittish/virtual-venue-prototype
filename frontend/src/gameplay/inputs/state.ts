import {proxy} from "valtio";

export const inputsRawState: {
    active: boolean,
    horizontal: number,
    vertical: number,
    targetPosition: null | [number, number],
    running: boolean,
} = {
    active: false,
    horizontal: 0,
    vertical: 0,
    targetPosition: null,
    running: false,
}

export const inputsProxy = proxy<{
    targetPositionSpeed: number,
    targetPosition: null | [number, number],
    targetVelocity: null | [number, number],
    running: boolean,
}>({
    targetPosition: null,
    targetPositionSpeed: 0,
    targetVelocity: null,
    running: false,
})