import React from "react";
import {Stripe} from "stripe";
import styled, {css} from "styled-components";
import { StyledTextButton, StyledTextHoverButton } from "../../ui/buttons";
import {THEME} from "../../ui/theme";

export const cssSelectable = css`
  border: 0;
  background-color: rgba(0,0,0,0.1);
  cursor: pointer;
  
  &:focus,
  &:hover {
    background-color: rgba(0,0,0,0.25);
  }
  
`

export const cssRoundedItem = css`
  padding: ${THEME.spacing.$2}px;
  border: 2px solid rgba(0,0,0,0.25);
  border-radius: 8px;
`

export const StyledContainer = styled.div<{
    selectable?: boolean,
}>`
  ${cssRoundedItem};
  display: block;
  
  ${props => props.selectable ? cssSelectable : ''};
  
`

const StyledHeader = styled.header`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-column-gap: ${THEME.spacing.$1b}px;
`

const StyledName = styled.div`
  font-size: 1.1rem;
`

const StyledCard = styled.div`
  display: grid;
  grid-template-columns: auto auto auto 1fr;
  grid-column-gap: ${THEME.spacing.$1b}px;
  margin-top: ${THEME.spacing.$1}px;
`

export const PaymentMethodNamePreview: React.FC<{
    method: Stripe.PaymentMethod,
}> = ({method}) => {
    return (
        <StyledName>
            {method.billing_details.name}
        </StyledName>
    )
}

export const PaymentMethodCardPreview: React.FC<{
    method: Stripe.PaymentMethod,
}> = ({method}) => {
    if (!method.card) return null
    return (
        <StyledCard>
            <div>
                {method.card.brand}
            </div>
            <div>
                XXXX-XXXX-XXXX-{method.card.last4}
            </div>
            <div>
                exp: <span>{method.card.exp_month}/{method.card.exp_year}</span>
            </div>
        </StyledCard>
    )
}

export const PaymentMethodPreview: React.FC<{
    method: Stripe.PaymentMethod,
    onSelect?: () => void,
    onDelete?: (id: string) => void,
}> = ({method, onSelect,  onDelete}) => {

    const selectableProps: any = !!onSelect ? {
        role: 'button',
        onClick: onSelect,
        tabIndex: "0",
        selectable: true,
    } : {}

    return (
        <StyledContainer {...selectableProps}>
            <StyledHeader>
                <PaymentMethodNamePreview method={method}/>
                {
                    onDelete && (
                        <div>
                            <StyledTextHoverButton onClick={(event) => {
                                event.stopPropagation()
                                onDelete(method.id)
                            }}>
                                Delete
                            </StyledTextHoverButton>
                        </div>
                    )
                }
            </StyledHeader>
            <PaymentMethodCardPreview method={method}/>
        </StyledContainer>
    );
};
