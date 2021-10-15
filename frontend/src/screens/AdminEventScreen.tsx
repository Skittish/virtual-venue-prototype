import React from "react"
import {useParams} from "react-router-dom";
import { AdminEventView } from "../admin/views/AdminEventView";
import AuthWrapper from "../event/components/AuthWrapper";

export const AdminEventScreen: React.FC = () => {

    const { eventID } = useParams<{
        eventID: string,
    }>()

    return (
        <>
            <AuthWrapper>
                <AdminEventView eventId={eventID}/>
            </AuthWrapper>
        </>
    )
}
