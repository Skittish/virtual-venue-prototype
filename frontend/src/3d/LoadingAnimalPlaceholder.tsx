import {Box, Html} from "@react-three/drei"
import React from "react"
import styled from "styled-components";
import {BoxBufferGeometry, MeshBasicMaterial} from "three";

const StyledText = styled.div`
  white-space: nowrap;
  font-weight: 800;
`

const geom = new BoxBufferGeometry()
const material = new MeshBasicMaterial({
    color: '#112d19',
})

const LoadingAnimalPlaceholder: React.FC<{
    animal: string,
    showText: boolean,
}> = ({animal, showText}) => {
    return (
        <>
            {
                showText && (
                    <Html center>
                        <StyledText>
                            loading {animal} model...
                        </StyledText>
                    </Html>
                )
            }
            <mesh geometry={geom} material={material}/>
        </>
    )
}

export default LoadingAnimalPlaceholder
