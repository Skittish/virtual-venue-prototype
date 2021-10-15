export const isLocalMode = () => {
    return !!process.env.REACT_APP_LOCAL
}

export const isProductionEnvironment = () => {
    return process.env.REACT_APP_SERVER_ENVIRONMENT === 'production'
}

export const isStripeProductionEnvironment = () => {
    return process.env.REACT_APP_STRIPE_ENVIRONMENT === 'production'
}
