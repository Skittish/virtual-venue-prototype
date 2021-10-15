import React from "react";
import {useEventId} from "../components/EventDataWrapper";
import {StyledContainer} from "./JoinView";
import {StyledLargeHeading} from "../../ui/typography/headings";

const LoadingView: React.FC = () => {
    const eventId = useEventId()
    return (
        <StyledContainer>
            <StyledLargeHeading>loading {eventId}</StyledLargeHeading>
        </StyledContainer>
    );
};

export default LoadingView;