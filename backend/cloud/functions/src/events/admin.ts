import {getSiteAdminDataRef} from "../firestore/refs";
import {SiteAdminData} from "../firestore/types";

export const fetchSiteAdminData = (): Promise<SiteAdminData> => {
    const ref = getSiteAdminDataRef()
    return ref.get().then(snapshot => snapshot.data() ?? {})
}

export const isUserVirtualVenueAdmin = async (userId: string): Promise<boolean> => {
    const ref = getSiteAdminDataRef()
    return ref.get().then((snapshot) => {
        const data = snapshot.data() as any
        return data.admins && data.admins.includes(userId)
    })
}
