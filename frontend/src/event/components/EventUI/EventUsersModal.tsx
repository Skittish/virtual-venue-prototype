import React, {useState} from "react"
import { StyledMediumHeading } from "../../../ui/typography/headings"
import {StoredUserData, useEventUsers} from "../../../state/event/users";
import styled, {css} from "styled-components";
import {THEME} from "../../../ui/theme";
import { StyledSmallRoundButton } from "../../../ui/buttons";
import {setUserBanned, setUserMuted} from "../../../firebase/event";
import {useCurrentUserId} from "../../../state/auth";
import Modal from "../../../components/Modal";
import {UserRolesModal} from "./UserRolesModal";
import {UserVolumeIndicator} from "../EventUser/EventUserUI";

const StyledList = styled.ul`

  max-height: 400px;
  overflow-y: auto;
  
  > li {
    
    margin-top: ${THEME.spacing.$2}px;
    
  }
    
`

const StyledUser = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto ;
  column-gap: ${THEME.spacing.$1b}px;
  align-items: center;
`

const cssOnline = css`
  font-weight: bold;
  opacity: 1;
`

const StyledUserName = styled.div<{
    online: boolean,
}>`
  opacity: 0.33;
    ${props => props.online ? cssOnline : ''};
`

const StyledOptions = styled.div`
    display: grid;
    grid-template-columns: auto auto auto;
    column-gap: ${THEME.spacing.$1}px;
    align-items: center;
`

const sortUsers = (userA: StoredUserData, userB: StoredUserData) => {
    if (userA.online) {
        if (!userB.online) return -1
    }
    if (userB.online) {
        if (!userA.online) return 1
    }
    if((userA.name || '') < (userB.name || '')) { return -1; }
    if((userA.name || '') > (userB.name || '')) { return 1; }
    return 0
}

export const EventUsersModal: React.FC<{
    onClose: () => void,
}> = () => {

    const users = useEventUsers()
    const currentUser = useCurrentUserId()
    const [editUserRoles, setEditUserRoles] = useState('')

    return (
        <>
            <div>
                <header>
                    <StyledMediumHeading>
                        Event Users
                    </StyledMediumHeading>
                </header>
                <StyledList>
                    {
                        Object.entries(users).sort(([,userA], [,userB]) => sortUsers(userA, userB)).map(([userId, user]) => {
                            const muted = user.forceMuted ?? false
                            const banned = user.banned ?? false
                            const joined = user.joined ?? false
                            if (!joined) return null
                            return (
                                <li key={userId}>
                                    <StyledUser>
                                        <StyledUserName online={!!user.online}>
                                            {user.name}
                                        </StyledUserName>
                                        <StyledOptions>
                                            <StyledSmallRoundButton alert={muted} onClick={() => {
                                                setUserMuted(userId, !muted)
                                            }}>
                                                {
                                                    muted ? "Unmute" : "Mute"
                                                }
                                            </StyledSmallRoundButton>
                                            {
                                                (currentUser !== userId) && (
                                                    <StyledSmallRoundButton alert={banned} onClick={() => {
                                                        setUserBanned(userId, !banned)
                                                    }}>
                                                        {
                                                            banned ? "Unban" : "Ban"
                                                        }
                                                    </StyledSmallRoundButton>
                                                )
                                            }
                                            {
                                                (currentUser !== userId) && (
                                                    <StyledSmallRoundButton onClick={() => {
                                                        setEditUserRoles(userId)
                                                    }}>
                                                        Roles
                                                    </StyledSmallRoundButton>
                                                )
                                            }
                                        </StyledOptions>
                                        <div>
                                            <UserVolumeIndicator userId={userId} active/>
                                        </div>
                                    </StyledUser>
                                </li>
                            )
                        })
                    }
                </StyledList>
            </div>
            {
                editUserRoles && (
                    <Modal isOpen onRequestClose={() => {
                        setEditUserRoles('')
                    }}>
                        <UserRolesModal userId={editUserRoles}/>
                    </Modal>
                )
            }
        </>
    )
}
