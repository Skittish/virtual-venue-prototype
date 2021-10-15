import React from "react"
import styled from "styled-components";
import {THEME} from "./theme";

const StyledList = styled.ul`

    > li {
      &:not(:first-child) {
        margin-top: ${THEME.spacing.$1b}px;
      }
    }

`

export const SimpleList: React.FC = ({children, ...props}) => {
    return (
        <StyledList {...props}>
            {
                React.Children.map(children, child => (
                    <li>
                        {child}
                    </li>
                ))
            }
        </StyledList>
    )
}