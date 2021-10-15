import {createContext} from "react";

type State = {
    addVideo: (videoDomElement: any) => () => void,
}

export const Context = createContext(null as unknown as State)