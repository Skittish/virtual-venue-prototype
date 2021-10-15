export const getRequestUserId = (req: any) => {

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    return userId || ''

}
