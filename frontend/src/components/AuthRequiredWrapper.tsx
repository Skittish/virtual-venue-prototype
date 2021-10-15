import React from "react"
import UserAuth from "../screens/landing/UserAuth";
import {useIsAuthenticated, useIsAuthenticating} from "../state/auth";
import { StyledFullScreenWrapper } from "../ui/layout";
import { StyledMediumHeading } from "../ui/typography/headings";

export const LoadingView: React.FC = ({children}) => {
    return (
        <StyledFullScreenWrapper>
            {children}
        </StyledFullScreenWrapper>
    )
}

const AuthRequiredWrapper: React.FC<{
    title?: string,
}> = ({children, title}) => {

    const isAuthenticating = useIsAuthenticating()
    const isAuthenticated = useIsAuthenticated()

    if (isAuthenticating) {
        return (
            <LoadingView>
                <StyledMediumHeading>
                    authenticating...
                </StyledMediumHeading>
            </LoadingView>
        )
    }

    if (!isAuthenticated) {
        return (
            <UserAuth title={title}/>
        )
    }

    return (
        <>
            {children}
        </>
    )
}

export default AuthRequiredWrapper
