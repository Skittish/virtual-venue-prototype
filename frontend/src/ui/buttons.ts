import styled, {css} from "styled-components";
import {COLORS} from "./colors";

export const cssResetButton = css`
  border: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  background: none;
  margin: 0;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:not(:disabled) {
    cursor: pointer;
  }
  
`

const cssAlert = css`
  background-color: ${COLORS.red};
`

const cssInline = css`
  display: inline-block;
`

const cssFullWidth = css`
  width: 100%;
  max-width: 100%;
`

const cssHide = css`
  
  &:not(:focus) {
    visibility: hidden;
  }
  
`

export const StyledRoundedButton = styled.button<{
    alert?: boolean,
    inline?: boolean,
    fullWidth?: boolean,
    hide?: boolean,
}>`
    ${cssResetButton};
    ${props => props.inline ? cssInline : ''};
    background-color: ${COLORS.blue};
    padding: 15px 35px;
    font-size: 1.5rem;
    font-weight: 800;
    border-radius: 45px;

    &:disabled {
      opacity: 0.5;
    }
  
    &:not(:disabled) {
      cursor: pointer;
    }
  
    ${props => props.alert ? cssAlert : ''};
    ${props => props.fullWidth ? cssFullWidth : ''};
    ${props => props.hide ? cssHide : ''};
  
`;

const cssSmall = css`
  width: 32px;
  height: 32px;
`

export const StyledRoundButton = styled(StyledRoundedButton)<{
    small?: boolean,
}>`
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  ${props => props.small ? cssSmall : ''};
  
  &:disabled {
    background: rgba(0,0,0,0.1);
  }
  
`

const cssMedium = css`
  height: auto;
  padding: 16px 32px;
  font-size: 1.2rem;
`

const cssNoBreak = css`
  white-space: nowrap;
`

export const StyledSmallRoundButton = styled(StyledRoundedButton)<{
    medium?: boolean,
    noBreak?: boolean,
}>`
  width: auto;
  height: 40px;
  border-radius: 40px;
  padding: 5px 15px;
  font-size: 0.9rem;
  ${props => props.fullWidth ? cssFullWidth : ''};
  ${props => props.medium ? cssMedium : ''};
  ${props => props.noBreak ? cssNoBreak : ''};
`

export const StyledPlayWrapper = styled.span`

    ${StyledRoundButton} & {
      position: relative;
      left: 1px;
      top: -1px;
    }

`

export const StyledTextButton = styled.button`
  ${cssResetButton};
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
  
`

const cssThin = css`
  display: inline-block;
  width: auto;
  text-align: left;
`

export const StyledTextHoverButton = styled.button<{
    thin?: boolean,
}>`
  ${cssResetButton};
  font-size: 0.8rem;
  cursor: pointer;
  
  ${props => props.thin ? cssThin : ''};
  
  &:hover {
    text-decoration: underline;
  }
  
`
