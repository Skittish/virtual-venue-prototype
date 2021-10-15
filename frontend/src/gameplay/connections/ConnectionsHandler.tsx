import React, {useCallback, useEffect, useRef, useState} from "react"
import {io, Socket} from "socket.io-client";
import {SOCKET_URL} from "./config";
import {getCurrentUserId} from "../../state/auth";
import {logConnectionMessage} from "./debugging";
import SocketConnection from "./SocketConnection";
import {getEventUserConnectionsRef} from "../../firebase/refs";
import {useEventId} from "../../event/components/EventDataWrapper";
import {ConnectionsData} from "./Peers";
import {useAudioContextHandler, useMicMuteHandler} from "../audio/AudioHandler";

const ConnectionsHandler: React.FC = () => {

    useAudioContextHandler()
    useMicMuteHandler()

    const localStateRef = useRef({
        retryCount: 0,
    })

    const [socketConnection, setSocketConnection] = useState<{
        socketId: string,
        socket: Socket,
    } | null>(null)

    const createSocketConnection = useCallback((retrying: boolean = false) => {
        if (retrying) {
            logConnectionMessage('[Retry] Initiating socket connection.')
        } else {
            logConnectionMessage('Initiating socket connection.')
        }
        const socket = io(SOCKET_URL, {query: `userID=${getCurrentUserId()}`, autoConnect: true,})
        socket.on("connect", () => {
            const socketId = socket.id
            logConnectionMessage('Socket connection established.')
            logConnectionMessage(`Socket id is: ${socketId}`)
            setSocketConnection({
                socketId,
                socket,
            })
        });
        socket.on("disconnect", () => {
            logConnectionMessage('Socket disconnected.')
            setSocketConnection(null)
            if (localStateRef.current.retryCount < 5) {
                logConnectionMessage('Attempting to establish another socket connection.')
                localStateRef.current.retryCount += 1
                createSocketConnection(true)
            } else {
                logConnectionMessage('Have reached retry limit of 5, so I shall do nothing.')
            }
        })
    }, [])

    useEffect(() => {
        createSocketConnection()
    }, [])

    const eventId = useEventId()

    const [connectionsData, setConnectionsData] = useState<ConnectionsData>({})

    useEffect(() => {
        const connectionsRef = getEventUserConnectionsRef(eventId, getCurrentUserId())
        connectionsRef.on('value', snapshot => {
            const data = snapshot.val()
            if (data) {
                setConnectionsData(data)
            }
        })
        return () => {
            connectionsRef.off('value')
        }
    }, [eventId])

    if (socketConnection) {
        return <SocketConnection connectionsData={connectionsData} socket={socketConnection.socket} socketId={socketConnection.socketId} key={socketConnection.socketId}/>
    }

    return null
}

export default ConnectionsHandler