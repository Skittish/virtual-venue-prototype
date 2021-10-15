import {createContext, useContext} from "react";

export const Context = createContext({
    billingAccountId: '',
})

export const useBillingAccountScreenContext = () => useContext(Context)

export const useBillingAccountId = () => useBillingAccountScreenContext().billingAccountId
