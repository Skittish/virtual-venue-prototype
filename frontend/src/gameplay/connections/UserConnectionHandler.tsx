import React, {useEffect} from "react"
import {useEventId} from "../../event/components/EventDataWrapper";
import {getCurrentUserId} from "../../state/auth";

const UserConnectionHandler: React.FC<{
    connectionRequest: {
        initiator: boolean,
        socketId: string,
    } | null,
    userId: string,
    socketId: string,
    peer: any | null,
    connectToPeer: (socketId: string, userId: string) => void,
    requestConnection: (userId: string, isInitiator: boolean) => void,
    onDisconnect: (peerId: string) => void,
}> = ({
          connectionRequest,
          requestConnection,
          peer,
          userId,
          socketId,
          onDisconnect,
          connectToPeer,
      }) => {

    const online = true
    const shouldInitiateRequest = online && !!socketId
    const eventId = useEventId()

    useEffect(() => {

        if (!shouldInitiateRequest) return

        const currentUserId = getCurrentUserId()
        const users = [currentUserId, userId].sort()

        const isInitiator = users[0] === currentUserId
        requestConnection(userId, isInitiator)

    }, [shouldInitiateRequest, socketId, eventId])

    const connectionSocketId = connectionRequest ? connectionRequest.socketId : ''
    const connectionInitiator = connectionRequest ? connectionRequest.initiator : false

    useEffect(() => {
        if (connectionInitiator) {
            connectToPeer(connectionSocketId, userId)
        }
    }, [connectionSocketId, connectionInitiator])

    useEffect(() => {
        if (!peer) return
        return () => {
            onDisconnect(peer._id)
        }
    }, [peer])

    return null
}

export default UserConnectionHandler