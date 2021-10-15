import {useState} from "react";
import {proxy} from "valtio";

export type PlayerState = {
    volume: number,
}

export const usePlayerState = (): PlayerState => {
    return useState(() => proxy<PlayerState>({volume: 0}))[0]
}