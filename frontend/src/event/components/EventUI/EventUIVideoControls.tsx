import React from "react"
import {FaPause, FaPlay} from "react-icons/fa";
import styled from "styled-components";
import {StyledPlayWrapper, StyledRoundButton, StyledSmallRoundButton } from "../../../ui/buttons";

const StyledContainer = styled.div`
  position: absolute;
  left: 20px;
  bottom: 20px;
`

const StyledContent = styled.ul`
  display: flex;
  
  li {
    
    &:not(:first-child) {
      margin-left: 5px;
    }
    
  }
  
`

const EventUIVideoControls: React.FC<{
    hasVideo: boolean,
    onChange: () => void,
    canPlay: boolean,
    playing: boolean,
    onToggle: () => void,
    canResync: boolean,
    onResync: () => void,
}> = ({
    hasVideo,
    onChange,
    canPlay,
    playing,
    onToggle,
    canResync,
    onResync
}) => {
    return (
        <StyledContainer>
            <StyledContent>
                {
                    canPlay && (
                        <li>
                            <StyledRoundButton onClick={onToggle}>
                                {
                                    playing ? <FaPause size={14}/> : (
                                        <StyledPlayWrapper>
                                            <FaPlay size={14}/>
                                        </StyledPlayWrapper>
                                    )
                                }
                            </StyledRoundButton>
                        </li>
                    )
                }
                <li>
                    <StyledSmallRoundButton onClick={onChange}>
                        {
                            !hasVideo ? "share youtube/twitch/facebook video" : "change video"
                        }
                    </StyledSmallRoundButton>
                </li>
                {
                    canResync && (
                        <li>
                            <StyledSmallRoundButton onClick={onResync}>
                                resync video
                            </StyledSmallRoundButton>
                        </li>
                    )
                }
            </StyledContent>
        </StyledContainer>
    )
}

export default EventUIVideoControls