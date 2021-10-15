import React, {SetStateAction, useEffect, useState} from "react"
import { assetPreviewProxy } from "../../AssetPreview"
import {StyledInputWrapper, StyledLabel} from "./CreateAssetView";

export enum ColliderShapes {
    CIRCLE = 'CIRCLE',
    BOX = 'BOX',
}

const options = [{
    value: ColliderShapes.CIRCLE,
    label: 'Circle',
}, {
    value: ColliderShapes.BOX,
    label: 'Box',
}]

export type PhysicsData = {
    enabled: boolean,
    shape?: ColliderShapes,
    radius?: number,
    hx?: number,
    hy?: number,
}

export const ModelPhysics: React.FC<{
    data: PhysicsData,
    updateData: (action: SetStateAction<PhysicsData>) => void
}> = ({data, updateData}) => {

    const enabled = data.enabled
    const shape = data.shape || ColliderShapes.CIRCLE
    const radius = data.radius ?? 1
    const hx = data.hx ?? 0.5
    const hy = data.hy ?? 0.5

    useEffect(() => {
        assetPreviewProxy.physicsData = data
    }, [data])

    useEffect(() => {
        return () => {
            assetPreviewProxy.physicsData = null
        }
    }, [])

    return (
        <StyledInputWrapper>
            <StyledLabel htmlFor="physics">Physics</StyledLabel>
            <div>
                <div>
                    <StyledLabel htmlFor="collider">
                        Include collider
                    </StyledLabel>
                    <input checked={enabled} type="checkbox" id="collider" onChange={event => {
                        updateData(state => ({
                            ...state,
                            enabled: event.target.checked,
                        }))
                    }}/>
                </div>
                {
                    enabled && (
                        <>
                            <div>
                                <StyledLabel htmlFor="collider-shape">
                                    Shape
                                </StyledLabel>
                                <select id="collider-shape" value={shape} onChange={event => {
                                    updateData(state => ({
                                        ...state,
                                        shape: event.target.value as ColliderShapes,
                                    }))
                                }}>
                                    {
                                        options.map((option) => (
                                            <option value={option.value} key={option.value}>
                                                {option.label}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            {
                                shape === ColliderShapes.CIRCLE && (
                                    <div>
                                        <StyledLabel htmlFor="collider-radius">
                                            Radius
                                        </StyledLabel>
                                        <input value={radius} onChange={event => {
                                            if (!event.target.value) return
                                            updateData(state => ({
                                                ...state,
                                                radius: parseFloat(event.target.value),
                                            }))
                                        }} type="number" step="any" placeholder="Radius"/>
                                    </div>
                                )
                            }
                            {
                                shape === ColliderShapes.BOX && (
                                    <div>
                                        <StyledLabel htmlFor="collider-size">
                                            Size
                                        </StyledLabel>
                                        <div>
                                            <input value={hx} onChange={event => {
                                                if (!event.target.value) return
                                                updateData(state => ({
                                                    ...state,
                                                    hx: parseFloat(event.target.value)
                                                }))
                                            }} type="number" step="any" placeholder="hx"/>
                                            <input value={hy} onChange={event => {
                                                if (!event.target.value) return
                                                updateData(state => ({
                                                    ...state,
                                                    hy: parseFloat(event.target.value)
                                                }))
                                            }} type="number" step="any" placeholder="hy"/>
                                        </div>
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </div>
        </StyledInputWrapper>
    )
}
