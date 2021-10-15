import React, {useEffect} from "react"
import "../../firebase/client";
import {auth, signIn} from "../../firebase/authentication";
import {setAuthenticating, setCurrentUser} from "../../state/auth";

const AuthWrapper: React.FC = ({children}) => {

    useEffect(() => {

        auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user.uid, user)
            } else {
                setAuthenticating(false)
            }
        })

    }, [])

    return (
        <>
            {children}
        </>
    )
}

export default AuthWrapper