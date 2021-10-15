import React, {useEffect, useState} from "react"
import {
    getEventAccessSettingsRef,
    getEventPasswordRef,
    getSecureEventDataGoogleSheetIdRef
} from "../../../../firebase/refs";
import {getEventId} from "../../../../state/event/event";
import {StyledInput} from "../../../../ui/inputs";
import {StyledSmallRoundButton} from "../../../../ui/buttons";
import {setEventPassword} from "../../../../firebase/events";
import {InvitedUsersForm} from "./InvitedUsersForm";
import {StyledCenteredHeading} from "../../../views/JoinView";
import { StyledHeading } from "../../../../ui/typography/headings";
import styled from "styled-components";
import {THEME} from "../../../../ui/theme";
import {StyledSelectWrapper} from "../../../../components/MicSelector";
import {FaAngleDown} from "react-icons/all";

export enum EventAccessType {
    PUBLIC = 'PUBLIC',
    PASSWORD = 'PASSWORD',
    INVITE = 'INVITE',
}

const loadEventPassword = (): Promise<string> => {
    const ref = getEventPasswordRef(getEventId())
    return ref.once('value').then(snapshot => snapshot.val())
}

const setEventAccessType = (accessType: EventAccessType) => {
    const ref = getEventAccessSettingsRef(getEventId())
    return ref.update({
        type: accessType,
    })
}

export type EventAccessSettings = {
    type: EventAccessType
}

const defaultAccessSettings = {
    type: EventAccessType.PUBLIC,
}

const loadEventAccessSettings = (): Promise<EventAccessSettings> => {
    const ref = getEventAccessSettingsRef(getEventId())
    return ref.once('value').then(snapshot => snapshot.val() ?? defaultAccessSettings)
}

const StyledInputWrapper = styled.div`
    margin: ${THEME.spacing.$1}px 0;
`

const StyledSectionWrapper = styled.div`
    margin: ${THEME.spacing.$2}px 0;
`

const StyledButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${THEME.spacing.$2}px;
`

const getModeDescription = (modeType: EventAccessType) => {
    switch (modeType) {
        case EventAccessType.PUBLIC:
            return 'The event is public. Anyone with the link can join.'
        case EventAccessType.INVITE:
            return 'Attendees must be invited to join.'
        case EventAccessType.PASSWORD:
            return 'Attendees must enter the event password to join.'
        default:
            return ''
    }
}

const StyledDescription = styled.div`
  margin-top: ${THEME.spacing.$1}px;
  padding: 0 ${THEME.spacing.$1}px;
  font-size: 0.8rem;
  text-align: center;
  opacity: 0.8;
`

export const EventUIEditAccessSettings: React.FC<{
    onClose: () => void
}> = ({onClose}) => {

    // todo - load event details...

    const [accessModeType, setAccessModeType] = useState(EventAccessType.PUBLIC)
    const [password, setPassword] = useState('')
    const [googleSheetId, setGoogleSheetId] = useState('')
    const [loadingSettings, setLoadingSettings] = useState(true)
    const [loadingPassword, setLoadingPassword] = useState(false)
    const [saving, setSaving] = useState(false)
    const [unsavedChanges, setUnsavedChanges] = useState(false)

    useEffect(() => {

        const ref = getSecureEventDataGoogleSheetIdRef(getEventId())

        ref.on('value', snapshot => {
            const value = snapshot.val() ?? ''
            setGoogleSheetId(value)
        })

    }, [])

    useEffect(() => {

        let unmounted = false

        loadEventAccessSettings().then(accessSettings => {
            if (unmounted) return
            setAccessModeType(accessSettings.type ?? EventAccessType.PUBLIC)
            setLoadingSettings(false)
        })

        setLoadingPassword(true)

        loadEventPassword().then(eventPassword => {
            if (unmounted) return
            setPassword(eventPassword ?? '')
            setLoadingPassword(false)
        })

        return () => {
            unmounted = true
        }

    }, [])

    const onSubmit = async () => {
        if (saving) return
        setSaving(true)

        if (accessModeType === EventAccessType.PASSWORD) {
            await setEventPassword(getEventId(), password)
            // todo - handle error
        } else if (accessModeType === EventAccessType.INVITE) {
            await getSecureEventDataGoogleSheetIdRef(getEventId()).set(googleSheetId)
        }

        setEventAccessType(accessModeType)
            .then(() => {
                setUnsavedChanges(false)
                setSaving(false)
            })

    }

    if (saving) {
        return (
            <div>
                saving...
            </div>
        )
    }

    if (loadingSettings || loadingPassword) {
        return (
            <div>
                loading...
            </div>
        )
    }

    return (
        <form onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
        }}>
            <div>
                <div>
                    <StyledCenteredHeading>
                        Event Privacy
                    </StyledCenteredHeading>
                </div>
                <StyledInputWrapper>
                    <StyledSelectWrapper>
                        <select value={accessModeType} onChange={event => {
                            setAccessModeType(event.target.value as EventAccessType)
                            setUnsavedChanges(true)
                        }}>
                            <option value={EventAccessType.PUBLIC}>Public</option>
                            <option value={EventAccessType.PASSWORD}>Password Protected</option>
                            <option value={EventAccessType.INVITE}>Private: Invite Only</option>
                        </select>
                        <span>
                            <FaAngleDown/>
                        </span>
                    </StyledSelectWrapper>
                    <StyledDescription>
                        {getModeDescription(accessModeType)}
                    </StyledDescription>
                </StyledInputWrapper>
            </div>
            {
                accessModeType === EventAccessType.PASSWORD && (
                    <StyledSectionWrapper>
                        <StyledHeading>
                            Password
                        </StyledHeading>
                        <StyledInputWrapper>
                            <StyledInput slim smaller fullWidth value={password} onChange={event => {
                                setPassword(event.target.value)
                                setUnsavedChanges(true)
                            }}/>
                        </StyledInputWrapper>
                    </StyledSectionWrapper>
                )
            }
            {
                accessModeType === EventAccessType.INVITE && (
                    <StyledSectionWrapper>
                        <InvitedUsersForm googleSheetId={googleSheetId} setGoogleSheetId={setGoogleSheetId}/>
                    </StyledSectionWrapper>
                )
            }
            <StyledButtonWrapper>
                <StyledSmallRoundButton medium type="submit">
                    save changes
                </StyledSmallRoundButton>
            </StyledButtonWrapper>
        </form>
    )
}
