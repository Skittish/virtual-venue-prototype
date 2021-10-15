import React, { Suspense } from "react"
import Lights from "../../3d/Lights";
import Floor from "../../3d/Floor";
import { Environment, PositionalAudio } from "@react-three/drei";
import Gates from "../../3d/Gates";
import Dividers from "../../3d/Dividers";
import Zone1 from "../../3d/Zone1";
import Zone2 from "../../3d/Zone2";
import SceneryAsset from "../../3d/scenery/SceneryAsset";

const Scenery: React.FC = () => {
    return (
        <>
            <Lights/>
            {/*<Gates/>*/}
            {/*<Dividers/>*/}
            {/*<Zone1/>*/}
            {/*<Zone2/>*/}
            <Suspense fallback={null}>
                <Floor/>
            </Suspense>
        </>
    )
}

export default Scenery