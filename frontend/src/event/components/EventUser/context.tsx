import {createContext, useContext} from "react";
import {PlayerState} from "./usePlayerState";
import {FirebaseUserData} from "../../../state/event/users";

type State = {
    playerState: PlayerState,
    userData: FirebaseUserData
}

export const EventUserContext = createContext<State>(null as unknown as State)

export const usePlayerState = () => {
    return useContext(EventUserContext).playerState
}

export const useUserData = () => {
    return useContext(EventUserContext).userData
}