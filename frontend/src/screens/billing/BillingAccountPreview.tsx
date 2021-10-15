import React from "react"
import { Link } from "react-router-dom";
import {FirestoreBillingAccountData} from "../../firebase/firestore/types";
import { StyledContainer as StyledContainerBase } from "./PaymentMethodPreview";
import styled from "styled-components";
import {getBillingAccountName} from "../../firebase/firestore/billingAccount";

const StyledContainer = styled(StyledContainerBase)`
  color: inherit;
  text-decoration: none;
  max-width: 400px;
`

export const BillingAccountPreview: React.FC<{
    id: string,
    data: FirestoreBillingAccountData,
}> = ({id, data}) => {
    const name = getBillingAccountName(data, id)
    return (
        <StyledContainer as={Link} to={`/billing/account/${id}`}>
            {name}
        </StyledContainer>
    )
}
