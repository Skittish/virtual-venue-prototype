import React, {useCallback, useEffect, useRef, useState} from "react"
import {useUser} from "../../state/event/users";
import {addAudioStream} from "../../state/audio";
import * as Sentry from "@sentry/react";
import {connectionsProxy} from "../../state/connections";

const STREAM_RECEIVED_MESSAGE = 'stream_received'

const UserAudio: React.FC<{
    audioStream: any,
    userId: string,
    connectToUser: (id: string, userId: string) => Promise<any>,
    peer: any | null,
    onUnmount: (peerUid: string) => void,
}> = ({userId, connectToUser, peer, audioStream, onUnmount}) => {

    const user = useUser(userId)
    const [busy, setBusy] = useState(false)
    const [connected, setConnected] = useState(false)
    const [readyToReceiveStream, setReadyToReceiveStream] = useState(false)
    const [userStream, setUserStream] = useState<any>(null)
    const localStateRef = useRef<{
        peersWithStreamAdded: {
            [key: string]: boolean,
        },
    }>({
        peersWithStreamAdded: {},
    })
    const [pendingSentStream, setPendingSentStream] = useState('')
    const [retryCount, setRetryCount] = useState(-1)

    const {socketId, online} = user

    const handleConnect = async (id: string) => {

        if (busy) return
        setBusy(true)

        try {
            await connectToUser(id, userId)
            setConnected(true)
        } catch (error) {
            Sentry.captureMessage("Failed to connect.");
            Sentry.captureException(error);
            console.error('connection failed', error)
            setConnected(false)
        } finally {
            setBusy(false)
        }


    }

    useEffect(() => {

        if (online && socketId) {
            handleConnect(socketId)
        }

    }, [socketId, userId, online])

    const sendStream = useCallback(() => {
        if (peer && audioStream) {
            const peerUid = peer._id
            if (localStateRef.current.peersWithStreamAdded[peerUid]){
                console.warn('Stream already added.')
                Sentry.captureMessage("Stream already added.");
                try {
                    peer.removeStream(audioStream)
                    console.log('audioStream', audioStream)
                } catch (error) {
                    Sentry.captureMessage("Failed to remove stream.");
                    Sentry.captureException(error);
                }
            }
            try {
                peer.addStream(audioStream)
                localStateRef.current.peersWithStreamAdded[peerUid] = true
                setPendingSentStream(peerUid)
            } catch (error) {
                Sentry.captureMessage("Failed to add stream.");
                Sentry.captureException(error);
                console.error(error)
                // todo - retry
            }
        }
    }, [peer, audioStream])

    useEffect(() => {

        if (peer && audioStream) {
            sendStream()
        }

    }, [peer, audioStream, sendStream])

    useEffect(() => {

        if (!peer) return

        const peerUid = peer._id
        connectionsProxy.peerConnections[userId] = true

        peer.on('stream', (stream: any) => {
            connectionsProxy.receivedStreams[userId] = true
            peer.send(STREAM_RECEIVED_MESSAGE)
            setUserStream(stream)
        })

        peer.on('data', (data: any) => {
            if (data === STREAM_RECEIVED_MESSAGE) {
                connectionsProxy.sentStreams[userId] = true
                setPendingSentStream('')
            }
        })

        return () => {
            connectionsProxy.peerConnections[userId] = false
            connectionsProxy.sentStreams[userId] = false
            connectionsProxy.receivedStreams[userId] = false
            peer.destroy()
            onUnmount(peerUid)
        }

    }, [peer])

    useEffect(() => {

        if (retryCount > 0) {
            sendStream()
        }

    }, [retryCount])

    useEffect(() => {
        if (!pendingSentStream) return
        const timeout = setTimeout(() => {
            const message = `2 seconds have passed and the stream hasn't been received.`
            console.warn(message)
            Sentry.captureMessage(message);
            localStateRef.current.peersWithStreamAdded[pendingSentStream] = false
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

export default UserAudio