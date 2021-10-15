import React from "react";
import JoinView from "../views/JoinView";
import styled from "styled-components";

const StyledContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgb(132 187 91 / 85%);
    z-index: 999999;
`;

const EventOverlay: React.FC = () => {

    return (
        <StyledContainer>
            <JoinView/>
        </StyledContainer>
    );
};

export default EventOverlay;