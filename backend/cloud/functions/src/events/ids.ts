import {app} from "../app";

export const generateUid = () => {
    return app.database().ref().push().key || ''
}
