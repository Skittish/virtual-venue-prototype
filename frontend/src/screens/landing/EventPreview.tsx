import React from "react"
import styled from "styled-components"
import image from "../../assets/images/icon.png"
import {Link} from "react-router-dom";

const StyledContainer = styled(Link)`
  display: grid;
  column-gap: 8px;
  align-items: center;
  grid-template-columns: auto 1fr;
  color: inherit;
  text-decoration: none;
  border-radius: 8px;
  transition: background 250ms ease;
  
  &:hover {
    background-color: rgba(0,0,0,0.1);
  }
  
`

const StyledThumb = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: rgba(0,0,0,0.1);
  border: 2px solid rgba(0,0,0,0.1);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
`

const StyledName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
`

const EventPreview: React.FC<{
    code: string,
    name: string,
}> = ({code, name}) => {
    return (
        <StyledContainer to={`/event/${code}`}>
            <StyledThumb>
                <img src={image} alt="Event icon" />
            </StyledThumb>
            <StyledName>
                {name}
            </StyledName>
        </StyledContainer>
    )
}

export default EventPreview

const StyledList = styled.ul`

    > li {
      &:not(:first-child) {
        margin-top: 8px;
      }
    }

`

export const EventPreviews: React.FC<{
    events: {
        code: string,
        name: string,
    }[],
}> = ({events}) => {
    return (
        <StyledList>
            {
                events.map(({code, name}) => (
                    <li key={code}>
                        <EventPreview code={code} name={name}/>
                    </li>
                ))
            }
        </StyledList>
    )
}