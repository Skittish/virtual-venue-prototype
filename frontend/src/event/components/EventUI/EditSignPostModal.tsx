import React, {useEffect, useState} from "react"
import { StyledContainer } from "./EventUIVideoModal"
import {StyledMediumHeading} from "../../../ui/typography/headings";
import styled from "styled-components";
import { StyledRoundedButton, StyledSmallRoundButton } from "../../../ui/buttons";
import {StyledInput} from "../../../ui/inputs";
import {StyledTextarea, updateAssetValues} from "./AssetManager/SelectedAssetInstance";
import {useSceneryInstance} from "../../../state/event/rooms";
import {setEditingSignPost} from "../../../state/ui";

const StyledBody = styled.div`
  text-align: left;
  display: grid;
  grid-auto-flow: row;
  grid-row-gap: 12px;
  margin-top: 16px;
  
  input,
  textarea {
    width: 100%;
    display: block;
    max-width: none;
    margin-top: 4px;
  }
  
`

export const EditSignPostModal: React.FC<{
    id: string,
}> = ({id}) => {

    const asset = useSceneryInstance(id)

    const {
        label = '',
        message = ''
    } = asset ?? {}

    const [labelInput, setLabelInput] = useState(label)
    const [messageInput, setMessageInput] = useState(message)

    useEffect(() => {
        setLabelInput(label)
    }, [label])

    useEffect(() => {
        setMessageInput(message)
    }, [message])

    const [busy, setBusy] = useState(false)

    const updateChanges = () => {
        if (busy) return
        setBusy(true)
        updateAssetValues(id, {
            label: labelInput,
            message: messageInput,
        })
            .then(() => {
                setEditingSignPost('')
            })
            .catch(() => {
                setBusy(false)
            })
    }

    return (
        <StyledContainer>
            <header>
                <StyledMediumHeading>edit sign post</StyledMediumHeading>
            </header>
            <form onSubmit={event => {
                event.preventDefault();
                updateChanges()
            }}>
                <StyledBody>
                        <div>
                            <label htmlFor="edit-signpost-label">Sign Post Label</label>
                            <StyledInput value={labelInput} onChange={event => {
                                setLabelInput(event.target.value)
                            }} id="edit-signpost-label" type="text" slimmer smallestFont maxLength={50}/>
                        </div>
                        <div>
                            <label htmlFor="edit-signpost-message">Message</label>
                            <StyledTextarea value={messageInput} onChange={(event: any) => {
                                setMessageInput(event.target.value)
                            }} id="edit-signpost-message" slimmer smallestFont/>
                        </div>
                    <div>
                        <StyledSmallRoundButton fullWidth type='submit'>
                            {
                                busy ? "Saving..." : "Save changes"
                            }
                        </StyledSmallRoundButton>
                    </div>
                </StyledBody>
            </form>
        </StyledContainer>
    )
}
