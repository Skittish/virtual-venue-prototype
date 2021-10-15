import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {audioState, setAudioStream, useAudioState} from "../../../state/audio";
import {useProxy} from "valtio";
import {useEventHasLoaded, useHasJoined} from "../../../state/event/event";
import {FaCog, FaMicrophone, FaMicrophoneSlash, FaPaintBrush, FaPause, FaVolumeMute, FaVolumeUp} from "react-icons/fa";
import { StyledRoundButton } from "../../../ui/buttons";
import Modal from "../../../components/Modal";
import EventUISettingsModal, {useIsAdmin} from "./EventUISettingsModal";
import {
    setCreatingNewRoom, setEditAccessSettings, setEditingSignPost,
    uiProxy,
    useEditingRoomPortal, useHasConnectionError,
    useIsCreatingNewRoom,
    useIsEditingAccessSettings
} from "../../../state/ui";
import EventUIAnimalSelector from "./EventUIAnimalSelector";
import EventUIScenery from "./EventUIScenery";
import EditRoomPortalView from "../../views/EditRoomPortalView";
import EventVideoUIHandler from "../EventVideo/EventVideoUIHandler";
import EventUIDebugStats from "./EventUIDebugStats";
import EventUIEditingRoomsModal from "./EventUIEditingRoomsModal";
import {useCurrentSessionIsActiveSession} from "../../../state/event/users";
import EventUIDisconnectedModal from "./EventUIDisconnectedModal";
import EventUICreateRoomModal from "./EventUICreateRoomModal";
import EventUIMicSettingsModal from "./EventUIMicSettingsModal";
import {AssetManager} from "./AssetManager/AssetManager";
import {THEME} from "../../../ui/theme";
import { EventUIEditRoomAudio } from "./EventUIEditRoomAudio";
import {useCanEditEvent, useEventIsClosed} from "../../../state/event/sessionData";
import {EventClosedBanner} from "./EventClosedBanner";
import {EventUsersModal} from "./EventUsersModal";
import {ChannelUI} from "./ChannelUI";
import {EventUIEditAccessSettings} from "./AccessSettings/EventUIEditAccessSettings";
import {UserAlerts} from "./UserAlerts";
import {ChatUI} from "./ChatUI";
import {UserMenu} from "./UserMenu";
import {EditSignPostModal} from "./EditSignPostModal";
import {SignPostMessageModal} from "./SignPostMessageModal";

const StyledContainer = styled.div`
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    z-index: ${THEME.zIndices.$10};
`;

const StyledList = styled.ul`
  display: flex;
  align-items: center;
  
  > li {
    
    &:not(:first-child) {
      margin-left: 5px;
    }
    
  }
  
`

export const useEnableMic = () => {
    const [busy, setBusy] = useState(false)
    const unmountedRef = useRef(false)

    useEffect(() => {
        return () => {
            unmountedRef.current = true
        }
    }, [])

    const enableMic = async (deviceId: string = '') => {
        audioState.muted = false

        if (busy || unmountedRef.current) return
        setBusy(true)

        const existingStream = useAudioState.getState().audioStream

        if (existingStream) {
            existingStream.getTracks().forEach(track => {
                track.stop()
            })
            setAudioStream(null)
        }


        let targetDeviceId = deviceId

        if (!targetDeviceId) {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices()
                const audioDevice = devices.find((device) => device.kind === 'audioinput')
                if (audioDevice) {
                    targetDeviceId = audioDevice.deviceId
                }
            } catch (error) {

            }
        }

        navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
                deviceId: targetDeviceId ? {
                    exact: targetDeviceId,
                } : '',
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
            },
        }).then((data) => {
            setAudioStream(data)
            audioState.micMuted = false
            audioState.micGranted = true
        }).catch((error: any) => {
            console.error(error)
            audioState.micRejected = true
        })
            .finally(() => {
                if (!unmountedRef.current) {
                    setBusy(false)
                }
            })

    }
    return enableMic
}

const EventUI: React.FC = () => {

    const isAdmin = useIsAdmin()
    const canEdit = useCanEditEvent()
    const {settingsOpen, changingAnimal} = useProxy(uiProxy)
    const loaded = useEventHasLoaded()
    const joined = useHasJoined()
    const muted = useProxy(audioState).muted
    const micMuted = useProxy(audioState).micMuted

    const {
        editMode,
        showDebug,
        editingRooms,
        editRoomAudio,
        showMicSettings,
        showUsers,
        editingSignPost,
    } = useProxy(uiProxy)

    const editingRoomPortal = useEditingRoomPortal()
    const eventIsClosed = useEventIsClosed()

    const toggleAudio = () => {
        audioState.muted = !audioState.muted
    }

    const toggleMic = () => {
        audioState.micMuted = !audioState.micMuted
    }

    const toggleEditMode = () => {
        uiProxy.editMode = !uiProxy.editMode
    }

    const isActive = useCurrentSessionIsActiveSession()
    const creatingRoom = useIsCreatingNewRoom()
    const editingAccessSettings = useIsEditingAccessSettings()

    if (!loaded || !joined) return null

    return (
        <>
            <UserAlerts/>
            {
                eventIsClosed && (
                    <EventClosedBanner/>
                )
            }
            <StyledContainer>
                <StyledList>
                    {
                        canEdit && (
                            <li>
                                <StyledRoundButton alert={editMode} onClick={toggleEditMode}>
                                    <FaPaintBrush size={14}/>
                                </StyledRoundButton>
                            </li>
                        )
                    }
                    <li>
                        <StyledRoundButton alert={micMuted} onClick={toggleMic}>
                            {micMuted ? (
                                <FaMicrophoneSlash size={16}/>
                            ) : (
                                <FaMicrophone size={16}/>
                            )}
                        </StyledRoundButton>
                    </li>
                    <li>
                        <StyledRoundButton alert={muted} onClick={toggleAudio}>
                            {muted ? (
                                <FaVolumeMute size={16}/>
                            ) : (
                                <FaVolumeUp size={16}/>
                            )}
                        </StyledRoundButton>
                    </li>
                    {
                        isAdmin && (
                            <li>
                                <StyledRoundButton onClick={() => uiProxy.settingsOpen = true}>
                                    <FaCog size={16}/>
                                </StyledRoundButton>
                            </li>
                        )
                    }
                    <li>
                        <UserMenu/>
                    </li>
                </StyledList>
            </StyledContainer>
            <ChannelUI/>
            <ChatUI/>
            <Modal isOpen={settingsOpen} onRequestClose={() => uiProxy.settingsOpen = false} background thinner>
                <EventUISettingsModal onClose={() => uiProxy.settingsOpen = false}/>
            </Modal>
            {
                editRoomAudio && (
                    <EventUIEditRoomAudio/>
                )
            }
            <Modal isOpen={showUsers} onRequestClose={() => uiProxy.showUsers = false}>
                <EventUsersModal onClose={() => uiProxy.showUsers = false}/>
            </Modal>
            <Modal isOpen={editingRooms} onRequestClose={() => uiProxy.editingRooms = false}>
                <EventUIEditingRoomsModal onClose={() => uiProxy.editingRooms = false}/>
            </Modal>
            <Modal isOpen={showMicSettings} onRequestClose={() => uiProxy.showMicSettings = false} background>
                <EventUIMicSettingsModal onClose={() => uiProxy.showMicSettings = false}/>
            </Modal>
            {
                changingAnimal && (
                    <EventUIAnimalSelector onClose={() => uiProxy.changingAnimal = false}/>
                )
            }
            <Modal isOpen={!!editingRoomPortal} onRequestClose={() => uiProxy.editingRoomPortal = ''}>
                <EditRoomPortalView uid={editingRoomPortal}/>
            </Modal>
            <Modal isOpen={!!editingSignPost} onRequestClose={() => {
                setEditingSignPost('')
            }}>
                <EditSignPostModal id={editingSignPost}/>
            </Modal>
            <Modal isOpen={creatingRoom} onRequestClose={() => setCreatingNewRoom(false)}>
                <EventUICreateRoomModal onClose={() => setCreatingNewRoom(false)}/>
            </Modal>
            <Modal isOpen={editingAccessSettings} onRequestClose={() => setEditAccessSettings(false)}>
                <EventUIEditAccessSettings onClose={() => setEditAccessSettings(false)}/>
            </Modal>
            <SignPostMessageModal/>
            {
                !isActive && (
                    <Modal isOpen>
                        <EventUIDisconnectedModal/>
                    </Modal>
                )
            }
            <EventVideoUIHandler/>
            {/*{*/}
            {/*    showDebug && (*/}
            {/*        <EventUIDebugStats/>*/}
            {/*    )*/}
            {/*}*/}
            {
                (editMode && canEdit) && (
                    <AssetManager/>
                )
            }
        </>
    );
};

export default EventUI;
