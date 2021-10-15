import create from "zustand";
import firebase from "firebase";

type User = firebase.User;

export const useAuthStore = create<{
    authenticating: boolean,
    authenticated: boolean,
    currentUserId: string,
    user: User | null,
}>(set => ({
    authenticating: true,
    authenticated: false,
    currentUserId: '',
    user: null,
}))

export const setSignedOut = () => {
    useAuthStore.setState({
        authenticated: false,
        currentUserId: '',
        user: null,
    })
}

export const useUser = () => {
    return useAuthStore(state => state.user)
}

export const setAuthenticating = (authenticating: boolean) => {
    useAuthStore.setState({
        authenticating,
    })
}

export const setCurrentUser = (id: string, user: User) => {
    useAuthStore.setState({
        authenticating: false,
        currentUserId: id,
        authenticated: true,
        user,
    })
}

export const getCurrentUserId = (): string => {
    return useAuthStore.getState().currentUserId
}

export const useCurrentUserId = (): string => {
    return useAuthStore(state => state.currentUserId)
}

export const useIsAuthenticating = (): boolean => {
    return useAuthStore(state => state.authenticating)
}

export const useIsAuthenticated = (): boolean => {
    return useAuthStore(state => state.authenticated)
}