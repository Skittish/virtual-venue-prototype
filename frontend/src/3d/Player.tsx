import { Box, Circle, Cylinder, Sphere } from "@react-three/drei"
import React, {Suspense, useEffect, useLayoutEffect, useMemo, useRef} from "react"
import {Group, SpotLight} from "three";
import {ANIMALS} from "./animals/animals";
import LoadingAnimalPlaceholder from "./LoadingAnimalPlaceholder";
import {useHifiVolumeListener, useUserVolumeIndicator} from "../event/components/EventUser/EventUserUI";
import {a, useSpring} from "@react-spring/three";

const Player: React.FC<{
    userId: string,
    currentUser?: boolean,
    isMoving?: boolean,
    animal: string,
    hidden?: boolean,
}> = ({userId, currentUser =  false, isMoving = false, animal, hidden = false}) => {



    const [{
        opacity,
    }, set] = useSpring(() => ({
        opacity: 0,
    }))

    useHifiVolumeListener(userId, true, set)

    const scale = opacity.to([0, 1], [1.5, 2])

    const Animal = useMemo(() => {
        if (ANIMALS[animal]) {
            return ANIMALS[animal].component
        }
        return ANIMALS.Chick.component
    }, [animal])

    return (
        <a.group scale-x={scale} scale-y={scale} scale-z={scale} visible={!hidden}>
            <Suspense fallback={<LoadingAnimalPlaceholder animal={animal} showText={currentUser}/>}>
                <Animal key={animal} moving={isMoving}/>
            </Suspense>
        </a.group>
    )

}

export default Player
