export const COLLISION_FILTER_GROUPS = {
    player: 1 << 0,
    otherPlayers: 2 << 0,
}

export enum COLLISION_GROUP_TYPE {
    ROOM_PORTAL,
    STAGE,
    CHANNEL_ZONE,
    VIDEO_MAIN_AREA,
    OTHER_PLAYER,
}
