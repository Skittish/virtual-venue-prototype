import RoomPortal from "../../event/components/customElements/RoomPortal";
import VideoScreen from "../../event/components/customElements/VideoScreen";
import {Material} from "three";
import {MATERIALS} from "../materials";
import {Stage} from "../../event/components/customElements/Stage";
import {ChannelZone} from "../../event/components/customElements/ChannelZone";
import {createNewChannelAndAddToSceneryInstance} from "../../firebase/rooms";
import {SignPost} from "../../event/components/customElements/SignPost";

export type SpecialAssetData = {
    key: string,
    name: string,
    components: any[],
    onCreated?: (id: string) => void,
}

export const SPECIAL_ASSETS: {
    [key: string]: SpecialAssetData
} = {
    _room: {
        key: '_room',
        name: 'Room Portal',
        components: [RoomPortal],
    },
    _videoScreen: {
        key: '_videoScreen',
        name: 'Video Screen',
        components: [VideoScreen],
    },
    _stage: {
        key: '_stage',
        name: 'Stage',
        components: [Stage],
    },
    _channelZone: {
        key: '_channelZone',
        name: 'Channel Zone',
        components: [ChannelZone],
        onCreated: (id: string) => {
            createNewChannelAndAddToSceneryInstance(id)
        }
    },
    _signPost: {
        key: '_signPost',
        name: 'Sign Post',
        components: [SignPost],
    },
}

export const SCENERY_ASSETS: {
    [key: string]: {
        key: string,
        name: string,
        model: string,
        materials: {
            [key: string]: Material,
        }
    }
} = {
    tree: {
        key: 'tree',
        name: 'Tree',
        model: '/models/scenery/tree_default_fall.glb',
        materials: {
            leafsFall: MATERIALS.green,
            woodBirch: MATERIALS.brown,
        }
    },
    rock: {
        key: 'rock',
        name: 'Rock',
        model: '/models/scenery/stone_tallJ.glb',
        materials: {
            stone: MATERIALS.stone,
        }
    },
}
