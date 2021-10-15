import {proxy} from "valtio";

export const playerProxy = proxy({
    isMoving: false,
    insideStage: false,
})