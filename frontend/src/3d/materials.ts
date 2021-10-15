import {MeshStandardMaterial} from "three";

export const MATERIALS: {
    [key: string]: MeshStandardMaterial,
} = {
    green: new MeshStandardMaterial({
        color: '#0e3f06',
    }),
    brown: new MeshStandardMaterial({
        color: '#2b2c1c',
    }),
    stone: new MeshStandardMaterial({
        color: '#161e1f',
    }),
}