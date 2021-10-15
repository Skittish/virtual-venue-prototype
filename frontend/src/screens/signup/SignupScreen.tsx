import React, {useEffect, useState} from "react"
import AuthRequiredWrapper from "../../components/AuthRequiredWrapper";
import AuthWrapper from "../../event/components/AuthWrapper";
import * as queryString from "query-string";
import {redeemInvitationCode} from "../../firebase/events";
import styled from "styled-components";
import {THEME} from "../../ui/theme";
import {useHistory} from "react-router-dom";
import * as Sentry from "@sentry/react";

const getToken = () => {
    // eslint-disable-next-line no-restricted-globals
    const parsed = queryString.parse(location.search);
    return parsed.c ?? ''
}

const StyledContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  
  p {
    &:not(:first-child) {
      margin-top: ${THEME.spacing.$2}px;
    }
  }
  
`

const Content: React.FC = () => {

    const [redeemingToken, setRedeemingToken] = useState(false)
    const [redirectToDestination, setRedirectToDestination] = useState(false)
    const [tokenErrorReason, setTokenErrorMessage] = useState('')

    useEffect(() => {

        const token = getToken() as string

        if (!token) {
            setRedirectToDestination(true)
            return
        }

        setRedeemingToken(true)

        redeemInvitationCode(token)
            .then((response) => {
                if (!response.success) {
                    if (response.reason) {
                        setTokenErrorMessage(response.reason)
                        return
                    }
                }
                setRedirectToDestination(true)
            })
            .catch((error) => {
                console.error(error)
                Sentry.captureMessage("Sign up invitation code error.");
                Sentry.captureException(error);
                setTokenErrorMessage('')
            })

    }, [])

    const history = useHistory()

    useEffect(() => {
        if (!redirectToDestination) return

        history.replace('/')

    }, [redirectToDestination])

    useEffect(() => {
        if (!tokenErrorReason) return

        const timeout = setTimeout(() => {
            setRedirectToDestination(true)
        }, 5 * 1000)

        return () => {
            clearTimeout(timeout)
        }

    }, [tokenErrorReason])

    if (tokenErrorReason) {

        if (tokenErrorReason === 'code_already_redeemed') {

            return (
                <div>
                    <p>
                        Sign up successful.
                    </p>
                    <p>
                        However your invitation code has already been redeemed, so you will have default account privileges.
                    </p>
                    <p>
                        Redirecting to home page automatically...
                    </p>
                </div>
            )

        }

        return (
            <div>
                <p>
                    Sign up successful.
                </p>
                <p>
                    However something went wrong when redeeming your invitation code, , so you will have default account privileges.
                </p>
                <p>
                    Redirecting to home page automatically...
                </p>
            </div>
        )

    }

    return (
        <div>
            <p>
                loading...
            </p>
        </div>
    )

}

export const SignupScreen: React.FC = () => {
    return (
        <AuthWrapper>
            <AuthRequiredWrapper title="Sign Up">
                <StyledContainer>
                    <Content/>
                </StyledContainer>
            </AuthRequiredWrapper>
        </AuthWrapper>
    )
}
