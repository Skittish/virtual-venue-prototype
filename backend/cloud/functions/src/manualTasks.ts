/* eslint-disable no-void */

import {fetchAllEvents, getEventSpaceIds} from "./scheduledTasks";
import {storeSpaceInEventFirestore, updateEventData} from "./firestore/event";
import {DEFAULT_EVENT_QUOTA_CAPACITY} from "./events/quotaCapacity";
import {getEventCreator} from "./events/types";

export const convertEventDataToFirestore = async() => {

    const events = await fetchAllEvents()

    Object.entries(events).forEach(([eventId, event]) => {
        const spaceIds = getEventSpaceIds(event)
        spaceIds.forEach(spaceId => {
            void storeSpaceInEventFirestore(eventId, spaceId)
        })
        void updateEventData(eventId, {
            creatorId: getEventCreator(event),
            quotaCapacity: DEFAULT_EVENT_QUOTA_CAPACITY,
        })
    })

}
