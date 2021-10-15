import {database} from "../firebase/client";

export const generateRandomId = () => {
    return database.ref('temp').push().key ?? ''
}
