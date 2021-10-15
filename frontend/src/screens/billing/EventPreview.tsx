import React from "react"
import {FirestoreEventData} from "../../firebase/firestore/types";

export const EventPreview: React.FC<{
    id: string,
    event: FirestoreEventData,
}> = ({id}) => {
    return (
        <div>
            {id}
        </div>
    )
}
