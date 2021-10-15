import React, {useCallback, useEffect, useRef, useState} from "react"
import {Socket} from "socket.io-client";
import {useEventId} from "../../event/components/EventDataWrapper";
import Peer from "simple-peer";
import {logConnectionMessage} from "./debugging";
import * as Sentry from "@sentry/react";
import Peers, {ConnectionsData} from "./Peers";
import {setEventUserConnectionRequest, setEventUserSocketId} from "../../firebase/event";
import {getCurrentUserId} from "../../state/auth";

const SocketConnection: React.FC<{
    connectionsData: ConnectionsData,
    socket: Socket,
    socketId: string,
}> = ({
          connectionsData,
          socket,
          socketId
      }) => {

    const eventId = useEventId()
    const localStateRef = useRef<{
        destroyedPeers: {
            [key: string]: true,
        }
    }>({
        destroyedPeers: {},
    })
    const [peers, setPeers] = useState<{
        [key: string]: any,
    }>({})
    const peersRef = useRef(peers)

    useEffect(() => {
        peersRef.current = peers
    }, [peers])

    const isPeerDestroyed = useCallback((peerId: string) => {
        return !!localStateRef.current.destroyedPeers[peerId]
    }, [])

    useEffect(() => {

        let unmounted = false

        socket.on('signal', (data: any) => {
            const signalPeerSocketId = data.peerId
            const peer = peersRef.current[signalPeerSocketId]
            if (peer) {
                logConnectionMessage(`Handling signal from ${signalPeerSocketId}`, false)
                try {
                    peer.signal(data.signal);
                } catch (error) {
                    Sentry.captureMessage("Signal failure.");
                    Sentry.captureException(error);
                    console.error(error)
                    const message = `Signal failed for ${signalPeerSocketId}`
                    console.warn(message)
                    logConnectionMessage(message)
                }
            } else {
                const message = `Received signal for ${signalPeerSocketId} but there is no stored peer matching that.`
                console.warn(message)
                Sentry.captureMessage(message)
                logConnectionMessage(message)
            }
        })

        socket.on('peer', (data: any) => {

            const peerSocketId = data.peerId
            logConnectionMessage(`Peer initiated: ${peerSocketId}`)
            const iceServerConfig = data.iceServerConfig

            const peer = new Peer({
                initiator: data.initiator,
                trickle: true,
                // objectMode: true,
                config: {iceServers: iceServerConfig},
            })

            peersRef.current[peerSocketId] = peer


            const peerUid = peer._id

            peer.on('signal', (data: any) => {
                if (isPeerDestroyed(peerUid)) return
                if (unmounted) return
                socket.emit('signal', {
                    signal: data,
                    peerId: peerSocketId
                });
            });

            peer.on('error', (error: any) => {
                const message = `Error with peer ${peerSocketId}:`
                logConnectionMessage(message)
                console.error(error)
                Sentry.captureMessage(message);
                Sentry.captureException(error);
            });

            peer.on('close', () => {
                const message = `Peer ${peerSocketId} closed.`
                logConnectionMessage(message)
                localStateRef.current.destroyedPeers[peerUid] = true
                setPeers(prevState => {
                    const updatedState = {
                        ...prevState,
                    }
                    delete updatedState[peerSocketId]
                    return updatedState
                })
            })

            peer.on('connect', () => {
                if (isPeerDestroyed(peerUid)) return
                if (unmounted) return
                logConnectionMessage(`Connected to ${peerSocketId}`)
                setPeers(prevState => {
                    return {
                        ...prevState,
                        [peerSocketId]: peer,
                    }
                })
            });

            peer.on('disconnect', () => {
                if (isPeerDestroyed(peerUid)) return
                if (unmounted) return
                localStateRef.current.destroyedPeers[peerUid] = true
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
        setEventUserSocketId(eventId, socketId)

        return () => {
            setEventUserSocketId(eventId, '')
        }

    }, [])

    const connectToPeer = useCallback((targetSocketId: string, targetId: string) => {
        const currentUserId = getCurrentUserId()
        logConnectionMessage(`Connecting to socketId: ${targetSocketId}, userId: ${targetId}, from: ${currentUserId}`)
        socket.emit('connectionRequest', {id: targetSocketId, userId: currentUserId, targetId})
    }, [])

    const disconnectPeer = useCallback((peerId: string) => {
        localStateRef.current.destroyedPeers[peerId] = true
    }, [])

    const requestConnection = useCallback((targetUserId: string, isInitiator: boolean) => {
        setEventUserConnectionRequest(eventId, targetUserId, socketId, isInitiator)
    }, [socketId, eventId])

    return (
        <Peers connectionsData={connectionsData} requestConnection={requestConnection} connectToPeer={connectToPeer} peers={peers} onDisconnect={disconnectPeer}/>
    )
}

export default SocketConnection
