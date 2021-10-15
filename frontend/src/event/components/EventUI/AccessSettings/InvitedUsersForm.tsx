import React, {useEffect, useState} from "react"
import {getEventApprovedAccessRef, getSecureEventDataGoogleSheetIdRef} from "../../../../firebase/refs";
import {getEventId} from "../../../../state/event/event";
import styled from "styled-components";
import {THEME} from "../../../../ui/theme";
import {StyledInput} from "../../../../ui/inputs";
import {StyledHeading, StyledSmallText } from "../../../../ui/typography/headings";
import {StyledSmallRoundButton, StyledTextButton } from "../../../../ui/buttons";

const addEmail = (email: string) => {
    const ref = getEventApprovedAccessRef(getEventId())
    return ref.push(email)
}

const removeEmail = (id: string) => {
    const ref = getEventApprovedAccessRef(getEventId())
    return ref.child(id).set(null)
}

const StyledAddContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-column-gap: ${THEME.spacing.$2}px;
  align-items: center;
`

const StyledContainer = styled.div`
  margin-top: ${THEME.spacing.$2}px;
  
  > h3 {
    margin-bottom: ${THEME.spacing.$1}px;
  }
  
`

const InviteForm: React.FC = () => {

    const [busy, setBusy] = useState(false)
    const [email, setEmail] = useState('')

    const handleAddEmail = () => {
        if (busy) return
        addEmail(email)
            .then(() => {
                setEmail('')
                setBusy(false)
            })
    }

    return (
        <StyledContainer>
            <h3>
                Add email address to approved list
            </h3>
            <StyledAddContainer>
                <div>
                    <StyledInput slimmer smallestFont value={email} onChange={event => {
                        setEmail(event.target.value)
                    }} type="email" placeholder="email address"/>
                </div>
                <div>
                    <StyledSmallRoundButton onClick={handleAddEmail} type="button">
                        add
                    </StyledSmallRoundButton>
                </div>
            </StyledAddContainer>
        </StyledContainer>
    )
}

const StyledEmailContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-column-gap: ${THEME.spacing.$2}px;
  align-items: center;
`

const StyledEmailName = styled.div`
  font-size: 0.8rem;
`

const ListOfEmails: React.FC<{
    emails: Record<string, string>
}> = ({emails}) => {
    return (
        <ul>
            {
                Object.entries(emails).map(([key, email]) => (
                    <li key={key}>
                        <StyledEmailContainer>
                            <StyledEmailName>
                                {email}
                            </StyledEmailName>
                            <div>
                                <StyledTextButton type="button" onClick={() => {
                                    removeEmail(key)
                                }}>remove</StyledTextButton>
                            </div>
                        </StyledEmailContainer>
                    </li>
                ))
            }
        </ul>
    )
}

const StyledPlainHeading = styled.h3`
  margin-bottom: ${THEME.spacing.$1}px;
`

const StyledSection = styled.div`
  margin: ${THEME.spacing.$2}px 0;
  padding: ${THEME.spacing.$1b}px;
  border: 2px solid rgba(0,0,0,0.15);
  
  > h3 {
    margin-bottom: ${THEME.spacing.$1}px;
  }
  
`

const StyledGoogleSheetInputWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: ${THEME.spacing.$1b}px;
  align-items: center;
`

export const InvitedUsersForm: React.FC<{
    googleSheetId: string,
    setGoogleSheetId: (id: string) => void,
}> = ({googleSheetId, setGoogleSheetId}) => {

    const [invitedUsers, setInvitedUsers] = useState<Record<string, string>>({})

    useEffect(() => {

        const ref = getEventApprovedAccessRef(getEventId())

        ref.on('value', snapshot => {
            const value = snapshot.val() ?? {}
            setInvitedUsers(value)
        })

    }, [])

    return (
        <div>
            <StyledSection>
                <StyledHeading>
                    Manual Invitations
                </StyledHeading>
                <div>
                    <StyledPlainHeading>
                        Approved emails
                    </StyledPlainHeading>
                    <ListOfEmails emails={invitedUsers}/>
                </div>
                <div>
                    <InviteForm/>
                </div>
            </StyledSection>
            <StyledSection>
                <StyledHeading>
                    Google Sheets Integration
                </StyledHeading>
                <ul>
                    <li>
                        <StyledSmallText>
                            In Google Sheets, share your spreadsheet with ACCOUNT-NAME@appspot.gserviceaccount.com
                            and paste the Google Sheets ID below.
                        </StyledSmallText>
                    </li>
                    <li>
                        <StyledGoogleSheetInputWrapper>
                            <StyledSmallText as="label" htmlFor="">
                                Google Sheets ID
                            </StyledSmallText>
                            <StyledInput slimmer smallestFont value={googleSheetId} onChange={event => setGoogleSheetId(event.target.value)} type="text"/>
                        </StyledGoogleSheetInputWrapper>
                    </li>
                </ul>
            </StyledSection>
        </div>
    )
}
