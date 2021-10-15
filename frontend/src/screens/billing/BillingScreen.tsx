import React, {useState} from "react"
import AuthWrapper from "../../event/components/AuthWrapper"
import AuthRequiredWrapper from "../../components/AuthRequiredWrapper";
import {useCurrentUserId} from "../../state/auth";
import {Route, Switch} from "react-router-dom";
import {BillingAccountScreen, cssContainer} from "./BillingAccountScreen";
import {SubscriptionScreen} from "./SubscriptionScreen";
import styled from "styled-components";
import {StyledLargeHeading} from "../../ui/typography/headings";
import {StyledSmallRoundButton} from "../../ui/buttons";
import {THEME} from "../../ui/theme";
import {CreateBillingAccountModal} from "./CreateBillingAccountModal";
import {BillingAccountPreview} from "./BillingAccountPreview";
import {UpgradeEventScreen} from "./UpgradeEventScreen";
import {useBillingAccounts, useUserBillingAccounts} from "./hooks";

const StyledContainer = styled.div`
  ${cssContainer};
`

const StyledHeader = styled.header`
  margin-bottom: ${THEME.spacing.$3}px;

    h2 {
      margin-bottom: ${THEME.spacing.$1b}px;
    }
    
`

const StyledList = styled.ul`

    > li {
      
      &:not(:first-child) {
        margin-top: ${THEME.spacing.$1b}px;
      }
      
    }

`

const Content: React.FC = () => {

    const userId = useCurrentUserId()
    const billingAccounts = useUserBillingAccounts()
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false)

    const {data, loaded} = useBillingAccounts(userId)

    return (
        <>
            <StyledContainer>
                <StyledHeader>
                    <StyledLargeHeading>Billing Accounts</StyledLargeHeading>
                    <div>
                        <StyledSmallRoundButton onClick={() => {
                            setShowCreateAccountModal(true)
                        }}>Create new billing account</StyledSmallRoundButton>
                    </div>
                </StyledHeader>
                {
                    loaded ? (
                        <StyledList>
                            {
                                Object.entries(data).map(([id, billingAccount]) => (
                                    <li key={id}>
                                        <BillingAccountPreview id={id} data={billingAccount}/>
                                    </li>
                                ))
                            }
                        </StyledList>
                    ) : (
                        <div>
                            Loading...
                        </div>
                    )
                }
            </StyledContainer>
            {
                showCreateAccountModal && (
                    <CreateBillingAccountModal onClose={() => {
                        setShowCreateAccountModal(false)
                    }}/>
                )
            }
        </>
    )
}

export const BillingScreen: React.FC = () => {
    return (
        <>
            <AuthWrapper>
                <AuthRequiredWrapper>
                    <Switch>
                        <Route path="/billing/account/:billingAccountId/subscription/:id" exact component={SubscriptionScreen}/>
                        <Route path="/billing/account/:id" exact component={BillingAccountScreen}/>
                        <Route path="/billing/account/:id/create/:eventId" exact component={BillingAccountScreen}/>
                        <Route path="/billing/upgrade/:id" exact component={UpgradeEventScreen}/>
                        <Route path="/billing" exact component={Content}/>
                    </Switch>
                </AuthRequiredWrapper>
            </AuthWrapper>
        </>
    )
}
