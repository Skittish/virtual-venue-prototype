import React, {useCallback, useEffect, useMemo, useState} from "react"
import {SceneryInstance, useCurrentRoomScenery} from "../../../../state/event/rooms";
import {SPECIAL_ASSETS} from "../../../../3d/scenery/config";
import { StyledInput } from "../../../../ui/inputs";
import {DEFAULT_CHANNEL_ZONE_HEIGHT, DEFAULT_CHANNEL_ZONE_WIDTH} from "../../customElements/ChannelZone";
import {getEventSceneryInstanceRef} from "../../../../firebase/refs";
import styled from "styled-components";
import {THEME} from "../../../../ui/theme";
import { StyledSmallRoundButton } from "../../../../ui/buttons";

export const useAssetInstance = (id: string): SceneryInstance | null => {

    const scenery = useCurrentRoomScenery()

    return scenery[id]
}

export const updateAssetValues = (id: string, update: Record<string, any>) => {
    const ref = getEventSceneryInstanceRef(id)
    return ref.update(update)
}

const StyledInputWrapper = styled.div`

    margin-top: ${THEME.spacing.$1b}px;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: ${THEME.spacing.$1b}px;
  align-items: center;
  
  label {
    display: block;
    min-width: 80px;
  }

`

const StyledInputRowWrapper = styled.div`

  margin-top: ${THEME.spacing.$1b}px;
  display: grid;
  grid-auto-flow: row;
  grid-row-gap: ${THEME.spacing.$1}px;
  
  label {
    display: block;
    min-width: 80px;
  }

`

const StyledButtonWrapper = styled.div`
  margin-top: ${THEME.spacing.$1b}px;
`

export const StyledTextarea = styled(StyledInput).attrs({
    as: 'textarea'
})`
  resize: vertical;
  min-height: 60px;
  max-height: 200px;
  overflow-y: auto;
`

const SignPostFields: React.FC<{
    id: string,
    asset: SceneryInstance,
}> = ({asset, id}) => {
    const {
        label = '',
        message = '',
    } = asset

    const [labelInput, setLabelInput] = useState(label)
    const [messageInput, setMessageInput] = useState(message)
    const [busy, setBusy] = useState(false)

    const saveChanges = useCallback(() => {
        if (busy) return
        setBusy(true)
        updateAssetValues(id, {
            label: labelInput,
            message: messageInput,
        })
            .finally(() => {
                setBusy(false)
            })
    }, [busy, labelInput, messageInput])

    return (
        <form onSubmit={event => {
            event.preventDefault()
            saveChanges()
        }}>
            <StyledInputRowWrapper>
                <label htmlFor="signpost-label">
                    Sign Post Label
                </label>
                <div>
                    <StyledInput id="signpost-label" value={labelInput} onChange={event => {
                        setLabelInput(event.target.value)
                    }} slimmer smallestFont type="text" maxLength={50}/>
                </div>
            </StyledInputRowWrapper>
            <StyledInputRowWrapper>
                <label htmlFor="signpost-message">
                    Message
                </label>
                <div>
                    <StyledTextarea id="signpost-message" value={messageInput} onChange={(event: any) => {
                        setMessageInput(event.target.value)
                    }} slimmer smallestFont/>
                </div>
            </StyledInputRowWrapper>
            <StyledButtonWrapper>
                <StyledSmallRoundButton fullWidth type='submit'>
                    {
                        busy ? "Saving..." : "Save changes"
                    }
                </StyledSmallRoundButton>
            </StyledButtonWrapper>
        </form>
    )

}

const ChannelZoneFields: React.FC<{
    id: string,
    asset: SceneryInstance,
}> = ({asset, id}) => {
    const {
        width = DEFAULT_CHANNEL_ZONE_WIDTH,
        height = DEFAULT_CHANNEL_ZONE_HEIGHT,
        attenuation = '',
    } = asset


    const [widthInput, setWidthInput] = useState(width)
    const [heightInput, setHeightInput] = useState(height)
    const [attenuationInput, setAttenuationInput] = useState(attenuation)

    const onAttenuationChange = (newAttenuation: string) => {
        setAttenuationInput(newAttenuation)
        const value = newAttenuation ? parseFloat(newAttenuation) : ''
        updateAssetValues(id, {
            attenuation: value,
        })
    }

    const onWidthChange = (newWidth: number) => {
        setWidthInput(newWidth)
        updateAssetValues(id, {
            width: newWidth,
        })
    }

    const onHeightChange = (newHeight: number) => {
        setHeightInput(newHeight)
        updateAssetValues(id, {
            height: newHeight,
        })
    }

    return (
        <div>
            <StyledInputWrapper>
                <label htmlFor="zone-width">
                    Width
                </label>
                <div>
                    <StyledInput id="zone-width" value={widthInput} onChange={event => {
                        onWidthChange(parseFloat(event.target.value))
                    }} slimmer smallestFont type="number"/>
                </div>
            </StyledInputWrapper>
            <StyledInputWrapper>
                <label htmlFor="zone-height">
                    Height
                </label>
                <div>
                    <StyledInput id="zone-height" value={heightInput} onChange={event => {
                        onHeightChange(parseFloat(event.target.value))
                    }} slimmer smallestFont type="number"/>
                </div>
            </StyledInputWrapper>
            <StyledInputWrapper>
                <label htmlFor="zone-user-attenuation">
                    Attenuation
                </label>
                <div>
                    <StyledInput id="zone-user-attenuation" value={attenuationInput} onChange={event => {
                        onAttenuationChange(event.target.value)
                    }} slimmer smallestFont type="number"/>
                </div>
            </StyledInputWrapper>
            <p>
                Leave blank for default.
            </p>
        </div>
    )
}

const mappedFields = {
    [SPECIAL_ASSETS._channelZone.key]: ChannelZoneFields,
    [SPECIAL_ASSETS._signPost.key]: SignPostFields,
}

export const SelectedAssetInstance: React.FC<{
    assetKey: string,
}> = ({assetKey}) => {
    const asset = useAssetInstance(assetKey)

    const Fields = useMemo(() => {
        if (!asset) return null
        const {assetKey = ''} = asset
        return mappedFields[assetKey] ?? null
    }, [asset])

    if (!asset) return null

    return (
        <div>
            {
                Fields && <Fields id={assetKey} asset={asset}/>
            }
        </div>
    )
}
