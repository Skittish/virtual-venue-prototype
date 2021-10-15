import React, {useEffect, useState} from "react"
import MicSelector from "../../../components/MicSelector";
import {useEnableMic} from "./EventUI";
import {useProxy} from "valtio";
import {audioState} from "../../../state/audio";
import {StyledSmallRoundButton} from "../../../ui/buttons";
import styled from "styled-components";
import {THEME} from "../../../ui/theme";

export const StyledButtonWrapper = styled.div`
  text-align: center;
  margin-top: ${THEME.spacing.$2}px;
`

const EventUIMicSettingsModal: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {

    const enableMic = useEnableMic()
    const {
        micGranted,
        micRejected
    } = useProxy(audioState)
    const [promptOnMount] = useState(!micRejected && !micGranted)

    useEffect(() => {
        if (promptOnMount) {
            enableMic()
        }
    }, [])

    return (
        <div>
            <MicSelector/>
            <StyledButtonWrapper>
                <StyledSmallRoundButton medium onClick={onClose}>done</StyledSmallRoundButton>
            </StyledButtonWrapper>
        </div>
    )
}

export default EventUIMicSettingsModal