import React, {useEffect} from "react"
import {auth} from "../../firebase/authentication";
import firebase from "firebase/app";
import {StyledFirebaseAuth} from "react-firebaseui";
import styled from "styled-components";
import { StyledMediumHeading } from "../../ui/typography/headings";
import * as firebaseui from "firebaseui";
import {isLocalMode} from "../../utils/env";
import {isAnonSignin} from "../../utils/params";

const StyledContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const StyledHeading = styled(StyledMediumHeading)`
  margin-bottom: 10px;
`

const UserAuth: React.FC<{
    destination?: string,
    title?: string,
}> = ({destination, title}) => {

    const uiConfig: firebaseui.auth.Config = {
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        ],
    }

    if (destination) {
        uiConfig.signInSuccessUrl = destination
    } else {
        uiConfig.callbacks = {
            // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: () => false,
        }
    }

    useEffect(() => {

        if (isLocalMode() && isAnonSignin()) {

            auth.signInAnonymously()

        }

    }, [])

    return (
        <StyledContainer>
            <StyledHeading>
                {
                    title ? title : 'Sign In'
                }
            </StyledHeading>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}/>
        </StyledContainer>
    )
}

export default UserAuth
