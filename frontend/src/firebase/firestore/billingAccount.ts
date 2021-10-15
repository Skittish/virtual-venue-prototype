import {FirestoreBillingAccountData} from "./types";

export const getBillingAccountName = (account: FirestoreBillingAccountData, id: string) => {

    return account.accountName ?? `Billing Account (${id})`

}
