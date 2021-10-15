import React, {useEffect, useState} from "react"
import {useTweaks} from "use-tweaks";
import {MATERIALS} from "../3d/materials";

const ColorTweaker: React.FC = () => {

    const [colors] = useState(() => {
        const colors: {
            [key: string]: string
        } = {}
        Object.entries(MATERIALS).forEach(([key, material]) => {
            colors[key] = `#${material.color.getHexString()}`
        })
        return colors
    })

    const updatedColors = useTweaks(colors)

    useEffect(() => {
        Object.entries(updatedColors).forEach(([key, value]) => {
            MATERIALS[key].color.set(value)
        })
    }, [updatedColors])

    return null
}

export default ColorTweaker