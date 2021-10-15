import {fetchUserEmail} from "../events/eventAccess";
import {stripe} from "./stripe";
import {createFirestoreBillingAccount} from "../firestore/billing";

export const createStripeCustomer = async (email: string, userId: string, accountName: string) => {

    const customer = await stripe.customers.create({
        email: email,
        metadata: {
            userId,
            accountName,
        },
    });

    return customer

}

export const createUserStripeCustomerAndStoreIt = async (userId: string, accountName: string) => {

    const userEmail = await fetchUserEmail(userId)

    const customer = await createStripeCustomer(userEmail, userId, accountName)

    const billingAccount = await createFirestoreBillingAccount(customer.id, userId, accountName)

    return billingAccount.id

}

export const handleCreateUserStripeCustomerAndStoreIt = async (req: any, res: any) => {

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    const {
        accountName,
    } = req.body as {
        accountName: string,
    }

    const billingAccountId = await createUserStripeCustomerAndStoreIt(userId, accountName)

    return res.send({
        billingAccountId,
    })

}
