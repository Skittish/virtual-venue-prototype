import React, {useCallback, useEffect, useRef, useState} from "react"
import {connectionsProxy} from "../../state/connections";
import * as Sentry from "@sentry/react";
import {logConnectionMessage} from "./debugging";
import {addAudioStream} from "../../state/audio";
import {
    UpdateSubscription,
    usePlayerUpdatesSubscribe
} from "../../event/components/CurrentUser/PlayerUpdatesHandler.context";
import {addUserSnapshot, decompressDataSnapshot} from "../../state/event/snapshots";

enum PEER_MESSAGES {
    PLAYER_UPDATE = 'PLAYER_UPDATE',
    STREAM_RECEIVED = 'STREAM_RECEIVED',
    STREAM_REQUESTED = 'STREAM_REQUESTED',
    STREAM_REQUESTED_ACKNOWLEDGED = 'STREAM_REQUESTED_ACKNOWLEDGED',
}

const useOnPlayerUpdate = (onUpdate: UpdateSubscription) => {
    const subscribe = usePlayerUpdatesSubscribe()
    const onUpdateRef = useRef(onUpdate)
    useEffect(() => {
        onUpdateRef.current = onUpdate
    }, [onUpdate])
    useEffect(() => {
        return subscribe(onUpdateRef)
    }, [subscribe])
}

const UserPeer: React.FC<{
    audioStream: any,
    userId: string,
    peer: any,
    onDisconnect: () => void,
}> = ({
          audioStream,
          userId,
          peer,
          onDisconnect,
      }) => {

    useOnPlayerUpdate((snapshot: any) => {
        try {
            peer.write(snapshot)
        } catch (e) {
            console.error(e)
        }
    })

    const [userStream, setUserStream] = useState<any>(null)

    const localStateRef = useRef({
        streamSending: false,
    })

    const [streamRequestAcknowledged, setStreamRequestAcknowledged] = useState(false)
    const [streamRequested, setStreamRequested] = useState(false)
    const [pendingSentStream, setPendingSentStream] = useState('')
    const [retryCount, setRetryCount] = useState(-1)

    useEffect(() => {

        connectionsProxy.peerConnections[userId] = true

        // peer.on('stream', (stream: any) => {
        //     logConnectionMessage(`Stream received from ${userId}.`)
        //     connectionsProxy.receivedStreams[userId] = true
        //     peer.send(PEER_MESSAGES.STREAM_RECEIVED)
        //     setUserStream(stream)
        // })

        const handleData = (dataBuffer: string) => {
            const parsedData = decompressDataSnapshot(dataBuffer)
            addUserSnapshot(userId, parsedData)
        }

        peer.on('data', (data: any) => {
            switch (data) {
                // case PEER_MESSAGES.STREAM_RECEIVED:
                //     logConnectionMessage(`Stream that I sent to ${userId} has been received.`)
                //     localStateRef.current.streamSending = false
                //     connectionsProxy.sentStreams[userId] = true
                //     setPendingSentStream('')
                //     break;
                // case PEER_MESSAGES.STREAM_REQUESTED:
                //     logConnectionMessage(`Stream requested from ${userId}`)
                //     setStreamRequested(true)
                //     peer.send(PEER_MESSAGES.STREAM_REQUESTED_ACKNOWLEDGED)
                //     break;
                // case PEER_MESSAGES.STREAM_REQUESTED_ACKNOWLEDGED:
                //     logConnectionMessage(`Stream request acknowledged from ${userId}`)
                //     setStreamRequestAcknowledged(true)
                //     break;
                default:
                    handleData(data)
                    break;
            }
        })

        return () => {
            logConnectionMessage(`Disconnect from ${userId}`)
            onDisconnect()
            peer.destroy()
            connectionsProxy.peerConnections[userId] = false
            connectionsProxy.sentStreams[userId] = false
            connectionsProxy.receivedStreams[userId] = false
        }

    }, [])

    // useEffect(() => {
    //     if (streamRequestAcknowledged) return
    //     const interval = setInterval(() => {
    //         try {
    //             peer.send(PEER_MESSAGES.STREAM_REQUESTED)
    //         } catch (error) {
    //             console.error(error)
    //             Sentry.captureException(error)
    //         }
    //     }, 200)
    //     return () => {
    //         clearInterval(interval)
    //     }
    // }, [streamRequestAcknowledged])

    // const sendStream = useCallback(() => {
    //     if (peer && audioStream) {
    //         const peerUid = peer._id
    //         logConnectionMessage(`Sending stream to: ${userId} @ ${peerUid}`)
    //         if (localStateRef.current.streamSending) {
    //             logConnectionMessage(`Stream already added.`)
    //             console.warn('Stream already added.')
    //             Sentry.captureMessage("Stream already added.");
    //             try {
    //                 logConnectionMessage(`Attempting to remove stream from ${peerUid}.`)
    //                 peer.removeStream(audioStream)
    //             } catch (error) {
    //                 logConnectionMessage(`Failed to remove stream from ${peerUid}.`)
    //                 Sentry.captureMessage("Failed to remove stream.");
    //                 Sentry.captureException(error);
    //             }
    //         }
    //         try {
    //             logConnectionMessage(`Adding stream to peer ${peerUid}.`)
    //             peer.addStream(audioStream)
    //             localStateRef.current.streamSending = true
    //             setPendingSentStream(peerUid)
    //         } catch (error) {
    //             logConnectionMessage(`Failed to add stream.`)
    //             Sentry.captureMessage("Failed to add stream.");
    //             Sentry.captureException(error);
    //             console.error(error)
    //             // todo - retry
    //         }
    //     }
    // }, [peer, audioStream])

    // useEffect(() => {
    //
    //     if (peer && audioStream && streamRequested) {
    //         sendStream()
    //     }
    //
    // }, [peer, audioStream, sendStream, streamRequested])

    // useEffect(() => {
    //
    //     if (retryCount > 0) {
    //         logConnectionMessage(`Retrying sending stream.`)
    //         sendStream()
    //     }
    //
    // }, [retryCount])

    useEffect(() => {
        if (!pendingSentStream) return
        const timeout = setTimeout(() => {
            const message = `2 seconds have passed and the stream hasn't been received.`
            logConnectionMessage(message)
            console.warn(message)
            Sentry.captureMessage(message);
            setRetryCount(state => {
                if (state === 0) return state
                if (state === -1) return 5
                return state - 1
            })
        }, 2000)
        return () => {
            clearTimeout(timeout)
        }
    }, [pendingSentStream])

    useEffect(() => {
        if (userStream) {
            return addAudioStream(userId, userStream)
        }
    }, [userStream])

    return null
}

export default UserPeer
