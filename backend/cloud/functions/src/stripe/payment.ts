import {stripe} from "./stripe";

export const getCustomerPaymentMethods = async (customerId: string) => {

    console.log('getCustomerPaymentMethods', customerId)

    const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
    });

    return paymentMethods

}

export const handleGetCustomerPaymentMethods = async (req: any, res: any) => {

    // todo - verify whether user is allowed to make this request?

    const {
        customerId,
    } = req.body as {
        customerId: string,
    }

    console.log('customerId', customerId)

    const paymentMethods = await getCustomerPaymentMethods(customerId)

    return res.send({
        paymentMethods,
    })

}

export const handlePaymentSucceeded = async (dataObject: any) => {

    if (dataObject['billing_reason'] === 'subscription_create') {
        const subscription_id = dataObject['subscription']
        const payment_intent_id = dataObject['payment_intent']

        // Retrieve the payment intent used to pay the subscription
        const payment_intent = await stripe.paymentIntents.retrieve(payment_intent_id);

        await stripe.subscriptions.update(
            subscription_id,
            {
                // @ts-ignore
                default_payment_method: payment_intent.payment_method,
            },
        );

    };

}

export const createCustomerSetupIntent = async (customerId: string) => {
    const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: 'off_session', // The default usage is off_session
    });
    return setupIntent
}

export const handleCreateCustomerSetupIntent = async (req: any, res: any) => {

    const {
        customerId,
    } = req.body as {
        customerId: string,
    }

    const setupIntent = await createCustomerSetupIntent(customerId)

    return res.send(setupIntent)

}

export const setCustomerDefaultPaymentMethod = async (customerId: string, paymentMethodId: string) => {

    return stripe.customers.update(customerId, {
        invoice_settings: {
            default_payment_method: paymentMethodId,
        },
    })

}

export const handleSetCustomerDefaultPaymentMethod = async (req: any, res: any) => {

    const {
        customerId,
        paymentMethodId,
    } = req.body as {
        customerId: string,
        paymentMethodId: string,
    }

    await setCustomerDefaultPaymentMethod(customerId, paymentMethodId)

    return res.send({})

}

export const detachPaymentMethod = async (paymentMethodId: string) => {
    return stripe.paymentMethods.detach(paymentMethodId)
}

export const handleDetachPaymentMethod = async (req: any, res: any) => {

    const {
        paymentMethodId,
    } = req.body as {
        paymentMethodId: string,
    }

    const response = await detachPaymentMethod(paymentMethodId)

    return res.send(response)

}

// export const deleteCustomerCard = async (customerId: string, cardId: string) => {
//     return stripe.customers.deleteSource(customerId, cardId)
// }
//
// export const handleDeleteCustomerCard = async (req: any, res: any) => {
//
//     const {
//         customerId,
//         cardId,
//     } = req.body as {
//         customerId: string,
//         cardId: string,
//     }
//
//     const deleteResponse = await deleteCustomerCard(customerId, cardId)
//
//     return res.send(deleteResponse)
//
// }
