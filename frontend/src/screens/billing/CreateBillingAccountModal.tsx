import React, {useState} from "react"
import Modal from "../../components/Modal"
import { StyledSmallRoundButton } from "../../ui/buttons"
import { StyledHeading } from "../../ui/typography/headings"
import {StyledInput} from "../../ui/inputs";
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import {createNewBillingAccount} from "../../firebase/events";
import {useHistory} from "react-router-dom";

const StyledInputWrapper = styled.div`
    margin: ${THEME.spacing.$1b}px 0;
`

export const CreateBillingAccountModal: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {

    const history = useHistory();

    const [name, setName] = useState('')
    const [busy, setBusy] = useState(false)

    const createAccount = () => {
        if (busy) return
        setBusy(true)

        createNewBillingAccount(name)
            .then(({billingAccountId}) => {
                history.push(`/billing/account/${billingAccountId}`)
            })
            .catch((error) => {
                console.error(error)
                setBusy(false)
            })

    }

    return (
        <Modal isOpen onRequestClose={onClose}>
            <form onSubmit={event => {
                event.preventDefault()
                createAccount()
            }}>
                <div>
                    <header>
                        <StyledHeading>Create Billing Account</StyledHeading>
                    </header>
                </div>
                <StyledInputWrapper>
                    <StyledInput slim slimmer smallerFont fullWidth value={name} onChange={event => setName(event.target.value)} type="text" placeholder="Optional: Enter account name"/>
                </StyledInputWrapper>
                <div>
                    <StyledSmallRoundButton fullWidth type="submit">
                        {
                            busy ? "Creating..." : "Create"
                        }
                    </StyledSmallRoundButton>
                </div>
            </form>
        </Modal>
    )
}
