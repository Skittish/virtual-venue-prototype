import React, {useCallback} from "react"
import styled from "styled-components";
import {StyledHeading, StyledLargeHeading, StyledMediumHeading } from "../../ui/typography/headings";
import {cssResetButton, StyledRoundedButton, StyledSmallRoundButton} from "../../ui/buttons";
import {EventPreviews} from "./EventPreview";
import {Link} from "react-router-dom";
import {useUserData, useWatchUserData} from "../../state/user";
import {setSignedOut, useUser} from "../../state/auth";
import AuthWrapper from "../../event/components/AuthWrapper";
import AuthRequiredWrapper from "../../components/AuthRequiredWrapper";
import {auth} from "../../firebase/authentication";
import {THEME} from "../../ui/theme";
import {useDoesUserHaveCreateEventPermissions} from "../../firebase/firestore/user";

const StyledContainer = styled.div`
  padding: 80px;
`

export const StyledMaxWidthContent = styled.div`
  max-width: 1024px;
  margin: 0 auto;
`

const StyledMain = styled(StyledMaxWidthContent)`
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 128px;
`

const StyledRightSide = styled.div`
  background-color: ${THEME.colors.shade};
  padding: ${THEME.spacing.$6}px;
  width: 360px;
  border-radius: ${THEME.radii.$3}px;
  display: grid;
  row-gap: 32px;
`

const StyledUserInfo = styled.div`
  display: grid;
  justify-content: center;
  row-gap: 16px;
  text-align: center;
`

export const StyledAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 100%;
  background-color: rgba(0,0,0,0.1);
  justify-self: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    font-size: 12px;
    line-height: 1;
  }
  
`

const StyledOptions = styled.div`
  display: flex;
  align-items: center;
  
  > * {
    &:not(:first-child) {
      margin-left: ${THEME.spacing.$1b}px;
    }
  }
  
`

const StyledTextButton = styled.button`
  ${cssResetButton};
  margin-top: 6px;
  opacity: 0.66;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
  
`

const StyledHeader = styled.header`
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr;
  column-gap: 12px;
  margin-bottom: 16px;
`

const StyledLeftSide = styled.div`
    max-width: 400px;
  
    > * {
      margin-top: 32px;
      
      &:first-child {
        margin-top: 48px;
      }
      
    }
    
`

const LandingScreen: React.FC = () => {

    useWatchUserData()
    const user = useUser()
    const avatar = user?.photoURL ?? ''
    const userData = useUserData()

    const joinedEvents = userData?.joinedEvents ? Object.keys(userData.joinedEvents) : []
    const createdEvents = userData?.events ? Object.keys(userData.events) : []

    const signOut = useCallback(() => {
        auth.signOut()
            .then(() => {
                setSignedOut()
            })
    }, [])

    const canCreateEvents = useDoesUserHaveCreateEventPermissions()

    return (
        <StyledContainer>
            <StyledMain>
                <StyledLeftSide>
                    <header>
                        <StyledLargeHeading>Virtual Venue</StyledLargeHeading>
                    </header>
                    <div>
                        <StyledHeader>
                            <StyledMediumHeading>Joined Events</StyledMediumHeading>
                        </StyledHeader>
                        <EventPreviews events={joinedEvents.map(eventCode => ({
                            code: eventCode,
                            name: eventCode,
                        }))}/>
                    </div>
                </StyledLeftSide>
                <StyledRightSide>
                    <aside>
                        <StyledUserInfo>
                            <StyledAvatar>
                                {
                                    avatar && (
                                        <img src={avatar} alt="User avatar" />
                                    )
                                }
                            </StyledAvatar>
                            <div>
                                <StyledHeading>
                                    {user?.displayName ?? 'anonymous'}
                                </StyledHeading>
                                <StyledOptions>
                                    {
                                        canCreateEvents && (
                                            <StyledTextButton as={Link} to="/billing">
                                                Billing
                                            </StyledTextButton>
                                        )
                                    }
                                    <StyledTextButton as={Link} to="/settings">
                                        Settings
                                    </StyledTextButton>
                                    <StyledTextButton onClick={signOut}>
                                        Sign out
                                    </StyledTextButton>
                                </StyledOptions>
                            </div>
                        </StyledUserInfo>
                    </aside>
                    <aside>
                        <StyledHeader>
                            <StyledMediumHeading>Your Events</StyledMediumHeading>
                            {
                                canCreateEvents && (
                                    <StyledSmallRoundButton as={Link} to="/create">Create Event</StyledSmallRoundButton>
                                )
                            }
                        </StyledHeader>
                        <EventPreviews events={createdEvents.map(eventCode => ({
                            code: eventCode,
                            name: eventCode,
                        }))}/>
                    </aside>
                </StyledRightSide>
            </StyledMain>
        </StyledContainer>
    )
}

const Wrapper: React.FC = () => {
    return (
        <AuthWrapper>
            <AuthRequiredWrapper>
                <LandingScreen/>
            </AuthRequiredWrapper>
        </AuthWrapper>
    )
}

export default Wrapper
