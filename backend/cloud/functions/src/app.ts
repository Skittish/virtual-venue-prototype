import * as admin from "firebase-admin";
import {isProductionEnv} from "./utils/env";

const productionServiceAccount = require("../secrets/virtual-venue-firebase-adminsdk.json");
const stagingServiceAccount = require("../secrets/virtual-venue-staging-firebase-adminsdk.json");

const isProduction = isProductionEnv()

const PROD_DATABASE_URL = ''
const STG_DATABASE_URL = ''

const serviceAccount = isProduction ? productionServiceAccount : stagingServiceAccount

const appOptions = {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: isProduction ? PROD_DATABASE_URL : STG_DATABASE_URL,
}

export const database = admin.database

export const TIMESTAMP = admin.database.ServerValue.TIMESTAMP

export const app = admin.initializeApp(appOptions, 'app');
