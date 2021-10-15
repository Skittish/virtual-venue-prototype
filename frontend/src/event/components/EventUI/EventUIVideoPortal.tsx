import React, {useEffect, useState} from "react"
import {createPortal} from "react-dom";
import {getVideoPortalId} from "./EventUIVideoContainer";

const EventUIVideoPortal: React.FC<{
    videoId: string,
}> = ({children, videoId}) => {
    const [domElement, setDomElement] = useState<HTMLElement | null>(null)

    useEffect(() => {

        const id = getVideoPortalId(videoId)

        const element = document.getElementById(id)
        if (element) {
            setDomElement(element)
        } else {
            let count = 0
            const interval = setInterval(() => {
                count += 1
                const element = document.getElementById(id)
                if (element) {
                    setDomElement(element)
                    clearInterval(interval)
                } else if (count >= 5) {
                    console.error(`unable to find html element #${id} to inject the video content into`)
                    clearInterval(interval)
                }
            }, 250)
        }

    }, [])

    if (!domElement) return null

    return createPortal(children, domElement, videoId)
}

export default EventUIVideoPortal