import React, {useEffect, useRef, useState} from "react";
import {get, set} from "local-storage";
import styled, {css} from "styled-components";
import {useEventId} from "../components/EventDataWrapper";
import {useCurrentUserId, useIsAuthenticated} from "../../state/auth";
import {setUserJoined} from "../../firebase/database";
import {setJoined, useEventHasLoaded} from "../../state/event/event";
import {StyledMediumHeading} from "../../ui/typography/headings";
import {useEnableMic} from "../components/EventUI/EventUI";
import {StyledRoundedButton} from "../../ui/buttons";
import {getCurrentUser} from "../../state/event/users";
import {getRandomArrayElement} from "../../utils/arrays";
import {ANIMALS} from "../../3d/animals/animals";
import {storeJoinedEventWithinUser} from "../../firebase/users";
import {THEME} from "../../ui/theme";
import MicSelector from "../../components/MicSelector";
import {StyledInput} from "../../ui/inputs";
import {isLocalMode} from "../../utils/env";
import {isAutoJoin} from "../../utils/params";
import {IOSWarningModal} from "../../components/IOSWarningModal";

export const StyledContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const styledModalBackground = css`
  background-color: ${THEME.colors.shadeLighter};
  border-radius: ${THEME.radii.$3}px;
  padding: ${THEME.spacing.$6}px;
  width: 100%;
  max-width: 420px;
`

export const StyledBox = styled.div`
  ${styledModalBackground};
`

export const StyledContentWrapper = styled(StyledBox)`
  position: relative;
`

const cssHidden = css`
    opacity: 0;
    pointer-events: none;
`

const StyledContent = styled.div<{
    showForm: boolean,
    hide: boolean
}>`
    ${props => props.hide ? cssHidden : ''};
`;

const StyledHeader = styled.header`
    position: relative;
    text-align: center;
`;

const StyledFormWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin-top: ${THEME.spacing.$5b}px;
`;

const StyledButtonWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin-top: ${THEME.spacing.$5}px;
`;

export const StyledCenteredHeading = styled(StyledMediumHeading)`
  text-align: center;

    span {
      font-weight: 600;
    }

`

const StyledInputWrapper = styled.div<{
    showLabel: boolean,
}>`
  position: relative;
  
  label {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    bottom: 100%;
    margin-bottom: 4px;
    visibility: ${props => props.showLabel ? 'visible' : 'hidden'};
    opacity: 0.66;
  }
  
`

const StyledMicInput = styled.div`
    margin-top: ${THEME.spacing.$5}px;
`

const nameKey = 'name'

export const getDefaultName = () => {
    const storedName = get<string>(nameKey)
    return storedName ?? ''
}

export const StyledOverlayMessage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`

const checkIfIOS = () => {
    return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

const JoinView: React.FC = () => {
    const eventHasLoaded = useEventHasLoaded()
    const eventId = useEventId()
    const userId = useCurrentUserId()
    const authenticated = useIsAuthenticated()
    const [name, setName] = useState(getDefaultName())
    const [busy, setBusy] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const [showIOSWarning, setShowIOSWarning] = useState(() => checkIfIOS())

    const canSubmit = !!name
    const showForm = authenticated && eventHasLoaded && !!userId && !busy

    const enableMic = useEnableMic()

    useEffect(() => {
        enableMic()
    }, [])

    useEffect(() => {
        if (showForm && inputRef.current) {
            inputRef.current.focus()
        }
    }, [showForm])

    const onChange = (event: any) => {
        const value = event.target.value as string
        setName(value.substr(0, 15))
    }

    const onSubmit = async () => {
        if (!canSubmit) return
        if (busy) return
        setBusy(true)
        set(nameKey, name)

        const user = getCurrentUser()
        let animal = getRandomArrayElement(Object.keys(ANIMALS))
        if (user && user.animal) {
            animal = user.animal
        }

        setUserJoined(eventId, userId, name, animal)
            .then(() => {
                setJoined()
                storeJoinedEventWithinUser(eventId)
            })
            .catch((error) => {
                console.error(error)
                setBusy(false)
            })
    }

    useEffect(() => {
        if (isLocalMode() && isAutoJoin()) {
            onSubmit()
        }
    }, [])

    return (
        <>
            <StyledContainer>
                <StyledContentWrapper>
                    <StyledContent showForm={showForm} hide={busy}>
                        <StyledHeader>
                            <StyledCenteredHeading plusSize as="label" htmlFor="name">
                                <span>Join </span>
                                 {eventId}
                            </StyledCenteredHeading>
                        </StyledHeader>
                        <StyledFormWrapper>
                            <form onSubmit={event => {
                                event.preventDefault()
                                onSubmit()
                            }}>
                                <StyledInputWrapper showLabel={!!name}>
                                    <StyledInput id="name" ref={inputRef} fullWidth type="text" placeholder="enter a name" value={name} onChange={onChange} maxLength={15} autoComplete="cc-csc"/>
                                    <label htmlFor="name">
                                        your name
                                    </label>
                                </StyledInputWrapper>
                                <StyledMicInput>
                                    <MicSelector/>
                                </StyledMicInput>
                                <StyledButtonWrapper>
                                    <StyledRoundedButton type="submit" disabled={!canSubmit}>
                                        Join now
                                    </StyledRoundedButton>
                                </StyledButtonWrapper>
                            </form>
                        </StyledFormWrapper>
                    </StyledContent>
                    {
                        busy && (
                            <StyledOverlayMessage>
                                <StyledMediumHeading plusSize>
                                    joining...
                                </StyledMediumHeading>
                            </StyledOverlayMessage>
                        )
                    }
                </StyledContentWrapper>
            </StyledContainer>
            {
                showIOSWarning && (
                    <IOSWarningModal onClose={() => {
                        setShowIOSWarning(false)
                    }}/>
                )
            }
        </>
    );
};

export default JoinView;
