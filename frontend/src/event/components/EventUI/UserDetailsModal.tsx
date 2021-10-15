import React from "react"
import Modal from "../../../components/Modal"
import { UserDetailsForm } from "../../../screens/SettingsScreen"
import styled from "styled-components";
import {cssResetButton} from "../../../ui/buttons";
import {THEME} from "../../../ui/theme";
import {FaTimes} from "react-icons/fa";

const StyledContainer = styled.div`
  position: relative;
`

export const StyledCloseButton = styled.button`
  ${cssResetButton};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: ${THEME.colors.blue};
  position: absolute;
  top: -8px;
  right: -8px;
  border-radius: 50%;
  color: white;
`

export const UserDetailsModal: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {
    return (
        <Modal isOpen onRequestClose={onClose} wider>
            <UserDetailsForm/>
            <StyledCloseButton onClick={onClose}>
                <FaTimes/>
            </StyledCloseButton>
        </Modal>
    )
}
