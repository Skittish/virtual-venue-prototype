import React from "react";
import { StyledSmallRoundButton } from "../ui/buttons";
import Modal from "./Modal";
import styled from "styled-components";

const StyledButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const StyledContent = styled.div`
  text-align: center;

    p {
      margin: 8px 0;
    }

`

export const IOSWarningModal: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {
    return (
        <Modal isOpen onRequestClose={onClose}>
            <StyledContent>
                <p>
                    Virtual Venue is best viewed on a desktop / laptop.
                </p>
                <p>
                    Using your current device might lead to performance issues.
                </p>
                <StyledButtonWrapper>
                    <StyledSmallRoundButton onClick={onClose}>
                        Continue anyway
                    </StyledSmallRoundButton>
                </StyledButtonWrapper>
            </StyledContent>
        </Modal>
    );
};