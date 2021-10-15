/* eslint-disable no-void */
import * as functions from 'firebase-functions';
import {stripe} from "./stripe";
import {handlePaymentSucceeded} from "./payment";
import {handleSubscriptionCreated, handleSubscriptionDeleted, handleSubscriptionUpdated} from "./subscription";
import {Stripe} from "stripe";

// const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const STRIPE_WEBHOOK_SECRET = functions.config().stripe.webhook_secret as string

export const handleStripeWebhook = async (req: any, res: any) => {

    let event;

    if (!STRIPE_WEBHOOK_SECRET) {
        return res.sendStatus(400);
    }

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            req.headers['stripe-signature'],
            STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        console.log(err);
        console.log(`⚠️  Webhook signature verification failed.`);
        console.log(
            `⚠️  Check the env file and enter the correct webhook secret.`
        );
        return res.sendStatus(400);
    }
    // Extract the object from the event.
    const dataObject = event.data.object;

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample

    switch (event.type) {
        case 'invoice.paid':
            // todo
            // Used to provision services after the trial has ended.
            // The status of the invoice will show up as paid. Store the status in your
            // database to reference when a user accesses your service to avoid hitting rate limits.
            break;
        case 'invoice.payment_succeeded':
            await handlePaymentSucceeded(dataObject)
            break;
        case 'invoice.payment_failed':
            // todo
            // If the payment fails or the customer does not have a valid payment method,
            //  an invoice.payment_failed event is sent, the subscription becomes past_due.
            // Use this webhook to notify your user that their payment has
            // failed and to retrieve new card details.
            break;
        case 'customer.subscription.created':
            await handleSubscriptionCreated(dataObject as Stripe.Subscription)
            break;
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(dataObject as Stripe.Subscription, event.data.previous_attributes as any)
            break;
        case 'customer.subscription.deleted':
            console.log('customer.subscription.deleted')
            if (event.request !== null) {
                // handle a subscription cancelled by your request
                // from above.
                // todo - don't understand this
                await handleSubscriptionDeleted(dataObject as Stripe.Subscription)
            } else {
                // handle subscription cancelled automatically based
                // upon your subscription settings.
                await handleSubscriptionDeleted(dataObject as Stripe.Subscription)
            }
            break;
        default:
        // Unexpected event type
    }
    return res.sendStatus(200);

}
