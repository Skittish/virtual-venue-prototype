import {Object3D} from "three";
import {calculateApproximateVectorsDistance, calculateVectorsDistance} from "./vectors";

export const getDistanceBetweenObjects = (objectA: Object3D, objectB: Object3D) => {

    if (!objectA || !objectB) {
        return -1
    }

    return calculateVectorsDistance(objectA.position.x, objectB.position.x, objectA.position.y, objectB.position.y)

}

export const getApproximateDistanceBetweenObjects = (objectA: Object3D, objectB: Object3D) => {

    if (!objectA || !objectB) {
        return -1
    }

    return calculateApproximateVectorsDistance(objectA.position.x, objectB.position.x, objectA.position.y, objectB.position.y)

}
