import {getEventGlobalStageRef} from "./refs";
import {generateGlobalStage} from "./generators";
import {GLOBAL_STAGE_CAPACITY, GlobalStage} from "./types";
import {TIMESTAMP} from "../app";

export const getGlobalStageActiveMembers = (stage: GlobalStage) => {
    return stage.activeMembers ?? {}
}

export const fetchGlobalStage = (eventId: string) => {
    const ref = getEventGlobalStageRef(eventId)
    return ref.once('value').then(snapshot => snapshot.val() ?? generateGlobalStage())
}

export const doesGlobalStageHaveRoom = (stage: GlobalStage) => {
    const {
        capacity = GLOBAL_STAGE_CAPACITY,
    } = stage
    const activeMembers = getGlobalStageActiveMembers(stage)
    return Object.keys(activeMembers).length < capacity
}

const joinGlobalStage = (eventId: string, userId: string) => {
    const globalStageRef = getEventGlobalStageRef(eventId)
    return globalStageRef.update({
        [`activeMembers/${userId}`]: TIMESTAMP,
    })
}

const enterGlobalStage = async (eventId: string, userId: string) => {

    const globalStage = await fetchGlobalStage(eventId)

    if (doesGlobalStageHaveRoom(globalStage)) {
        await joinGlobalStage(eventId, userId)
    }

}

export const handleEnterGlobalStage = async (req: any, res: any) => {

    const {
        eventId,
    } = req.body as {
        eventId: string,
    }

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    // eslint-disable-next-line no-void
    void enterGlobalStage(eventId, userId)

    res.send({})

}

export const leaveGlobalStage = (eventId: string, userId: string) => {

    const globalStageRef = getEventGlobalStageRef(eventId)
    return globalStageRef.update({
        [`activeMembers/${userId}`]: null,
    })

}

// todo - handle automatically when the user goes offline
export const handleLeaveGlobalStage = async (req: any, res: any) => {

    const {
        eventId,
    } = req.body as {
        eventId: string,
    }

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    // eslint-disable-next-line no-void
    void leaveGlobalStage(eventId, userId)

    res.send({})

}
