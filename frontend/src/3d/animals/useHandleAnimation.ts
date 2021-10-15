import {AnimationAction} from "three";
import {useCallback, useEffect, useRef} from "react";

type ActionName = 'Idle' | 'Walk'
export type GLTFActions = Record<ActionName, AnimationAction>

export const useHandleAnimation = (actions: GLTFActions, moving: boolean, timeScale: number) => {

    const currentAnimationRef = useRef<{
        key: string | null,
        animation: any,
        finished: boolean,
    }>({
        key: null,
        animation: null,
        finished: false,
    })

    const playAnimation = useCallback((animation: any, fadeInDuration: number, fadeDuration: number, key: string | null) => {
        const currentAnimation = currentAnimationRef.current
        if (currentAnimation.animation) {
            currentAnimation.animation.fadeOut(fadeDuration)
        } else {
            fadeInDuration = 0
        }
        animation
            .reset()
            .setEffectiveTimeScale(timeScale)
            .setEffectiveWeight(1)
            .fadeIn(fadeInDuration)
            .play();
        currentAnimation.animation = animation
        currentAnimation.key = key
        currentAnimation.finished = false
    }, [currentAnimationRef])

    useEffect(() => {

        if (moving) {
            playAnimation(actions.Walk, 250 / 1000, 250 / 1000, 'walk')
        } else {
            playAnimation(actions.Idle, 250 / 1000, 250 / 1000, 'idle')
        }

    }, [actions, moving, playAnimation])

}
