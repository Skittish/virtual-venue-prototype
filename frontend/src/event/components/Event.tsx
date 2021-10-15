import { Stats } from "@react-three/drei"
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';
import React, {useEffect, useLayoutEffect, useMemo, useRef} from "react"
import { Canvas } from "react-three-fiber"
import styled from "styled-components";
import EventUsers from "./EventUsers";
import CurrentUser from "./CurrentUser/CurrentUser";
import Scenery from "./Scenery";
import Camera from "../../3d/Camera";
import EngineWrapper from "./EngineWrapper";
import InputsHandler from "../../gameplay/inputs/InputsHandler";
import EventUI from "./EventUI/EventUI";
import AudioHandler from "../../gameplay/audio/AudioHandler";
import {useEventHifiSpaceId, useEventInitialData, useHasJoined, useIsEventCreator} from "../../state/event/event";
import JoinView from "../views/JoinView";
import ReactDOM from "react-dom";
import {embeddedVideoProxy} from "../../state/event/embeddedVideo";
import {ref, useProxy} from "valtio";
import EventScenery from "./EventScenery";
import EditingMode from "./EditingMode/EditingMode";
import {miscProxy} from "../../state/misc";
import {uiProxy} from "../../state/ui";
import EventMeta from "./EventMeta";
import SceneAudioHandler from "../../gameplay/audio/SceneAudioHandler";
import {useCurrentSessionIsActiveSession} from "../../state/event/users";
import {EventHifiAudioHandler, EventHifiAudioScript } from "../audio/EventHifiAudioHandler";
import {useAssetsLoader} from "./EventUI/AssetManager/AssetManager";
import {clearSelectedAssets, useIsEditMode} from "../../state/editing";
import {getCurrentUserId} from "../../state/auth";
import { EventCSSCanvas } from "./EventCSSCanvas";
import {PlayerUpdatesHandler} from "./CurrentUser/PlayerUpdatesHandler";
import { EventChannelHandler } from "./EventChannelHandler";
import { EventGlobalChannelHandler } from "./EventGlobalChannelHandler";
import {isDebug} from "../../utils/params";
import {EventListeners} from "./EventListeners";
import {setUserOffline} from "../../firebase/event";
import {setEventUserChangingAnimal} from "../../firebase/event/user";

// @ts-ignore
const ResizeObserver = window.ResizeObserver || Polyfill;

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`

const StyledContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  > div > div {
    pointer-events: none;
  }
  
`

const StyledCSSContainer = styled.div`
  pointer-events: auto !important;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //z-index: 99999999;
`

const StyledHTMLContainer = styled.div``

const useDetermineWhetherToShowAnimalSelector = () => {

    const initialData = useEventInitialData()

    useEffect(() => {
        if (!initialData) return
        if (!(initialData.users ?? {})[getCurrentUserId()]) {
            uiProxy.changingAnimal = true
            setEventUserChangingAnimal(getCurrentUserId())
        } else {
            setEventUserChangingAnimal(getCurrentUserId(), false)
        }
    }, [initialData])

}

const Event: React.FC = () => {

    useDetermineWhetherToShowAnimalSelector()
    const hasJoined = useHasJoined()
    const cssRootRef = useRef<HTMLDivElement>(null)
    const htmlRootRef = useRef<HTMLDivElement>(null)
    const showDebug = useProxy(uiProxy).showDebug
    useLayoutEffect(() => {
        uiProxy.showDebug = isDebug()
        embeddedVideoProxy.cssRootRef = ref(cssRootRef)
        miscProxy.htmlRootRef = ref(htmlRootRef)
    }, [])

    const isActive = useCurrentSessionIsActiveSession()
    useAssetsLoader()
    const isEditing = useIsEditMode()

    const {
        onPointerMissed,
    } = useMemo(() => ({
        onPointerMissed: () => {
            if (isEditing) {
                clearSelectedAssets()
            }
        }
    }), [isEditing])

    useEffect(() => {
        return () => {
            // todo - reset other event data
            setUserOffline()
        }
    }, [])

    return (
        <StyledWrapper>
            {
                isActive && hasJoined && (
                    <>
                        <PlayerUpdatesHandler>
                            {/*<ConnectionsHandler/>*/}
                            <EventHifiAudioHandler/>
                        </PlayerUpdatesHandler>
                        <EventChannelHandler/>
                        <EventGlobalChannelHandler/>
                        <EventListeners/>
                    </>
                )
            }
            <EventHifiAudioScript/>
            <StyledContainer>
                <StyledCSSContainer ref={cssRootRef}>
                    <EventCSSCanvas/>
                </StyledCSSContainer>
                <Canvas concurrent resize={{ polyfill: ResizeObserver }} pixelRatio={1}
                        shadowMap gl={{antialias: true}} onPointerMissed={onPointerMissed}
                        onCreated={state => {
                            state.gl.setClearColor("rgb(95, 149, 181)")
                            // state.gl.shadowMap.type = PCFShadowMap
                        }}>
                    {
                        isActive && hasJoined && (
                            <InputsHandler/>
                        )
                    }
                    <EngineWrapper>
                        <SceneAudioHandler/>
                        <Scenery/>
                        <Camera/>
                        <CurrentUser/>
                        <EventUsers/>
                        <EventScenery/>
                        {
                            showDebug && (
                                <Stats />
                            )
                        }
                        <EditingMode/>
                    </EngineWrapper>
                </Canvas>
            </StyledContainer>
            <StyledHTMLContainer ref={htmlRootRef}/>
            <EventUI/>
            <EventMeta/>
        </StyledWrapper>
    )
}

export default Event
