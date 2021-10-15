import React from "react"
import { Helmet } from "react-helmet-async";
import {useEventInitialData} from "../../state/event/event";

const DEFAULT_PAYMENT_POINTER = '$ilp.uphold.com/iLFADfwx9wwH'

const EventMeta: React.FC = () => {

    const eventData = useEventInitialData()

    if (!eventData) return null

    const paymentPointer = eventData?.eventData?.paymentPointer || DEFAULT_PAYMENT_POINTER

    return (
        <Helmet>
            <meta
                name="monetization"
                content={paymentPointer}/>
        </Helmet>
    )
}

export default EventMeta