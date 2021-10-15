import {proxy, useProxy} from "valtio";
import React from "react";

export const embeddedVideoProxy = proxy<{
    videoRefs: {
        [key: string]: any,
    },
    videoRef: any,
    cssRootRef: any,
    domMounted: boolean,
}>({
    videoRefs: {},
    videoRef: null,
    cssRootRef: null,
    domMounted: true,
})

export const useVideoRef = (videoId: string) => {
    return useProxy(embeddedVideoProxy).videoRefs[videoId]
}