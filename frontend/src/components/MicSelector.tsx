import React, {useCallback, useEffect, useMemo, useState} from "react"
import styled, {css} from "styled-components";
import {MicDisabledIcon, MicEnabledIcon } from "../ui/icons";
import {THEME} from "../ui/theme";
import {FaAngleDown} from "react-icons/all";
import {cssInputBasic} from "../ui/inputs";
import { StyledRoundButton } from "../ui/buttons";
import {useProxy} from "valtio";
import {audioState} from "../state/audio";
import {useEnableMic} from "../event/components/EventUI/EventUI";

const StyledContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: ${THEME.spacing.$1b}px;
  align-items: center;
  position: relative;
`

const cssDisabled = css`
  opacity: 0.5;
`

export const StyledSelectWrapper = styled.div<{
    disabled?: boolean,
}>`
  position: relative;
  
  select {
    appearance: none;
    ${cssInputBasic};
    display: block;
    font-size: 1rem;
    text-align: left;
    border-radius: 6px;
    width: 100%;
    padding: 8px;
    padding-right: 24px;
    max-width: 100%;
  }
  
  > span {
    position: absolute;
    top: 0;
    right: 6px;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  ${props => props.disabled ? cssDisabled : ''};
  
`

export const MicButton: React.FC<{
    disabled?: boolean,
}> = ({disabled}) => {

    const {micMuted} = useProxy(audioState)

    const toggleMic = () => {
        audioState.micMuted = !audioState.micMuted
    }

    return (
        <StyledRoundButton type="button" alert={micMuted} onClick={toggleMic} disabled={disabled}>
            {
                micMuted ? (
                    <MicDisabledIcon size={16}/>
                ) : (
                    <MicEnabledIcon size={14}/>
                )
            }
        </StyledRoundButton>
    )
}

export type SelectOption = {
    value: string,
    label: string,
}

const Select: React.FC<{
    initialValue?: string,
    disabled?: boolean,
    options: SelectOption[],
    onChange: (value: any) => void,
}> = ({initialValue, disabled = false, options, onChange}) => {


    const [value, setValue] = useState(initialValue ? initialValue : options.length > 0 ? options[0].value : '')

    useEffect(() => {
        onChange(value)
    }, [value, onChange])

    return (
        <StyledSelectWrapper disabled={disabled}>
            <select disabled={disabled} value={value} onChange={event => setValue(event.target.value)}>
                {
                    options.map((option) => (
                        <option value={option.value} key={option.value}>
                            {option.label}
                        </option>
                    ))
                }
            </select>
            <span>
                <FaAngleDown/>
            </span>
        </StyledSelectWrapper>
    )
}

const StyledErrorMessage = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  text-align: center;
  margin-top: 4px;
  font-size: 0.8rem;
`

const localState = {
    selectedValue: '',
}

const MicSelector: React.FC = () => {

    const {micGranted, micRejected} = useProxy(audioState)
    const disabled = !micGranted
    const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([])
    const enableMic = useEnableMic()

    useEffect(() => {
        if (!micGranted) return
        navigator.mediaDevices.enumerateDevices()
            .then((result) => {
                setMediaDevices(result)
            })
    }, [micGranted])

    const options = useMemo(() => {
        if (!micGranted || mediaDevices.length === 0) {
            return [{
                value: '',
                label: 'Mic not found',
            }]
        }
        return mediaDevices.filter((device) => {
            return device.kind === 'audioinput'
        }).map((device) => ({
            value: device.deviceId,
            label: device.label,
        }))
    }, [mediaDevices, micGranted])

    const onChange = useCallback((value: any) => {
        if (value && value !== localState.selectedValue) {
            enableMic(value)
                .then(() => {
                    localState.selectedValue = value
                })
        }
    }, [])

    return (
        <StyledContainer>
            <div>
                <MicButton disabled={disabled}/>
            </div>
            <div>
                <Select initialValue={localState.selectedValue} disabled={disabled} options={options} onChange={onChange}/>
            </div>
            {
                micRejected && (
                    <StyledErrorMessage>
                        Mic permissions needed
                    </StyledErrorMessage>
                )
            }
        </StyledContainer>
    )
}

export default MicSelector
