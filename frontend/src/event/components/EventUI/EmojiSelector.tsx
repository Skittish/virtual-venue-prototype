import React, {useState} from "react"
import styled from "styled-components";
import {cssResetButton} from "../../../ui/buttons";
import {THEME} from "../../../ui/theme";
import {FaRegSmile} from "react-icons/all";
import Popup from "reactjs-popup";
import {sendUserChatReaction} from "../../../firebase/event/chat";
import {getCurrentUserId} from "../../../state/auth";

const defaultEmojis = [
    '👋',
    '👏',
    '❤',
    '👍',
    '👎',
]

const StyledContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  grid-column-gap: ${THEME.spacing.$1}px;
  justify-content: center;
`

const StyledEmojiButton = styled.button`
  ${cssResetButton};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  border-radius: 4px;
  
  &:hover,
  &:focus {
    background-color: rgba(0,0,0,0.15);
  }
  
`

export const EmojiSelector: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {
    return (
        <StyledContainer>
            {
                defaultEmojis.map(emoji => (
                    <StyledEmojiButton onClick={() => {
                        sendUserChatReaction(getCurrentUserId(), emoji)
                        onClose()
                    }} key={emoji}>
                        {emoji}
                    </StyledEmojiButton>
                ))
            }
        </StyledContainer>
    )
}


export const EmojiSelectorContainer: React.FC = () => {

    const [isOpen, setIsOpen] = useState(false)

    const closeEmojiSelector = () => {
        setIsOpen(false)
    }

    return (
        <Popup open={isOpen} onOpen={() => setIsOpen(true)} onClose={closeEmojiSelector} position="top center" trigger={
            <StyledEmojiButton>
                <FaRegSmile size={22}/>
            </StyledEmojiButton>}>
            <EmojiSelector onClose={closeEmojiSelector}/>
        </Popup>
    )
}
