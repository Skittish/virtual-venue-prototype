import React, {useEffect, useRef, useState} from "react"
import Linkify from 'react-linkify';
import styled, {css, keyframes} from "styled-components";
import {THEME} from "../../../ui/theme";
import {getEventChatRef, getEventChatSettingsRef} from "../../../firebase/refs";
import {getEventId} from "../../../state/event/event";
import {EventChatMessage, EventGlobalChat, EventGlobalChatSettings} from "../../../firebase/types";
import {StoredUsers, useEventUsers} from "../../../state/event/users";
import {FaCaretDown, FaDiceThree, FaEllipsisV} from "react-icons/all";
import {FaCog} from "react-icons/fa";
import {cssResetButton, StyledTextButton} from "../../../ui/buttons";
import Popup from "reactjs-popup";
import {useIsAdmin} from "./EventUISettingsModal";
import {setChatMessageRemoved, setChatUserBanned, setChatUserNotBanned} from "../../../firebase/event/chat";

const keyframesFadeOut = keyframes`
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
`

const cssFreshMessage = css`
  animation: ${keyframesFadeOut} 1000ms 8000ms ease forwards;
`

const cssNotFresh = css`
  opacity: 0;
`

const cssActive = css`
  outline: solid ${THEME.colors.red};
`

const StyledMessage = styled.div<{
    isFresh: boolean,
    isActive: boolean,
}>`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 6px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.25);
  font-size: 0.9rem;
  ${props => props.isFresh ? cssFreshMessage : cssNotFresh};
  ${props => props.isActive ? cssActive : ''};

  .parentContainer:hover &,
  .parentContainer--focused & {
    opacity: 1 !important;
    transition: opacity 100ms ease;
  }
  
  a {
    color: inherit;
    text-decoration: underline;
  }
  
`

const StyledTimestamp = styled.div`
  font-size: 0.8em;
  min-width: 48px;
  position: relative;
  top: 2px;
`

const cssRemoved = css`
  opacity: 0.65;
`

const StyledMessageText = styled.div<{
    removed: boolean,
}>`
  ${props => props.removed ? cssRemoved : ''};
`

const StyledRemovedText = styled.div`
  font-size: 0.8rem;
  opacity: 0.65;
`

const StyledName = styled.span`
  font-weight: 800;
  color: black;
  text-shadow: none;
`

const StyledMessageWrapper = styled.div`
  position: relative;
  padding-left: ${THEME.spacing.$1b}px;
  padding-right: 18px;
`

const StyledMessageOptionWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  visibility: hidden;
  
  .styledMessageWrapper:hover & {
    visibility: visible;
  }
  
`

const parseTimestamp = (timestamp: number) => {
    try {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
        // return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
        return ''
    }
}

export const linkComponentDecorator = (decoratedHref: string, decoratedText: string, key: any) => (
    <a target="blank" href={decoratedHref} key={key} rel="noreferrer noopener">
        {decoratedText}
    </a>
)

const StyledMessageOptionsButton = styled.button`
  ${cssResetButton};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  cursor: pointer;
  border-radius: 50%;
  
  &:hover,
  &:focus {
    background-color: ${THEME.colors.blue};
  }
  
`

const StyledMessageOption = styled(StyledTextButton)`
  text-align: left;
`

const MessageOptions: React.FC<{
    id: string,
    removed: boolean,
    bannedAuthor: boolean,
    authorId: string,
}> = ({id, bannedAuthor, removed, authorId}) => {

    return (
        <div>
            <div>
                {
                    removed ? (
                        <StyledMessageOption onClick={() => {
                            setChatMessageRemoved(id, false)
                        }}>
                            Restore message
                        </StyledMessageOption>
                    ) : (
                        <StyledMessageOption onClick={() => {
                            setChatMessageRemoved(id, true)
                        }}>
                            Remove message
                        </StyledMessageOption>
                    )
                }
            </div>
            <div>
                {
                    bannedAuthor ? (
                        <StyledMessageOption onClick={() => {
                            setChatUserNotBanned(authorId)
                        }}>
                            Un-ban user from chat (restores all of their messages)
                        </StyledMessageOption>
                    ) : (
                        <StyledMessageOption onClick={() => {
                            setChatUserBanned(authorId)
                        }}>
                            Ban user from chat (removes all of their messages)
                        </StyledMessageOption>
                    )
                }
            </div>
        </div>
    )
}

const ChatMessage: React.FC<{
    isBannedAuthor: boolean,
    isAdmin: boolean,
    id: string,
    message: string,
    author: string,
    authorName: string,
    timestamp: number,
    removed: boolean,
}> = ({isBannedAuthor, isAdmin, removed, id, message, author, authorName, timestamp}) => {

    const [isFresh] = useState(() => {
        return (Date.now() - timestamp) < 10 * 1000
    })

    const [isActive, setIsActive] = useState(false)

    if ((removed || isBannedAuthor) && !isAdmin) return null

    return (
        <StyledMessageWrapper className="styledMessageWrapper">
            <StyledMessage isFresh={isFresh} isActive={isActive}>
                <StyledTimestamp>
                    {parseTimestamp(timestamp)}
                </StyledTimestamp>
                <div>
                    <StyledMessageText removed={removed}>
                        <StyledName>{authorName}:</StyledName> <Linkify componentDecorator={linkComponentDecorator}>{message}</Linkify>
                    </StyledMessageText>
                    {
                        removed && (
                            <StyledRemovedText>This comment has been removed and is only visible to admins.</StyledRemovedText>
                        )
                    }
                    {
                        isBannedAuthor && (
                            <StyledRemovedText>This user has been banned from chat.</StyledRemovedText>
                        )
                    }
                </div>
            </StyledMessage>
            {
                isAdmin && (
                    <StyledMessageOptionWrapper>
                        <Popup className="chatOptions" trigger={
                            <StyledMessageOptionsButton>
                                <FaEllipsisV size={12}/>
                            </StyledMessageOptionsButton>
                        } onOpen={() => setIsActive(true)} onClose={() => setIsActive(false)}>
                            <MessageOptions id={id} removed={removed} bannedAuthor={isBannedAuthor} authorId={author}/>
                        </Popup>
                    </StyledMessageOptionWrapper>
                )
            }
        </StyledMessageWrapper>
    )
}

const StyledList = styled.ul`

    > li {
      
      &:not(:first-child) {
        margin-top: ${THEME.spacing.$1b}px;
      }
      
    }

`

const useEventChatMessages = () => {

    const isAdmin = useIsAdmin()
    const [messages, setMessages] = useState<[string, EventChatMessage][]>([])
    const [chatSettings, setChatSettings] = useState<EventGlobalChatSettings | null>(null)
    const [loadedBannedUsers, setLoadedBannedUsers] = useState(false)

    const bannedUsers = Object.keys(chatSettings?.bannedUsers ?? {})

    useEffect(() => {

        const ref = getEventChatSettingsRef(getEventId())

        ref.on('value', snapshot => {
            const data = snapshot.val() as EventGlobalChatSettings
            if (data) {
                setChatSettings(data)
            } else {
                setChatSettings(null)
            }
            setLoadedBannedUsers(true)
        })

        return () => {
            ref.off('value')
        }

    }, [])

    useEffect(() => {

        const ref = getEventChatRef(getEventId())

        ref.on('value', snapshot => {
            const data = snapshot.val() as EventGlobalChat
            if (!data) return
            setMessages(Object.entries(data).sort(([,chatA], [,chatB]) => {
                return chatA.timestamp - chatB.timestamp
            }))
        })

        return () => {
            ref.off('value')
        }

    }, [])

    if (!isAdmin && !loadedBannedUsers) {
        // don't return messages until we've loaded chat settings
        return {
            messages: [],
            bannedUsers,
        }
    }

    return {
        messages,
        bannedUsers,
    }

}

const getUserName = (users: StoredUsers, userId: string) => {
    if (users[userId]) {
        if (users[userId].name) {
            return users[userId].name ?? 'User'
        }
    }
    return 'User'
}

const cssCondensed = css`
  max-height: 120px;
  overflow: hidden;
`

const cssExpanded = css`
  overflow-y: auto;
`

const StyledListContainer = styled.div<{
    condensed: boolean,
}>`
  padding: 0 ${THEME.spacing.$1b}px;
  ${props => props.condensed ? cssCondensed : cssExpanded};
`

export const EventChatMessages: React.FC<{
    chatIsOpen: boolean,
    lastMessageSent: number,
    isFocused: boolean,
}> = ({chatIsOpen, isFocused, lastMessageSent}) => {

    const bottomOfListRef = useRef<HTMLDivElement>(null)
    const {messages, bannedUsers} = useEventChatMessages()
    const users = useEventUsers()
    const isFocusedRef = useRef(isFocused)

    useEffect(() => {
        isFocusedRef.current = isFocused
    }, [isFocused])

    useEffect(() => {
        if (messages.length) {
            bottomOfListRef.current?.scrollIntoView()
        }
    }, [messages])

    useEffect(() => {
        bottomOfListRef.current?.scrollIntoView()
    }, [lastMessageSent, chatIsOpen])

    const isAdmin = useIsAdmin()

    return (
        <StyledListContainer condensed={!chatIsOpen}>
            <StyledList>
                {
                    messages.slice(Math.max(messages.length - 200, 0)).map(([id, message]) => (
                        <li key={id}>
                            <ChatMessage isBannedAuthor={bannedUsers.includes(message.author)} isAdmin={isAdmin} id={id} removed={message.removed ?? false} message={message.message} timestamp={message.timestamp} authorName={getUserName(users, message.author)} author={message.author}/>
                        </li>
                    ))
                }
            </StyledList>
            <div ref={bottomOfListRef}></div>
        </StyledListContainer>
    )
}
