import {SnapshotInterpolation} from "@geckos.io/snapshot-interpolation";
// import {BufferSchema, float32, int64, Model, string16} from "@geckos.io/typed-array-buffer-schema";

// const stateScheme = BufferSchema.schema('state', {
//     id: string16,
//     x: float32,
//     y: float32,
//     a: float32,
// })

// const mainSchema = BufferSchema.schema('main', {
//     id: string16,
//     state: [stateScheme],
//     time: int64,
// })

// const mainModel = new Model(mainSchema)

export const compressDataSnapshot = (data: any) => {
    // return new Buffer(mainModel.toBuffer(data))
}

function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset)
}

export const decompressDataSnapshot = (buffer: any) => {
    return ''
    // return mainModel.fromBuffer(buffer.buffer)
}

export const userSnapshots: Record<string, {
    lastUpdate: number,
    snapshots: SnapshotInterpolation,
}> = {}

export const addUserSnapshot = (id: string, snapshot: any) => {
    if (!userSnapshots[id]) {
        const si = new SnapshotInterpolation()
        si.vault.setMaxSize(4)
        userSnapshots[id] = {
            lastUpdate: Date.now(),
            snapshots: si,
        }
    } else {
        userSnapshots[id].lastUpdate = Date.now()
    }
    userSnapshots[id].snapshots.snapshot.add(snapshot)
}

export const userHasRecentSnapshot = (id: string) => {
    return (userSnapshots[id] && userSnapshots[id].lastUpdate > Date.now() - 500)
}

export type UserSnapshot = {
    x: number,
    y: number,
    a: number,
}

export const getUserSnapshot = (id: string): UserSnapshot | null => {
    const user = userSnapshots[id]
    if (!user) return null
    const snapshot = user.snapshots.calcInterpolation('x y a(rad)')
    if (!snapshot) return null
    if (snapshot.state[0]) {
        return snapshot.state[0] as unknown as UserSnapshot
    }
    return null
}
