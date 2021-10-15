type BaseState = {
    hiFiGain?: number,
    userAttenuation: number,
    userRolloff: number,
}

export const smallEventConfig: BaseState = {
    userAttenuation: 0.5,
    userRolloff: 16,
}

const largeEventConfig: BaseState = {
    userAttenuation: 0.5,
    userRolloff: 16,
}

export const insideStageConfig: BaseState = {
    userAttenuation: 0.00001,
    userRolloff: 999999,
}

export const getHifiBaseState = (numberOfUsersInRoom: number, insideStage: boolean, userAttenuation?: number, userRolloff?: number): BaseState => {
    if (insideStage) {
        return insideStageConfig
    }
    const defaultState = numberOfUsersInRoom >= 8 ? largeEventConfig : smallEventConfig
    const state = {
        ...defaultState,
    }
    if (userAttenuation != undefined) {
        state.userAttenuation = userAttenuation
    }
    if (userRolloff != undefined) {
        state.userRolloff = userRolloff
    }
    return state
}

export let hifiBaseState: BaseState = getHifiBaseState(1, false)

export const updateHifiBaseState = (numberOfUsersInRoom: number, insideStage: boolean, userAttenuation?: number, userRolloff?: number) => {
    hifiBaseState = getHifiBaseState(numberOfUsersInRoom, insideStage, userAttenuation, userRolloff)
}

export const getHifiApiDataBaseState = () => {
    return hifiBaseState
}
