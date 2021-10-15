import React, {useEffect, useState} from "react"
import {Color, Material} from "three";
import OutsideClickHandler from 'react-outside-click-handler';
import {StyledInput} from "../../../../ui/inputs";
import {HexColorPicker} from "react-colorful";
import styled from "styled-components";
import {THEME} from "../../../../ui/theme";

const StyledMain = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: ${THEME.spacing.$1b}px;
`

const StyledPreview = styled.div<{
    color: string,
}>`
  width: 36px;
  height: 36px;
  background-color: ${props => props.color};
  border: 2px solid rgba(0,0,0,0.1);
  border-radius: ${THEME.radii.$1}px;
  cursor: pointer;
`

export const ModelMaterial: React.FC<{
    material: Material,
    overriddenValue?: string,
    onChange: (value: string) => void,
}> = ({material, onChange, overriddenValue}) => {

    const [picking, setPicking] = useState(false)

    const [color, setColor] = useState(overriddenValue || `#${((material as any).color as Color).getHexString()}`)

    useEffect(() => {
        if (overriddenValue) {
            ((material as any).color as Color).set(overriddenValue || color).convertSRGBToLinear()
        }
    }, [])

    const updateColor = (newColor: string) => {
        ((material as any).color as Color).set(newColor).convertSRGBToLinear()
        setColor(newColor)
        onChange(newColor)
    }

    return (
        <div>
            <div>{material.name}</div>
            <StyledMain>
                <StyledPreview onClick={() => setPicking(true)} color={color}/>
                <div>
                    <StyledInput value={color} onChange={event => updateColor(event.target.value)}
                                 placeholder={"color"} smaller smallerFont slim fullWidth/>
                </div>
            </StyledMain>
            {
                picking && (
                    <OutsideClickHandler onOutsideClick={() => setPicking(false)}>
                        <HexColorPicker color={color} onChange={updateColor}/>
                    </OutsideClickHandler>
                )
            }
        </div>
    )
}