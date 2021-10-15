import React, {useEffect, useState} from "react"
import styled from "styled-components";
import ReactPlayer from "react-player";
import {getEventSessionDataRef, getEventSessionVideoDataRef, getVideoDataRef} from "../../../firebase/refs";
import {useEventId} from "../EventDataWrapper";
import {useCurrentUserId} from "../../../state/auth";
import { StyledMediumHeading } from "../../../ui/typography/headings";
import { StyledRoundedButton, StyledSmallRoundButton } from "../../../ui/buttons";
import {COLORS} from "../../../ui/colors";
import {StyledInput} from "../../../ui/inputs";
import {THEME} from "../../../ui/theme";

export const StyledContainer = styled.div`
  text-align: center;
`

export const StyledInputWrapper = styled.div`
  margin: ${THEME.spacing.$2}px 0;
`

const EventUIVideoModal: React.FC<{
    videoId: string,
    onClose: () => void,
}> = ({videoId, onClose}) => {

    const eventId = useEventId()
    const userId = useCurrentUserId()
    const [url, setUrl] = useState("")
    const [isValid, setIsValid] = useState(false)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        setIsValid(ReactPlayer.canPlay(url))
    }, [url])

    const onSubmit = () => {
        if (!isValid) return
        if (busy) return
        setBusy(true)

        const ref = getVideoDataRef(videoId)

        ref.update({
            url: url,
            director: userId,
            playing: false,
            currentTime: null,
        }).then(() => {
            onClose()
        }).catch((error) => {
            console.error(error)
        })

    }

    return (
        <StyledContainer>
            <form onSubmit={(event) => {
                event.preventDefault()
                onSubmit()
            }}>
                <StyledMediumHeading as="label" htmlFor="video-url">enter a video url (youtube/twitch/vimeo/etc)</StyledMediumHeading>
                <StyledInputWrapper>
                    <StyledInput smaller id="video-url" type="url" placeholder="https://youtube.com/..."
                           value={url}
                           onChange={(event) => setUrl(event.target.value)}/>
                </StyledInputWrapper>
                <StyledSmallRoundButton medium type="submit" disabled={!isValid}>display</StyledSmallRoundButton>
            </form>
        </StyledContainer>
    )
}

export default EventUIVideoModal
