export enum EVENT_QUOTA_CAPACITY {
    free = 'free',
}

export const DEFAULT_EVENT_QUOTA_CAPACITY = EVENT_QUOTA_CAPACITY.free

export const DEFAULT_CAPACITY = 300

export const quotaCapacities: Record<string, number> = {
    [EVENT_QUOTA_CAPACITY.free]: DEFAULT_CAPACITY,
}

export const getQuotaCapacity = (quota: string) => {
    const match = quotaCapacities[quota]
    return match ?? DEFAULT_CAPACITY
}
