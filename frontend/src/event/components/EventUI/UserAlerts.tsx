import React, {useEffect, useState} from "react"
import {setHasConnectionError, useHasConnectionError} from "../../../state/ui";
import styled from "styled-components";
import {THEME} from "../../../ui/theme";
import { StyledRoundButton } from "../../../ui/buttons";
import {FaTimes} from "react-icons/fa";

const StyledContainer = styled.div`
  position: fixed;
  right: ${THEME.spacing.$2}px;
  bottom: ${THEME.spacing.$2}px;
  padding: ${THEME.spacing.$1b}px;
  border-radius: 3px;
  background-color: ${THEME.colors.green};
  border: 1px solid rgba(0,0,0,0.5);
  max-width: 300px;
  font-size: 0.9rem;
`

const StyledCloseWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
`

export const UserAlerts: React.FC = () => {

    const [showConnectionMessage, setShowConnectionMessage] = useState(false)
    const hasConnectionError = useHasConnectionError()

    useEffect(() => {
        if (hasConnectionError) {
            const timeout = setTimeout(() => {
                setShowConnectionMessage(true)
            }, 2 * 1000)
            return () => {
                clearTimeout(timeout)
            }
        } else {
            setShowConnectionMessage(false)
        }
    }, [hasConnectionError])

    if (!showConnectionMessage) return null

    return (
        <StyledContainer>
            <div>
                <p>
                    Something went wrong when connecting to the audio channel.
                </p>
                <p>
                    You may want to try refreshing your browser.
                </p>
            </div>
            <StyledCloseWrapper>
                <StyledRoundButton small onClick={() => {
                    setHasConnectionError(false)
                }}>
                    <FaTimes size={12}/>
                </StyledRoundButton>
            </StyledCloseWrapper>
        </StyledContainer>
    )
}
