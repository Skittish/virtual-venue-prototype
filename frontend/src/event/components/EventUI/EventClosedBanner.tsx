import React from "react"
import styled from "styled-components";
import {THEME} from "../../../ui/theme";

const StyledContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  padding: ${THEME.spacing.$2}px;
`

export const EventClosedBanner: React.FC = () => {
    return (
        <StyledContainer>
            Event is currently closed. Nobody else can join. Open the event from the settings menu.
        </StyledContainer>
    )
}