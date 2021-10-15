import React from "react"
import AuthWrapper from "../../event/components/AuthWrapper";
import {useIsAuthenticated, useIsAuthenticating} from "../../state/auth";
import UserAuth from "../landing/UserAuth";
import CreateEventForm from "./CreateEventForm";

const CreateEventScreen: React.FC = () => {

    const isAuthenticating = useIsAuthenticating()
    const isAuthenticated = useIsAuthenticated()

    if (isAuthenticating) {
        return null
    }

    if (!isAuthenticated) {
        return <UserAuth/>
    }

    return (
        <CreateEventForm/>
    )
}

const Wrapper: React.FC = () => {

    return (
        <AuthWrapper>
            <CreateEventScreen/>
        </AuthWrapper>
    )

}

export default Wrapper