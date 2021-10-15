import React, {useEffect} from "react"
import EventUIVideoModal from "../EventUI/EventUIVideoModal";
import Modal from "../../../components/Modal";
import {proxy, useProxy} from "valtio";
import EventVideoElements from "./EventVideoElements";

export const eventVideoProxy = proxy({
    editingVideoId: '',
})

const EventVideoUIHandler: React.FC = () => {

    const editingVideoId = useProxy(eventVideoProxy).editingVideoId

    const isOpen = !!editingVideoId

    const onClose = () => {
        eventVideoProxy.editingVideoId = ''
    }

    return (
        <>
            <Modal isOpen={isOpen} onRequestClose={onClose}>
                <EventUIVideoModal videoId={editingVideoId} onClose={onClose}/>
            </Modal>
            <EventVideoElements/>
        </>
    )
}

export default EventVideoUIHandler