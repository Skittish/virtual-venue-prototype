import {io} from "socket.io-client";
import Peer from "simple-peer";
import * as Sentry from "@sentry/react";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useCurrentUserId, useIsAuthenticated} from "../../state/auth";
import {getEventUserRef} from "../../firebase/refs";
import {useEventId} from "../../event/components/EventDataWrapper";
import {useUsersList, useUsersWithSocketsList} from "../../state/event/users";
import UserAudio from "./UserAudio";
import {audioState, setAudioContext, useAudioStream, useSiteInteracted} from "../../state/audio";
import {useProxy} from "valtio";

const devUrl = 'http://localhost:8080'
const prdUrl = ''
const url = prdUrl

export const useAudioContextHandler = () => {

    const siteInteracted = useSiteInteracted()

    useEffect(() => {

        if (siteInteracted) {
            const AudioContext = window.AudioContext // Default
                // @ts-ignore
                || window.webkitAudioContext // Safari and old versions of Chrome
                || false;
            if (AudioContext) {
                const audioContext = new AudioContext();
                setAudioContext(audioContext)
            } else {
                console.error('this browser does not support audio context')
            }
        }

    }, [siteInteracted])

}

export const useMicMuteHandler = () => {
    const audioStream = useAudioStream()
    const micMuted = useProxy(audioState).micMuted

    useEffect(() => {
        if (!audioStream) return
        audioStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
            track.enabled = !micMuted
        })
    }, [audioStream, micMuted])

}

const AudioHandler: React.FC<{
    userId: string,
}> = ({userId}) => {
    useAudioContextHandler()
    useMicMuteHandler()
    const audioStream = useAudioStream()
    const eventId = useEventId()
    const authenticated = useIsAuthenticated()
    const [socketId, setSocketId] = useState('')
    const [connected, setConnected] = useState(false)
    const [peers, setPeers] = useState<{
        [id: string]: any,
    }>({})
    const connectionsRef = useRef<{
        [key: string]: number,
    }>({})
    const destroyedPeersRef = useRef<{
        [key: string]: boolean,
    }>({})

    const isDestroyed = (socketId: string) => {
        const destroyed = destroyedPeersRef.current[socketId] ?? false
        return destroyed
    }

    const [socket] = useMemo(() => {
        const socket = io(url, {query: `userID=${userId}`, autoConnect: true,})
        socket.on("connect", () => {
            setSocketId(socket.id)
            setConnected(true)
        });
        return [socket]
    }, [])

    useEffect(() => {

        let unmounted = false

        socket.on('peer', (data: any) => {


            const peerSocketId = data.peerId
            const peerId = data.targetId
            const iceServerConfig = data.iceServerConfig

            destroyedPeersRef.current[peerSocketId] = false

            const peer = new Peer({
                initiator: data.initiator,
                trickle: true,
                objectMode: true,
                config: { iceServers: iceServerConfig },
            })

            const peerUid = peer._id

            socket.on('signal', (data: any) => {
                if (isDestroyed(peerUid)) return
                if (unmounted) return
                if (data.peerId === peerSocketId) {
                    try {
                        peer.signal(data.signal);
                    } catch (error) {
                        Sentry.captureMessage("Signal failure.");
                        Sentry.captureException(error);
                        console.error(error)
                        console.log('signal failed', peerSocketId)
                    }
                }
            });

            peer.on('signal', (data: any) => {
                if (isDestroyed(peerUid)) return
                if (unmounted) return
                socket.emit('signal', {
                    signal: data,
                    peerId: peerSocketId
                });
            });

            peer.on('error', (error: any) => {
                Sentry.captureMessage("Peer error.");
                Sentry.captureException(error);
                console.error('Error sending connection to peer %s:', peerSocketId, error);
            });

            peer.on('connect', () => {
                if (isDestroyed(peerUid)) return
                if (unmounted) return
                setPeers(prevState => {
                    return {
                        ...prevState,
                        [peerSocketId]: peer,
                    }
                })
            });

            peer.on('disconnect', () => {
                if (isDestroyed(peerUid)) return
                if (unmounted) return
                setPeers(prevState => {
                    const updatedState = {
                        ...prevState,
                    }
                    delete updatedState[peerSocketId]
                    return updatedState
                })
            })

        })

        return () => {
            unmounted = true
        }

    }, [socket])

    useEffect(() => {

        if (authenticated && socketId) {

            const ref = getEventUserRef(eventId, userId)

            ref.update({
                socketId,
            })

        }

    }, [socketId, authenticated, eventId, userId])


    const users = useUsersWithSocketsList()

    const connectToUser = useCallback(async (id: string, targetId: string) => {
        console.log('want to connect to', id, targetId)
        connectionsRef.current[id] = Date.now()
        socket.emit('connectionRequest', {id, userId, targetId})
    }, [socket, userId])

    const disconnectUser = useCallback((id: string, socketId: string, peerUid: string) => {
        destroyedPeersRef.current[peerUid] = true
        setPeers(state => {
            let updatedState = {
                ...state,
            }
            delete updatedState[socketId]
            return updatedState
        })
    }, [])

    if (!connected) return null

    return (
        <>
            {
                users.map(([peerUserId, socketId]) => (
                    <UserAudio
                        audioStream={audioStream}
                        userId={peerUserId}
                        connectToUser={connectToUser}
                        peer={peers[socketId] ?? null}
                        onUnmount={(peerUid: string) => disconnectUser(peerUserId, socketId, peerUid)}
                        key={socketId}
                    />
                ))
            }
        </>
    )
};

const Wrapper: React.FC = () => {

    const userId = useCurrentUserId()

    if (!userId) return null

    return <AudioHandler userId={userId}/>

}

export default Wrapper;