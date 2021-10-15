import styled, {css} from "styled-components";
import {THEME} from "./theme";

const cssSmaller = css`
  font-size: 1.25rem;
  min-width: 300px;
`

const cssSmallerFont = css`
  font-size: 1.1rem;
  line-height: 2;
`

const cssSmallestFont = css`
  font-size: 1rem;
  line-height: 1.75;
`

export const cssInputReset = css`
  border: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  background: none;
  margin: 0;
`

export const cssInputBasic = css`
  ${cssInputReset};

  font-size: ${THEME.fontSizes.large};
  text-align: center;
  background-color: rgba(0,0,0,0.1);
  border: 2px solid rgba(0,0,0,0.1);
  width: 100%;
  max-width: 290px;
  font-weight: 800;
  padding: 4px;
  border-radius: 12px;

  ::placeholder,
  ::-webkit-input-placeholder {
    color: rgba(255,255,255,0.85);
  }
  :-ms-input-placeholder {
    color: rgba(255,255,255,0.85);
  }

  &:focus {
    background-color: rgba(0,0,0,0.2);
    border-color: transparent;
    outline: none;
  }
`

const cssFullWidth = css`
  max-width: 100%;
  min-width: 0;
`

const cssSlim = css`
  text-align: left;
  line-height: 1;
  padding: 4px 12px;
`

const cssSlimmer = css`
  ${cssSlim};
  padding: 4px 6px;
`

export const StyledInput = styled.input<{
    smaller?: boolean,
    smallerFont?: boolean,
    smallestFont?: boolean,
    fullWidth?: boolean,
    slim?: boolean,
    slimmer?: boolean,
}>`
    ${cssInputBasic};
  
    ${props => props.smaller ? cssSmaller : ''};
    ${props => props.smallerFont ? cssSmallerFont : ''};
    ${props => props.smallestFont ? cssSmallestFont : ''};
    ${props => props.fullWidth ? cssFullWidth : ''};
    ${props => props.slim ? cssSlim : ''};
    ${props => props.slimmer ? cssSlimmer : ''};
`;
