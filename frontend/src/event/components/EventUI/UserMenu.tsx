import React, {useState} from "react"
import styled from "styled-components";
import {THEME} from "../../../ui/theme";
import {cssResetButton} from "../../../ui/buttons";
import {useCurrentUserId} from "../../../state/auth";
import {useUserBadgeInfo} from "../EventUser/UserBadge";
import { UserOptionsModal } from "./UserOptionsModal";
import {DEFAULT_AVATAR_IMAGE} from "../../../data/config";

const StyledContainer = styled.div`
`

const StyledUserIcon = styled.button<{
    image: string,
}>`
  ${cssResetButton};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${THEME.colors.shade};
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  display: block;
`

export const UserMenu: React.FC = () => {

    const [showUserOptions, setShowUserOptions] = useState(false)
    const userId = useCurrentUserId()

    const {
        avatar = DEFAULT_AVATAR_IMAGE,
    } = useUserBadgeInfo(userId)

    return (
        <>
            <StyledContainer>
                <StyledUserIcon image={avatar} onClick={() => {
                    setShowUserOptions(true)
                }}/>
            </StyledContainer>
            {
                showUserOptions && (
                    <UserOptionsModal onClose={() => {
                        setShowUserOptions(false)
                    }}/>
                )
            }
        </>
    )
}
