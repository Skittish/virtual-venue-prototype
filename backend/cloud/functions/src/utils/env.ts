import * as functions from 'firebase-functions';
import {get} from 'lodash'

export const getFunctionsEnvVariables = () => {
    return functions.config()
}

export const getEnvVariable = (path: string, fallback?: any) => {
    return get(getFunctionsEnvVariables(), path, fallback)
}

export const getVirtualVenueEnv = () => {
    return process.env.VIRTUAL_VENUE_ENV ?? functions.config().virtualvenue.env
}

export const isProductionEnv = () => {
    return getVirtualVenueEnv() === 'production'
}

export const isStagingEnv = () => {
    return getVirtualVenueEnv() === 'staging'
}
