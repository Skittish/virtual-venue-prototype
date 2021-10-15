/* eslint-disable no-void */
import * as functions from 'firebase-functions';
import fetch from "node-fetch";
import {getEventDataRef} from "./refs";
import {EventData, HifiSpaceData} from "./types";
import {storeSpaceInEventFirestore} from "../firestore/event";

require('dotenv').config();

const { default: SignJWT } = require('jose/jwt/sign');
const crypto = require('crypto');

const APP_ID = functions.config().hifi.app_id;
const APP_SECRET = functions.config().hifi.app_secret as string;

const SECRET_KEY_FOR_SIGNING = crypto.createSecretKey(Buffer.from(APP_SECRET, "utf8"));

export async function generateJWT(userId: string, spaceId: string, admin: boolean, developmentApp: boolean) {

    const appId = APP_ID
    const secretKey = SECRET_KEY_FOR_SIGNING

    let hiFiJWT;
    try {
        hiFiJWT = await new SignJWT({
            "user_id": userId,
            "app_id": appId,
            "space_id": spaceId,
            "admin": admin,
        })
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setExpirationTime('24h')
            .sign(secretKey);

        return hiFiJWT;
    } catch (error) {
        console.error(`Couldn't create JWT! Error:\n${error}`);
        return;
    }
}

export enum HifiCapacity {
    regular = 'Regular',
    medium = '50-user',
    large = '100-user',
    extraLarge = '150-user'
}

export const mappedHifiCapacities: Record<string, number> = {
    [HifiCapacity.regular]: 25,
    [HifiCapacity.medium]: 50,
    [HifiCapacity.large]: 100,
    [HifiCapacity.extraLarge]: 150,
}

export const generateHifiAdminToken = (developmentApp: boolean) => {
    return generateJWT('admin', '', true, developmentApp)
}

const BASE_URL = 'https://api-pro.highfidelity.com'

export const generateHifiSpace = async (spaceName: string, developmentApp: boolean, hifiCapacity: string) => {

    const adminJwt = await generateHifiAdminToken(developmentApp)
    const url = `${BASE_URL}/api/v1/spaces/create?token=${adminJwt}&name=${spaceName}&space-version=${hifiCapacity}&global-directional-attenuation-enabled=false`
    const response = await fetch(url)
        .then((res) => res.json())
    const {
        ['space-id']: spaceId,
    } = response as {
        'space-id': string,
    }
    return spaceId
}

export const retrieveUsersInHifiSpace = (spaceId: string, token: string): Promise<any[]> => {
    const url = `${BASE_URL}/api/v1/spaces/${spaceId}/users?token=${token}`
    return fetch(url)
        .then((res) => res.json())
}

export const retrieveHifiAppSpaces = (token: string): Promise<HifiSpaceData[]> => {
    const url = `${BASE_URL}/api/v1/spaces/?token=${token}`
    return fetch(url)
        .then((res) => res.json())
}

export const fetchEventData = async (eventId: string): Promise<EventData | null> => {

    const ref = getEventDataRef(eventId)

    return ref.once('value').then((snapshot) => {
        const data = snapshot.val()
        return data ?? null
    })

}

export const getEventHifiCapacity = (eventData: EventData | null) => {
    return eventData?.hifi?.capacity ?? HifiCapacity.regular
}

export const checkIfEventIsDevelopmentEvent = async (eventId: string, passedEventData?: EventData | null) => {

    let eventData: any = passedEventData

    if (!passedEventData) {
        eventData = await fetchEventData(eventId)
    }

    return eventData ? eventData.isDevelopmentEvent ?? false : false

}

export const generateHifiSpaceForEvent = async (eventSpaceId: string, eventId: string): Promise<{
    spaceId: string,
    capacity: string,
}> => {

    const eventData = await fetchEventData(eventId)

    const isDevelopmentEvent = await checkIfEventIsDevelopmentEvent(eventId, eventData)
    const hifiCapacity = getEventHifiCapacity(eventData)

    return generateHifiSpace(eventSpaceId, isDevelopmentEvent, hifiCapacity)
        .then(async (spaceId) => {
            void storeSpaceInEventFirestore(eventId, spaceId)
            return {
                spaceId,
                capacity: hifiCapacity,
            }
        })
}

export const changeSpaceCapacity = async (spaceId: string, capacity: HifiCapacity, developmentApp: boolean) => {
    const adminJwt = await generateJWT('admin', '', true, developmentApp)
    const url = `https://api.highfidelity.com/api/v1/spaces/${spaceId}/settings?token=${adminJwt}&space-version=${capacity}`
    return fetch(url)
}
