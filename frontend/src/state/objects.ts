import create from "zustand";
import {Object3D} from "three";
import {MutableRefObject, useEffect} from "react";

type State = {
    objects: {
        [key: string]: MutableRefObject<Object3D | undefined>
    }
}

export const useStoredObjects = create<State>(() => ({
    objects: {},
}))

export const addStoredObject = (key: string, objectRef: MutableRefObject<Object3D | undefined>) => {
    useStoredObjects.setState(state => {
        const {objects} = state
        return {
            objects: {
                ...objects,
                [key]: objectRef,
            }
        }
    })
}

export const removeStoredObject = (key: string) => {
    useStoredObjects.setState(state => {
        const {objects} = state
        const updatedObjects = {
            ...objects,
        }
        delete updatedObjects[key]
        return {
            objects: updatedObjects,
        }
    })
}

export const useStoreObject = (key: string, objectRef: MutableRefObject<Object3D | undefined>) => {

    useEffect(() => {
        addStoredObject(key, objectRef)
        return () => {
            removeStoredObject(key)
        }
    }, [key, objectRef])

}

export const useStoredObjectRef = (key: string): MutableRefObject<Object3D | undefined> | null => {
    return useStoredObjects(state => state.objects[key] ?? null)
}
