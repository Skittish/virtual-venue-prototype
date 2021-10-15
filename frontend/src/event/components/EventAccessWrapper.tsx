import React, {useCallback, useEffect, useState} from "react"
import {joinEvent} from "../../firebase/events";
import {StyledContainer, StyledContentWrapper, StyledCenteredHeading} from "../views/JoinView";
import {StyledInput} from "../../ui/inputs";
import { StyledRoundedButton } from "../../ui/buttons";
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import {StyledMediumHeading} from "../../ui/typography/headings";
import {LoadingView} from "../../components/AuthRequiredWrapper";
import {useUser} from "../../state/auth";

enum JoinErrorCodes {
    password_required = 'password_required',
    incorrect_password = 'incorrect_password',
    not_invited = 'not_invited'
}

const getPasswordFormMessage = (errorCode: string) => {
    switch (errorCode) {
        case JoinErrorCodes.incorrect_password:
            return 'Incorrect password, try again.'
    }
    return ''
}

const loadStoredPassword = () => {
    return ''
}

const StyledInputWrapper = styled.div`
  margin: ${THEME.spacing.$2}px 0;
`

const StyledButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const StyledErrorMessage = styled.div`
  color: #5d0000;
  text-align: center;
  margin: ${THEME.spacing.$2}px 0;
`

const StyledContent = styled.div`
`

const InviteRequiredMessage: React.FC = () => {

    const user = useUser()

    const email = user?.email

    return (
        <LoadingView>
            <StyledContent>
                <StyledMediumHeading>
                    You must be invited to access this event.
                </StyledMediumHeading>
                {
                    email && (
                        <p>
                            Contact the event creator and request that they invite <strong>{email}</strong>
                        </p>
                    )
                }
            </StyledContent>
        </LoadingView>
    )
}

const PasswordRequiredForm: React.FC<{
    errorCode: string,
    password: string,
    onPasswordChange: (password: string) => void,
    onSubmit: () => void,
}> = ({password, onPasswordChange, errorCode, onSubmit}) => {

    const canSubmit = password.length > 0

    const errorMessage = getPasswordFormMessage(errorCode)

    return (
        <StyledContainer>
            <StyledContentWrapper>
                <form onSubmit={event => {
                    event.preventDefault()
                    if (canSubmit) {
                        onSubmit()
                    }
                }}>
                    <StyledCenteredHeading>
                        Event password required
                    </StyledCenteredHeading>
                    <StyledInputWrapper>
                        <StyledInput smaller smallerFont fullWidth placeholder="Password" value={password} onChange={event => onPasswordChange(event.target.value)} type="text"/>
                    </StyledInputWrapper>
                    {
                        errorMessage && (
                            <StyledErrorMessage>
                                {errorMessage}
                            </StyledErrorMessage>
                        )
                    }
                    <StyledButtonWrapper>
                        <StyledRoundedButton disabled={!canSubmit}>Join now</StyledRoundedButton>
                    </StyledButtonWrapper>
                </form>
            </StyledContentWrapper>
        </StyledContainer>
    )
}

export const EventAccessWrapper: React.FC<{
    eventId: string,
}> = ({children, eventId}) => {

    const [busy, setBusy] = useState(true)
    const [joined, setJoined] = useState(false)
    const [rejectionCode, setRejectionCode] = useState<JoinErrorCodes | string>('')
    const [accessDenied, setAccessDenied] = useState(false)
    const [password, setPassword] = useState(loadStoredPassword())

    const onJoinEvent = useCallback(() => {

        setBusy(true)

        joinEvent(eventId, password)
            .then(() => {
                setJoined(true)
            })
            .catch((error) => {
                console.error(error)
                const code = error?.code ?? ''
                setRejectionCode(code)
                setAccessDenied(true)
            })
            .finally(() => {
                setBusy(false)
            })

    }, [password, eventId])

    useEffect(() => {

        onJoinEvent()

    }, [])

    if (joined) return children as any

    if (busy) {
        return (
            <LoadingView>
                <StyledMediumHeading>
                    joining...
                </StyledMediumHeading>
            </LoadingView>
        )
    }

    switch (rejectionCode) {
        case JoinErrorCodes.password_required:
        case JoinErrorCodes.incorrect_password:
            return (
                <PasswordRequiredForm onSubmit={onJoinEvent} errorCode={rejectionCode} password={password} onPasswordChange={setPassword}/>
            )
        case JoinErrorCodes.not_invited:
            return <InviteRequiredMessage/>
    }

    return (
        <div>
            unable to join: {rejectionCode}
        </div>
    )
}
