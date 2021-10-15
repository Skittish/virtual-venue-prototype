import {MutableRefObject, useEffect, useRef, useState} from "react";
import {Object3D} from "three";
import {useFrame} from "react-three-fiber";

export const useIsPlayerMoving = (ref: MutableRefObject<Object3D | undefined>) => {
    const [isMoving, setIsMoving] = useState(false)
    const [temporaryIsMoving, setTemporaryIsMoving] = useState(isMoving)
    const localStateRef = useRef({
        previousX: ref.current?.position.x ?? 0,
        previousY: ref.current?.position.y ?? 0,
    })

    useFrame((state, delta) => {

        if (!ref.current) return

        const {x, y} = ref.current.position

        const xDiff = Math.abs(localStateRef.current.previousX - x)
        const yDiff = Math.abs(localStateRef.current.previousY - y)
        const minDistance = 0.25 * delta

        if (xDiff > minDistance || yDiff > minDistance) {
            setTemporaryIsMoving(true)
        } else {
            setTemporaryIsMoving(false)
        }

        localStateRef.current.previousX = x
        localStateRef.current.previousY = y
    })

    useEffect(() => {
        if (temporaryIsMoving) {
            setIsMoving(true)
        } else {
            const timeout = setTimeout(() => {
                setIsMoving(false)
            }, 50)
            return () => {
                clearTimeout(timeout)
            }
        }
    }, [temporaryIsMoving])


    return isMoving
}