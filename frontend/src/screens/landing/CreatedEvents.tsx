import React from "react"
import { Link } from "react-router-dom";
import styled from "styled-components";
import {userDataProxy, useUserData} from "../../state/user";
import {useProxy} from "valtio";

const StyledList = styled.ul`
  
    > li {
      margin-top: 15px;
    }
    
`

const StyledEventLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  font-weight: 800;
  font-size: 1.25rem;
  
  &:hover {
    text-decoration: underline;
  }
  
`

export const Events: React.FC<{
    events: string[]
}> = ({
                               events,
                           }) => {

    const {
        loading,
    } = useProxy(userDataProxy)

    if (events.length === 0 && loading) {
        return (
            <div>
                loading...
            </div>
        )
    }

    return (
        <StyledList>
            {
                events.map((eventCode) => (
                    <li key={eventCode}>
                        <div>
                            <StyledEventLink to={`/event/${eventCode}`}>
                                {eventCode}
                            </StyledEventLink>
                        </div>
                    </li>
                ))
            }
        </StyledList>
    )
}

export const JoinedEvents: React.FC = () => {

    const userData = useUserData()

    const events = Object.keys(userData?.joinedEvents ?? {})

    return <Events events={events}/>
}

const CreatedEvents: React.FC = () => {

    const userData = useUserData()

    const events = Object.keys(userData?.events ?? {})

    return <Events events={events}/>
}

export default CreatedEvents