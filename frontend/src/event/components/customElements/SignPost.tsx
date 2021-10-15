import { Box, Html } from "@react-three/drei"
import React, {Suspense, useCallback, useEffect, useMemo, useRef, useState} from "react"
import { Text } from "troika-three-text";
import {extend, useLoader } from "react-three-fiber";
import {Box3, FontLoader, Object3D} from "three";
import {SpecialAssetProps} from "./RoomPortal";
import {THEME} from "../../../ui/theme";
import styled from "styled-components";
import {useHtmlRoot} from "../../../state/misc";
import {useIsEditMode} from "../../../state/editing";
import {useSceneryInstance} from "../../../state/event/rooms";
import { StyledSmallRoundButton } from "../../../ui/buttons";
import {setEditingSignPost, setSignPostMessage} from "../../../state/ui";
import ReactDOM from "react-dom";
import Modal from "../../../components/Modal";

extend({ Text });

const woodColor = '#695c53'
const textColor = '#151212'
const paperColor = '#eee0d1'

const options = {
    font: "https://fonts.gstatic.com/s/raleway/v22/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVtzpbCIPrcVIT9d0c8.woff",
    fontSize: 3.5,
    color: textColor,
    maxWidth: 50,
    lineHeight: 1,
    letterSpacing: 0,
    textAlign: "center",
    materialType: "MeshBasicMaterial",
}

const StyledWrapper = styled.div`
  padding: 8px;
`

const StyledContainer = styled.div`
  min-width: 300px;
  max-width: 400px;
  background-color: ${THEME.colors.shade};
  border-radius: 4px;
  border: 2px solid rgb(76, 129, 56);
  color: white;
  padding: 16px;
  font-size: 0.95rem;
`

const StyledShowPromptWrapper = styled.div`
  padding: 8px;
  white-space: nowrap;
`

const SignPostMessage: React.FC<{
    message: string,
    setMessageHovered: (hovered: boolean) => void,
}> = ({message, setMessageHovered}) => {

    const [showMessage, setShowMessage] = useState(false)

    useEffect(() => {
        return () => {
            setMessageHovered(false)
        }
    }, [])

    return (
        <StyledWrapper onPointerOver={() => {
            setMessageHovered(true)
        }} onPointerOut={() => {
            setMessageHovered(false)
        }}>
            <StyledShowPromptWrapper>
                <StyledSmallRoundButton onClick={() => {
                    setSignPostMessage(message)
                }}>
                    Read message
                </StyledSmallRoundButton>
            </StyledShowPromptWrapper>
        </StyledWrapper>
    )

}

export const SignPost: React.FC<SpecialAssetProps> = ({uid, temporary}) => {

    const asset = useSceneryInstance(uid)

    const {
        label = '...',
        message = ''
    } = asset ?? {}

    const editMode = useIsEditMode()

    const [hovered, setHovered] = useState(false)
    const [messageHovered, setMessageHovered] = useState(false)

    const [layout, setLayout] = useState({
        width: 3.5,
        height: 2,
    })

    const {
        onPointerOver,
        onPointerOut,
    } = useMemo(() => ({
        onPointerOver: () => {
            setHovered(true)
        },
        onPointerOut: () => {
            setHovered(false)
        },
    }), [])

    const htmlRef = useHtmlRoot()
    const textRef = useRef<any>(null!)

    useEffect(() => {
        textRef.current.addEventListener('synccomplete', () => {

            const {_textRenderInfo = {}} = textRef.current

            const {
                visibleBounds
            } = _textRenderInfo

            if (visibleBounds) {
                const [left, top, right, bottom] = visibleBounds
                const width = Math.abs(right) + Math.abs(left)
                const height = Math.abs(top) + Math.abs(bottom)
                setLayout({
                    width: 1 + (width / 3),
                    height: 0.75 + (height / 3),
                })
            }

        })
    }, [])

    return (
        <>
            <group onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
                <group position={[0, 0, 2]}>
                    <Box args={[layout.width, 0.25, layout.height]} castShadow>
                        <meshBasicMaterial color={woodColor} />
                    </Box>
                    <Box position={[0, -0.1, 0.1]} args={[layout.width - 0.5, 0.25, layout.height - 0.25]}>
                        <meshBasicMaterial color={paperColor} />
                    </Box>
                </group>
                <Box args={[0.25, 0.25, 2]} position={[0, 0.002, 1]} castShadow>
                    <meshBasicMaterial color={woodColor} />
                </Box>
                <group rotation={[Math.PI / 2, 0, 0]} scale={[0.3, 0.3, 0.3]} position={[0, -0.26, 2.125]}>
                    {/*@ts-ignore*/}
                    <text {...options} anchorX="center"
                          anchorY="middle" text={label} ref={textRef}/>
                </group>
                {
                    (message && !editMode && (hovered || messageHovered)) && (
                        <Html portal={htmlRef} center>
                            <SignPostMessage key={message} message={message} setMessageHovered={setMessageHovered}/>
                        </Html>
                    )
                }
                {
                    (editMode && !temporary) && (
                        <Html portal={htmlRef} center>
                            <StyledSmallRoundButton noBreak onClick={() => {
                                setEditingSignPost(uid)
                            }}>
                                Edit text
                            </StyledSmallRoundButton>
                        </Html>
                    )
                }
            </group>
        </>
    )
}
