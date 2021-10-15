import React, {useEffect, useState} from "react"
import styled from "styled-components";
import {FaArrowLeft, FaArrowRight} from "react-icons/all";
import { StyledRoundButton, StyledSmallRoundButton } from "../../../ui/buttons";
import {useCurrentUserId} from "../../../state/auth";
import {useUserAnimalKey} from "../../../state/event/users";
import {uiProxy} from "../../../state/ui";
import {RAW_ANIMALS} from "../../../3d/animals/animals";
import {useProxy} from "valtio";
import {useEventId} from "../EventDataWrapper";
import {updateUserAnimal} from "../../../firebase/database";
import { StyledMediumHeading } from "../../../ui/typography/headings";

const StyledContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`

const StyledContent = styled.div`
  width: 100%;
  max-width: 300px;
  position: relative;
`

const StyledArrowsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const StyledButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  margin-top: 50px;
`

const StyledHeader = styled.header`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 80px;
`

const EventUIAnimalSelector: React.FC<{
    onClose: () => void,
}> = ({onClose}) => {

    const userId = useCurrentUserId()
    const animal = useUserAnimalKey(userId)
    const temporaryAnimal = useProxy(uiProxy).temporaryAnimal

    useEffect(() => {
        uiProxy.temporaryAnimal = animal
    }, [])

    const nextAnimal = () => {
        const index = RAW_ANIMALS.indexOf(temporaryAnimal)
        let nextIndex = index + 1
        if (nextIndex > RAW_ANIMALS.length - 1) {
            nextIndex = 0
        }
        uiProxy.temporaryAnimal = RAW_ANIMALS[nextIndex]
    }

    const previousAnimal = () => {
        const index = RAW_ANIMALS.indexOf(temporaryAnimal)
        let nextIndex = index - 1
        if (nextIndex < 0) {
            nextIndex = RAW_ANIMALS.length - 1
        }
        uiProxy.temporaryAnimal = RAW_ANIMALS[nextIndex]
    }

    const eventId = useEventId()
    const [busy, setBusy] = useState(false)

    const saveChanges = () => {
        if (busy) return
        setBusy(true)
        updateUserAnimal(eventId, userId, temporaryAnimal)
            .then(() => {
                onClose()
            })
            .catch((error) => {
                console.error(error)
                setBusy(false)
            })
    }

    return (
        <StyledContainer>
            <StyledContent>
                <StyledHeader>
                    <StyledMediumHeading>select animal</StyledMediumHeading>
                </StyledHeader>
                <StyledArrowsWrapper>
                    <StyledRoundButton onClick={previousAnimal}>
                        <FaArrowLeft size={18}/>
                    </StyledRoundButton>
                    <StyledRoundButton onClick={nextAnimal}>
                        <FaArrowRight size={18}/>
                    </StyledRoundButton>
                </StyledArrowsWrapper>
                <StyledButtonWrapper>
                    <StyledSmallRoundButton onClick={saveChanges}>
                        save
                    </StyledSmallRoundButton>
                </StyledButtonWrapper>
            </StyledContent>
        </StyledContainer>
    )
}

export default EventUIAnimalSelector