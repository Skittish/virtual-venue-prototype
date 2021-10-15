import {getEventUserRef} from "../refs";
import {getEventId} from "../../state/event/event";

export const setEventUserChangingAnimal = (userId: string, isChanging: boolean = true) => {
    const ref = getEventUserRef(getEventId(), userId)
    return ref.update({
        isSelectingAnimal: isChanging,
    })
}
