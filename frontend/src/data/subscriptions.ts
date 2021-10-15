import {FirestoreSubscriptionData} from "../firebase/firestore/types";
import {isStripeProductionEnvironment} from "../utils/env";

export type SubscriptionPlan = {
    id: string,
    planCategory: string,
    title: string,
    developmentProductIds: string[],
    developmentPriceId: string,
    productionProductIds: string[],
    productionPriceId: string,
}

export const communityTestPlan: SubscriptionPlan = {
    id: 'communityTestPlan',
    planCategory: 'communityCreatorPlan',
    title: 'Creator/Community',
    productionProductIds: [''],
    developmentProductIds: [''],
    developmentPriceId: '',
    productionPriceId: '',
}

export const getSubscriptionProductIds = (subscription: SubscriptionPlan) => {

    const isProd = isStripeProductionEnvironment()

    if (isProd) {
        return subscription.productionProductIds
    }

    return subscription.developmentProductIds

}

export const getSubscriptionPriceId = (subscription: SubscriptionPlan) => {

    const isProd = isStripeProductionEnvironment()

    if (isProd) {
        return subscription.productionPriceId
    }

    return subscription.developmentPriceId

}

const subscriptionPlans = [communityTestPlan]

export const getSubscriptionPlanFromSubscriptionData = (subscription: FirestoreSubscriptionData) => {

    const {
        metadata,
        products,
    } = subscription

    if (metadata?.planCategory) {
        const match = subscriptionPlans.find(plan => plan.planCategory === metadata.planCategory)
        if (match) return match
    }

    if (products && products.length > 0) {
        const match = subscriptionPlans.find(plan => {
            return getSubscriptionProductIds(plan).includes(products[0])
        })
        if (match) return match
    }

    return null

}

export const getSubscriptionPlanFromId = (id: string): SubscriptionPlan | null => {

    let subscription = null

    subscriptionPlans.forEach(plan => {
        if (plan.id === id) {
            subscription = plan
        }
    })

    return subscription

}

export const getSubscriptionPlan = (productId: string): SubscriptionPlan | null => {
    let subscription = null

    subscriptionPlans.forEach(plan => {

        const productIds = getSubscriptionProductIds(plan)

        productIds.forEach(id => {
            if (productId === id) {
                subscription = plan
                return
            }
        })
    })

    return subscription
}
