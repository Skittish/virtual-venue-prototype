import React from "react"
import {useUsersWithSocketsList} from "../../state/event/users";
import UserConnectionHandler from "./UserConnectionHandler";
import UserPeer from "./UserPeer";
import {useAudioStream} from "../../state/audio";

export type ConnectionsData = {
    [key: string]: {
        initiator: boolean,
        socketId: string,
    }
}

const Peers: React.FC<{
    connectionsData: ConnectionsData,
    requestConnection: (userId: string, isInitiator: boolean) => void,
    connectToPeer: (socketId: string, userId: string) => void,
    peers: {
        [key: string]: any
    },
    onDisconnect: (peerId: string) => void
}> = ({connectionsData, requestConnection, connectToPeer, peers, onDisconnect}) => {

    const audioStream = useAudioStream()
    const users = useUsersWithSocketsList()

    const usersWithConnectedPeers = users.map(([peerUserId, socketId]) => {
        return {
            peerUserId,
            socketId,
            peer: peers[socketId] ?? null
        }
    }).filter(({peer}) => {
        return !!peer
    })

    return (
        <>
            {
                usersWithConnectedPeers.map(({
                    peerUserId,
                    peer,
                    socketId,
                }) => (
                    <UserPeer audioStream={audioStream} userId={peerUserId} peer={peer} onDisconnect={() => onDisconnect(peer._id)} key={`${peer._id}`}/>
                ))
            }
            {
                users.map(([peerUserId, socketId]) => (
                    <UserConnectionHandler
                        userId={peerUserId}
                        socketId={socketId}
                        peer={peers[socketId] ?? null}
                        onDisconnect={onDisconnect}
                        connectionRequest={connectionsData[peerUserId] || null}
                        requestConnection={requestConnection}
                        connectToPeer={connectToPeer}
                        key={`${peerUserId}:${socketId}`}/>
                ))
            }
        </>
    )
}

export default Peers