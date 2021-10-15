
import Stripe from 'stripe';
import {getEnvVariable} from "../utils/env";

const STRIPE_API_KEY = getEnvVariable('stripe.api_key')

export const stripe = new Stripe(STRIPE_API_KEY, {
    apiVersion: '2020-08-27',
});
