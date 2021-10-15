import React, {useEffect, useState} from "react"
import {StyledRoundedButton} from "../../ui/buttons";
import {StyledFullScreenWrapper} from "../../ui/layout";
import styled from "styled-components";
import { StyledMediumHeading } from "../../ui/typography/headings";
import {checkIfEventExists, createNewEvent} from "../../firebase/events";
import { useHistory } from "react-router-dom";
import * as Sentry from "@sentry/react";
import {StyledInput} from "../../ui/inputs";
import {getCurrentUserId} from "../../state/auth";
import {getVirtualVenueAdminsRef} from "../../firebase/refs";
import {THEME} from "../../ui/theme";
import {HifiCapacity} from "../../firebase/types";
import {useFirestoreUser} from "../billing/hooks";
import {isFirestoreUserAdmin} from "../../firebase/firestore/user";

const StyledForm = styled.form`
  text-align: center;
`

const StyledInputWrapper = styled.div`
  margin: 15px 0;
`

const StyledWiderInput = styled(StyledInput)`
  max-width: 350px;
`

const StyledError = styled.div`
  background-color: #c70c40;
  font-size: 0.75rem;
  font-weight: 800;
  display: inline-block;
  padding: 5px 20px;
  margin-bottom: 15px;
`

const ERRORS: {
    [key: string]: {
        key: string,
        message: string
    }
} = {
    already_exists: {
        key: 'already_exists',
        message: 'That event code is unavailable, please pick another.'
    },
    insufficient_permissions: {
        key: 'insufficient_permissions',
        message: `You don't have permission to create an event.`
    },
    unknown: {
        key: 'unknown',
        message: `Something went wrong.`
    }
}

const IGNORED_ERRORS: string[] = [ERRORS.already_exists.key, ERRORS.insufficient_permissions.key]


export const useIsVirtualVenueAdmin = () => {
    const user = useFirestoreUser()
    return isFirestoreUserAdmin(user)
}

const StyledCheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  grid-column-gap: ${THEME.spacing.$1}px;
  justify-content: center;
`

const CreateEventForm: React.FC = () => {

    const isAdmin = useIsVirtualVenueAdmin()
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const [eventName, setEventName] = useState('')
    const [manualEventCode, setManualEventCode] = useState('')
    const [paymentPointer, setPaymentPointer] = useState('')
    const [isDevelopmentEvent, setIsDevelopmentEvent] = useState(false)
    const [hifiCapacity, setHifiCapacity] = useState(HifiCapacity.regular)
    const history = useHistory();

    const eventCode = manualEventCode || eventName.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    const canSubmit = !!eventName && !!eventCode

    const onSubmit = async () => {
        if (busy) return
        if (!canSubmit) return
        setError('')
        setBusy(true)

        try {
            await createNewEvent(eventCode, eventName, paymentPointer, hifiCapacity)
        } catch (error) {
            let sendError = true
            if (error && error.code) {
                setError(error.code)
                if (IGNORED_ERRORS.includes(error.code)) {
                    sendError = false
                }
            } else {
                setError('unknown')
            }
            if (sendError) {
                Sentry.captureMessage("Create new event unsuccessful.");
                Sentry.captureException(error);
            }
            setBusy(false)
            return
        }

        history.push(`/event/${eventCode}`)

    }

    return (
        <StyledFullScreenWrapper>
            <StyledForm noValidate onSubmit={event => {
                event.preventDefault()
                onSubmit()
            }}>
                {
                    !busy && (
                        <div>
                            <StyledMediumHeading>Create a new event</StyledMediumHeading>
                            <StyledInputWrapper>
                                <StyledWiderInput value={eventName} onChange={event => {
                                    setEventName(event.target.value)
                                }} type="text" placeholder="Event Name" autoComplete={"off"} />
                            </StyledInputWrapper>
                            <StyledInputWrapper>
                                <StyledWiderInput value={eventCode} onChange={event => {
                                    setManualEventCode(event.target.value)
                                }} type="text" placeholder="Event Slug" autoComplete={"off"} />
                            </StyledInputWrapper>
                            <StyledInputWrapper>
                                <StyledWiderInput value={paymentPointer} onChange={event => {
                                    setPaymentPointer(event.target.value)
                                }} type="text" placeholder="Payment Pointer (optional)" autoComplete={"off"} smallerFont />
                            </StyledInputWrapper>
                            {
                                isAdmin && (
                                    <>
                                        <StyledInputWrapper>
                                            <StyledCheckboxWrapper>
                                                <div>
                                                    <input checked={isDevelopmentEvent} onChange={event => {
                                                        setIsDevelopmentEvent(event.target.checked)
                                                    }} id="dev-event" type="checkbox"/>
                                                </div>
                                                <label htmlFor="dev-event">
                                                    Development event
                                                </label>
                                            </StyledCheckboxWrapper>
                                        </StyledInputWrapper>
                                        <StyledInputWrapper>
                                            <StyledCheckboxWrapper>
                                                <label htmlFor="event-capacity">
                                                    Hifi Capacity
                                                </label>
                                                <select id="event-capacity" value={hifiCapacity} onChange={event => {
                                                    setHifiCapacity(event.target.value as unknown as HifiCapacity)
                                                }}>
                                                    <option value={HifiCapacity.regular}>
                                                        Default (25)
                                                    </option>
                                                    <option value={HifiCapacity.medium}>
                                                        Medium (50)
                                                    </option>
                                                    <option value={HifiCapacity.large}>
                                                        Large (100)
                                                    </option>
                                                    <option value={HifiCapacity.extraLarge}>
                                                        Extra Large (150)
                                                    </option>
                                                </select>
                                            </StyledCheckboxWrapper>
                                        </StyledInputWrapper>
                                    </>
                                )
                            }
                        </div>
                    )
                }
                <footer>
                    <div>
                        {
                            !!error && (
                                <StyledError>
                                    {ERRORS[error]?.message ?? ''}
                                </StyledError>
                            )
                        }
                    </div>
                    <StyledRoundedButton disabled={!canSubmit || busy}>
                        {busy ? "Creating..." : "Create Event"}
                    </StyledRoundedButton>
                </footer>
            </StyledForm>
        </StyledFullScreenWrapper>
    )
}

export default CreateEventForm
