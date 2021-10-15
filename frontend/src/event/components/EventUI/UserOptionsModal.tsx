import React, {useState} from "react"
import Modal from "../../../components/Modal"
import {StyledSmallRoundButton} from "../../../ui/buttons";
import {StyledList} from "./EventUISettingsModal";
import {setUserOffline} from "../../../firebase/event";
import {uiProxy} from "../../../state/ui";
import {Link} from "react-router-dom";
import {UserDetailsModal} from "./UserDetailsModal";

export const UserOptionsModal: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {

    const [showEditProfileModal, setShowEditProfileModal] = useState(false)

    const onChangeAnimal = () => {
        uiProxy.changingAnimal = true
        onClose()
    }

    const onMicSettings = () => {
        uiProxy.showMicSettings = true
        onClose()
    }

    const leaveEvent = () => {
        setUserOffline()
        window.location.href = '/'
    }

    return (
        <>
            <Modal isOpen onRequestClose={onClose} background thinner>
                <StyledList>
                    <li>
                        <StyledSmallRoundButton onClick={() => {
                            setShowEditProfileModal(true)
                        }} fullWidth>
                            edit profile
                        </StyledSmallRoundButton>
                    </li>
                    <li>
                        <StyledSmallRoundButton onClick={onChangeAnimal} fullWidth>
                            change animal
                        </StyledSmallRoundButton>
                    </li>
                    <li>
                        <StyledSmallRoundButton onClick={onMicSettings} fullWidth>
                            mic settings
                        </StyledSmallRoundButton>
                    </li>
                    <li>
                        <StyledSmallRoundButton onClick={leaveEvent} fullWidth>
                            leave event
                        </StyledSmallRoundButton>
                    </li>
                </StyledList>
            </Modal>
            {
                showEditProfileModal && (
                    <UserDetailsModal onClose={() => {
                        setShowEditProfileModal(false)
                    }}/>
                )
            }
        </>
    )
}
