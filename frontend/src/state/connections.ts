import {proxy, useProxy} from "valtio";

export const connectionsProxy = proxy<{
    peerConnections: {
        [key: string]: boolean,
    },
    receivedStreams: {
        [key: string]: boolean,
    },
    sentStreams: {
        [key: string]: boolean,
    },
}>({
    peerConnections: {},
    receivedStreams: {},
    sentStreams: {},
})

export const useIsConnected = (userId: string) => {
    return useProxy(connectionsProxy).peerConnections[userId] ?? false
}