import React, {useState} from "react"
import styled, {css} from "styled-components";
import {THEME} from "../../../ui/theme";
import {cssResetButton, StyledRoundedButton, StyledSmallRoundButton} from "../../../ui/buttons";
import {cssInputReset} from "../../../ui/inputs";
import {EventChatMessages} from "./EventChatMessages";
import {isStringAnEmoji, sendEventChatMessage, sendUserChatReaction} from "../../../firebase/event/chat";
import classNames from "classnames";
import {FaRegSmile, FaRegWindowMaximize, FaWindowMaximize} from "react-icons/all";
import {FaTimes} from "react-icons/fa";
import Popup from "reactjs-popup";
import {EmojiSelector, EmojiSelectorContainer} from "./EmojiSelector";
import {getCurrentUserId} from "../../../state/auth";

const cssIsOpen = css`
  top: 0;
  padding-top: ${THEME.spacing.$2}px;
  max-width: 328px;
  background-color: rgba(0,0,0,0.1);
`

const StyledContainer = styled.div<{
    isOpen: boolean,
}>`
  position: fixed;
  padding: ${THEME.spacing.$1b}px 0 ${THEME.spacing.$2}px 0;
  left: 0;
  bottom: 0;
  max-width: 320px;
  width: 100%;
  user-select: text;
  display: grid;
  grid-template-rows: auto 1fr auto;
  
  > form {
    margin-top: ${THEME.spacing.$1b}px;
  }
  
  ${props => props.isOpen ? cssIsOpen : ''};
  
`

const StyledInputWrapper = styled.div`
  position: relative;
`

const cssHidden = css`
  pointer-events: none;
  visibility: hidden;
`

const StyledButtonWrapper = styled.div<{
    hidden: boolean,
}>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  
  ${props => props.hidden ? cssHidden : ''};
  
`

const StyledButton = styled(StyledSmallRoundButton)`
    padding: 6px 10px;
    height: auto;
    margin-right: 2px;
`

const StyledInput = styled.input`
  ${cssInputReset};
  display: block;
  width: 100%;
  background-color: rgba(0,0,0,0.1);
  color: white;
  font-size: 0.9rem;
  border: 0;
  padding: ${THEME.spacing.$1b}px ${THEME.spacing.$1b}px;
  padding-right: 60px;

  ::placeholder,
  ::-webkit-input-placeholder {
    color: rgba(255,255,255,0.85);
  }
  :-ms-input-placeholder {
    color: rgba(255,255,255,0.85);
  }
  
  &:hover {
    background-color: rgba(0,0,0,0.25);
  }
  
  &:focus {
    background-color: rgba(0,0,0,0.35);
  }
  
`

const StyledBottomWrapper = styled.div`
  opacity: 0.6;
  transition: opacity 100ms ease;
  margin-top: 2px;
  padding: 0 ${THEME.spacing.$2}px;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-column-gap: ${THEME.spacing.$1}px;
  align-items: center;

  .parentContainer:hover &,
  .parentContainer--focused & {
    opacity: 1;
  }
  
`

const StyledChatButtonWrapper = styled.div`
  margin-bottom: ${THEME.spacing.$1}px;
  display: flex;
  justify-content: flex-end;
  padding: 0 ${THEME.spacing.$2}px;

  opacity: 0;
  transition: opacity 100ms ease;

  &:hover,
  &:focus,
  .parentContainer:hover &,
  .parentContainer--focused & {
    opacity: 1;
  }
  
`

const StyledChatButton = styled.button`
  ${cssResetButton};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    margin-left: 5px;
  }
  
`

const StyledEmojiButton = styled.button`
  ${cssResetButton};
  opacity: 0.5;
  
  &:hover,
  &:focus {
    opacity: 1;
  }
  
`

export const ChatUI: React.FC = () => {

    const [hovered, setHovered] = useState(false)
    const [focused, setFocused] = useState(false)
    const [message, setMessage] = useState('')
    const [lastMessageSent, setLastMessageSent] = useState(0)
    const [chatIsOpen, setChatIsOpen] = useState(false) // todo - set back to false

    const canSubmit = !!message

    const sendMessage = () => {
        if (!canSubmit) return
        const preppedMessage = message.trim().slice(0, 500)
        if (preppedMessage.length === 0) return
        sendEventChatMessage(preppedMessage)
        setMessage('')
        setLastMessageSent(Date.now())
        if (isStringAnEmoji(preppedMessage)) {
            sendUserChatReaction(getCurrentUserId(), preppedMessage)
        }
    }

    return (
        <StyledContainer className={classNames({
            ['parentContainer']: true,
            ['parentContainer--focused']: (focused || chatIsOpen),
        })} onMouseEnter={() => {
            setHovered(true)
        }} onMouseLeave={() => {
            setHovered(false)
        }} isOpen={chatIsOpen}>
            <StyledChatButtonWrapper>
                <StyledChatButton onClick={() => {
                    setChatIsOpen(!chatIsOpen)
                }}>
                    {
                        chatIsOpen ? (
                            <>
                                close chat <FaTimes size={12}/>
                            </>
                        ) : (
                            <>
                                open chat <FaRegWindowMaximize size={12}/>
                            </>
                        )
                    }
                </StyledChatButton>
            </StyledChatButtonWrapper>
            <EventChatMessages chatIsOpen={chatIsOpen} lastMessageSent={lastMessageSent} isFocused={hovered || focused}/>
            <StyledBottomWrapper>
                <form onSubmit={event => {
                    event.preventDefault()
                    sendMessage()
                }}>
                    <StyledInputWrapper>
                        <StyledInput onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} value={message} onChange={event => {
                            setMessage(event.target.value)
                        }} type="text" placeholder="Send a message" maxLength={500}/>
                        <StyledButtonWrapper hidden={!canSubmit}>
                            <StyledButton type="submit">
                                send
                            </StyledButton>
                        </StyledButtonWrapper>
                    </StyledInputWrapper>
                </form>
                <div>
                    <EmojiSelectorContainer/>
                </div>
            </StyledBottomWrapper>
        </StyledContainer>
    )
}
