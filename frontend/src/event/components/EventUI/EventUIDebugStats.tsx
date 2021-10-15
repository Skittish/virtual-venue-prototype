import React from "react"
import styled from "styled-components";
import {useProxy} from "valtio";
import {connectionsProxy} from "../../../state/connections";
import {useAvailableUsers} from "../../../state/event/users";

const StyledContainer = styled.div`
  position: absolute;
  left: 10px;
  bottom: 10px;
`

const EventUIDebugStats: React.FC = () => {
    const {
        sentStreams,
        receivedStreams,
        peerConnections
    } = useProxy(connectionsProxy)
    const users = useAvailableUsers()
    return (
        <StyledContainer>
            <ul>
                {
                    users.map((user) => {
                        const isConnected = !!peerConnections[user.id]
                        const sent = !!sentStreams[user.id]
                        const received = !!receivedStreams[user.id]
                        return (
                            <li key={user.id}>
                                <div>
                                    {user.name} - connected: {isConnected ? 'y' : 'n'} - stream sent: {sent ? 'y' : 'n'} - stream received: {received ? 'y' : 'n'}
                                </div>
                            </li>
                        )
                    })
                }
            </ul>
        </StyledContainer>
    )
}

export default EventUIDebugStats