import React, {useEffect, useState} from "react"
import {useEventUser} from "../../../state/event/users";
import styled from "styled-components";
import {THEME} from "../../../ui/theme";
import {setUserRole} from "../../../firebase/event";
import {UserRoles} from "./EventUISettingsModal";

const StyledRoleContainer = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr;
  grid-column-gap: ${THEME.spacing.$1b}px;
  margin-top: ${THEME.spacing.$1b}px;
`

export const UserRolesModal: React.FC<{
    userId: string,
}> = ({userId}) => {

    const user = useEventUser(userId)
    const userRole = user?.userRole ?? ''
    const [localUserRole, setLocalUserRole] = useState(userRole)

    useEffect(() => {
        setLocalUserRole(localUserRole)
    }, [userRole])

    if (!user) {
        return null
    }

    return (
        <div>
            <header>
                <h3>{user.name}</h3>
            </header>
            <StyledRoleContainer>
                <div>
                    <label htmlFor="userRole">
                        User Role
                    </label>
                </div>
                <div>
                    <select id="userRole" value={localUserRole} onChange={event => {
                        const newRole = event.target.value
                        setLocalUserRole(newRole)
                        setUserRole(userId, newRole)
                    }}>
                        <option value="">
                            User
                        </option>
                        <option value={UserRoles.speaker}>
                            Speaker
                        </option>
                        <option value={UserRoles.admin}>
                            Admin
                        </option>
                    </select>
                </div>
            </StyledRoleContainer>
        </div>
    )
}
