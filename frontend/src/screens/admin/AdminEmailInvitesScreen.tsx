import React, {useEffect, useMemo, useState} from "react"
import {FaPlus, FaTimes} from "react-icons/fa"
import {StyledRoundButton, StyledSmallRoundButton, StyledTextHoverButton} from "../../ui/buttons"
import {
    deleteInvitation,
    generateEmailInvitationCodes,
    sendAllPendingInvites,
    sendInvitation
} from "../../firebase/events";
import {getFirestoreEmailSignupInvitesRef} from "../../firebase/firestore/refs";
import {EmailSignupInvitesDocument, StoredEmailInviteData} from "../../firebase/firestore/types";
import styled from "styled-components";
import {THEME} from "../../ui/theme";

const StyledContainer = styled.div`
  max-width: 800px;
  margin: ${THEME.spacing.$5b}px auto 0 auto;
`

const StyledSection = styled.section`
  margin-top: ${THEME.spacing.$3}px;
`

const StyledHeader = styled.header`
  margin-bottom: ${THEME.spacing.$1b}px;

  h3 {
    font-size: 1.1rem;
    font-weight: 800;
  }

`

const StyledList = styled.ul`
  margin-top: ${THEME.spacing.$2}px;

  > li {
    &:not(:first-child) {
      margin-top: ${THEME.spacing.$2}px;
    }
  }

`

const PendingInvites: React.FC<{
    invites: StoredEmailInviteData[],
}> = ({invites}) => {
    return (
        <StyledSection>
            <StyledHeader>
                <h3>
                    Pending Invites
                </h3>
            </StyledHeader>
            <StyledList>
                {
                    invites.map((invite) => (
                        <li key={invite.code}>
                            <div>
                                <div>
                                    {invite.email}
                                </div>
                                <div>
                                    <button onClick={() => {
                                        deleteInvitation(invite.code)
                                    }}>
                                        Delete
                                    </button>
                                    <button onClick={() => {
                                        sendInvitation(invite.code)
                                    }}>
                                        Send now
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))
                }
            </StyledList>
            <div>
                <StyledSmallRoundButton onClick={() => {
                    sendAllPendingInvites()
                }}>
                    Send all pending invitations
                </StyledSmallRoundButton>
            </div>
        </StyledSection>
    )
}

const StyledSentInvite = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  grid-row-gap: ${THEME.spacing.$1}px;

  font-size: 0.8rem;

  h4 {
    font-weight: 800;
    font-size: 1rem;
  }

`

const StyledLink = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

`

const StyledOptions = styled.div`
  display: flex;
  
  > * {
    &:not(:first-child) {
      margin-left: ${THEME.spacing.$1b}px;
    }
  }
  
`

const SentInvites: React.FC<{
    invites: StoredEmailInviteData[],
}> = ({invites}) => {

    return (
        <StyledSection>
            <StyledHeader>
                <h3>
                    Sent Invites
                </h3>
            </StyledHeader>
            <StyledList>
                {
                    invites.map(invite => (
                        <li key={invite.code}>
                            <StyledSentInvite>
                                <h4>
                                    {invite.email}
                                </h4>
                                <div>
                                    {
                                        invite.redeemedBy ? (
                                            <StyledLink href={`/admin/users/${invite.redeemedBy}`} target={'_blank'}>
                                                Reedemed by {invite.redeemedBy}
                                            </StyledLink>
                                        ) : (
                                            <StyledOptions>
                                                <StyledLink href={`/signup?c=${invite.code}`} target={'_blank'}>
                                                    Sign-up url
                                                </StyledLink>
                                                {/*<StyledTextHoverButton thin>*/}
                                                {/*    Invalidate invite*/}
                                                {/*</StyledTextHoverButton>*/}
                                            </StyledOptions>
                                        )
                                    }
                                </div>
                            </StyledSentInvite>
                        </li>
                    ))
                }
            </StyledList>
        </StyledSection>
    )

}

const InvitesList: React.FC = () => {

    const [data, setData] = useState<Record<string, StoredEmailInviteData>>({})
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const ref = getFirestoreEmailSignupInvitesRef()
        ref.onSnapshot(snapshot => {
            const data = snapshot.data() as EmailSignupInvitesDocument ?? {}
            const {
                invites = {},
            } = data
            setData(invites)
            setLoaded(true)
        })
    }, [])

    const {
        pendingInvites,
        sentInvites,
    } = useMemo(() => {

        const pendingInvites: StoredEmailInviteData[] = []
        const sentInvites: StoredEmailInviteData[] = []

        Object.values(data).forEach((invite) => {
            if (invite.emailSent) {
                sentInvites.push(invite)
            } else {
                pendingInvites.push(invite)
            }
        })

        return {
            pendingInvites,
            sentInvites,
        }
    }, [data])

    return (
        <section>
            <PendingInvites invites={pendingInvites}/>
            <SentInvites invites={sentInvites}/>
        </section>
    )

}

const StyledEmailInputWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: ${THEME.spacing.$1}px;
  margin-bottom: ${THEME.spacing.$1b}px;
  
  textarea {
    min-width: 400px;
  }
  
`

const InviteForm: React.FC = () => {

    const [busy, setBusy] = useState(false)
    const [pendingEmails, setPendingEmails] = useState<string[]>([])
    const [emailInput, setEmailInput] = useState('')

    const addEmail = () => {


        setPendingEmails(state => {

            const emails: string[] = []
            const lines = emailInput.split('\n')
            lines.forEach(line => {
                line.split(',').forEach(email => {
                    if (!state.includes(email)) {
                        emails.push(email)
                    }
                })
            })

            return state.concat(...emails)
        })
        setEmailInput('')
    }

    const generateInvites = () => {
        if (busy) return
        setBusy(true)
        generateEmailInvitationCodes(pendingEmails)
            .then(() => {
                setPendingEmails([])
            })
            .finally(() => {
                setBusy(false)
            })
    }

    const removeEmail = (emailToRemove: string) => {
        setPendingEmails((state) => {
            return state.filter((email) => email !== emailToRemove)
        })
    }

    return (
        <StyledSection>
            <StyledHeader>
                <h3>
                    Generate Invites
                </h3>
            </StyledHeader>
            <ul>
                {
                    pendingEmails.map((email) => (
                        <li key={email}>
                            <span>
                                {email}
                            </span>
                            <StyledTextHoverButton onClick={() => {
                                removeEmail(email)
                            }}>
                                remove
                            </StyledTextHoverButton>
                        </li>
                    ))
                }
            </ul>
            <div>
                <form onSubmit={event => {
                    event.preventDefault()
                    addEmail()
                }}>
                    <StyledEmailInputWrapper>
                        <textarea  value={emailInput} onChange={event => {
                            setEmailInput(event.target.value)
                        }} placeholder="email@address.com"></textarea>
                        <StyledRoundButton small type="submit">
                            <FaPlus size={12}/>
                        </StyledRoundButton>
                    </StyledEmailInputWrapper>
                </form>
            </div>
            <div>
                <StyledSmallRoundButton onClick={generateInvites}>
                    Generate invite codes
                </StyledSmallRoundButton>
            </div>
        </StyledSection>
    )

}

export const AdminEmailInvitesScreen: React.FC = () => {
    return (
        <StyledContainer>
            <InviteForm/>
            <InvitesList/>
        </StyledContainer>
    )
}
