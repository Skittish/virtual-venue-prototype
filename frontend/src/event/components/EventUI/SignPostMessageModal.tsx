import React from "react"
import Modal from "../../../components/Modal";
import {setSignPostMessage, useSignPostMessage} from "../../../state/ui";
import {UserDetailsForm} from "../../../screens/SettingsScreen";
import {FaTimes} from "react-icons/fa";
import {StyledCloseButton} from "./UserDetailsModal";

export const SignPostMessageModal: React.FC = () => {

    const signPostMessage = useSignPostMessage()

    if (!signPostMessage) {
        return null
    }

    return (
        <Modal wider isOpen onRequestClose={() => {
            setSignPostMessage('')
        }}>
            <div>
                <p>
                    {signPostMessage.split('\n')
                        .map((item, idx) => {
                            return (
                                <React.Fragment key={idx}>
                                    {item}
                                    <br />
                                </React.Fragment>
                            )
                        })}
                </p>
            </div>
            <StyledCloseButton onClick={() => {
                setSignPostMessage('')
            }}>
                <FaTimes/>
            </StyledCloseButton>
        </Modal>
    )
}
