import React, {useEffect} from "react"
import {auth} from "../firebase/authentication";

const SignOut: React.FC = () => {

    useEffect(() => {
        auth.signOut()
    }, [])

    return (
        <div>
            You are now signed out.
        </div>
    )
}

export default SignOut