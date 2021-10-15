import React from "react"
import {StyledMediumHeading} from "../../../ui/typography/headings";
import {StyledSmallRoundButton} from "../../../ui/buttons";
import styled from "styled-components";
import {setEventUserSessionId} from "../../../firebase/event";
import {getEventId} from "../../../state/event/event";
import {userDataProxy} from "../../../state/user";

const StyledButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`

const EventUIDisconnectedModal: React.FC = () => {

    const resumeConnection = () => {
        setEventUserSessionId(getEventId(), userDataProxy.sessionId)
    }

    return (
        <div>
            <StyledMediumHeading>It appears you are logged in on another browser window / tab.</StyledMediumHeading>
            <StyledButtonWrapper>
                <StyledSmallRoundButton onClick={resumeConnection}>Resume connection here</StyledSmallRoundButton>
            </StyledButtonWrapper>
        </div>
    )
}

export default EventUIDisconnectedModal