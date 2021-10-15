import {createContext, MutableRefObject, useContext} from "react";

export type UpdateSubscription = (snapshot: any) => void

export const Context = createContext<{
    subscribe: (subscriptionRef: MutableRefObject<UpdateSubscription>) => () => void,
}>(null!)

export const usePlayerUpdatesHandlerContext = () => {
    return useContext(Context)
}

export const usePlayerUpdatesSubscribe = () => {
    return usePlayerUpdatesHandlerContext().subscribe
}
