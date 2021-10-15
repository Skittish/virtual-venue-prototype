import React, {useCallback, useEffect, useRef, useState} from "react"
import queryString from 'query-string'
import Script from 'react-load-script'
import {getEventId, useEventHifiSpaceId} from "../../state/event/event";
import {getEventHifiJwt} from "../../firebase/events";
import {useAudioStream, useIsMicMuted, useIsMuted} from "../../state/audio";
import {useMicMuteHandler} from "../../gameplay/audio/AudioHandler";
import {proxy, ref, useProxy} from "valtio";
import {getHifiApiDataBaseState} from "./hifiAudio";
import {ErrorBoundary} from "../../components/ErrorBoundary";
import {channelStateProxy, useCurrentChannelHifiSpace} from "../components/EventChannelHandler";
import {useIsPlayerInsideAnyStage} from "../../state/collisions";
import {MathUtils} from "three";
import * as Sentry from "@sentry/react";
import {setHasConnectionError, setHasNonPrimaryConnectionError} from "../../state/ui";
import {getConnectedChannelRef, setChannelConnected} from "../../firebase/event";
import {getCurrentUserId, useCurrentUserId} from "../../state/auth";
import {useUsersList} from "../../state/event/users";
import {useIsEventAudioDisabled} from "../components/EventDataWrapper.context";

const radToDeg = MathUtils.radToDeg;

declare var HighFidelityAudio: any

export const hifiApi: {
    updatePlayerPosition?: (x: number, z: number, angle: number) => void,
    playersData: {
        [key: string]: {
            volume: number,
        }
    }
} = {
    updatePlayerPosition: undefined,
    playersData: {},
}

export const hifiProxy = proxy<{
    globalSpaceConnections: Record<string, boolean>,
    spaceConnections: Record<string, boolean>,
    channelConnections: Record<string, boolean>,
    connecting: boolean,
    connected: boolean,
    loadedScript: boolean,
    hifiCommunicator: any,
    spaceUserConnections: Record<string, Record<string, boolean>>,
}>({
    globalSpaceConnections: {},
    spaceConnections: {},
    channelConnections: {},
    connecting: false,
    connected: false,
    loadedScript: false,
    hifiCommunicator: null,
    spaceUserConnections: {},
})

export const setLocalStateChannelConnected = (channelId: string, connected: boolean) => {

    hifiProxy.channelConnections[channelId] = connected

}

export const setHifiConnecting = (connecting: boolean) => {
    hifiProxy.connecting = connecting
}

export const useIsHifiConnecting = () => {
    return useProxy(hifiProxy).connecting
}

export const useIsUserConnectedInSpace = (userId: string) => {
    const spaceId = useCurrentChannelHifiSpace()
    const spaceUserConnections = useProxy(hifiProxy).spaceUserConnections
    const connections = spaceUserConnections[spaceId] ?? {}
    return connections[userId] ?? false
}

export const setSpaceUserConnected = (spaceId: string, userId: string, connected: boolean) => {
    if (!hifiProxy.spaceUserConnections[spaceId]) {
        hifiProxy.spaceUserConnections[spaceId] = {}
    }
    hifiProxy.spaceUserConnections[spaceId][userId] = connected
}

export const useIsHifiSpaceConnected = (spaceId: string) => {
    const spaceConnections = useProxy(hifiProxy).spaceConnections
    return spaceConnections[spaceId] ?? false
}

export const useIsChannelConnected = (channelId: string) => {
    const channelConnections = useProxy(hifiProxy).channelConnections
    return channelConnections[channelId] ?? false
}

export const setHifiSpaceConnected = (spaceId: string, connected: boolean) => {
    hifiProxy.spaceConnections[spaceId] = connected
}

export const setGlobalHifiSpaceConnected = (spaceId: string, connected: boolean) => {
    hifiProxy.globalSpaceConnections[spaceId] = connected
}

export const useGlobalSpaceConnections = () => {
    return useProxy(hifiProxy.globalSpaceConnections)
}

export const deleteGlobalHifiSpaceConnectedData = (spaceId: string) => {
    delete hifiProxy.globalSpaceConnections[spaceId]
}

export const useIsCurrentChannelHifiSpaceConnected = () => {
    const currentChannelSpaceId = useCurrentChannelHifiSpace()
    return useIsHifiSpaceConnected(currentChannelSpaceId)
}

export const useHifiCommunicator = () => {
    return useProxy(hifiProxy).hifiCommunicator
}

export const useIsHifiConnected = () => {
    return useProxy(hifiProxy).connected
}

export const EventHifiAudioScript: React.FC = () => {
    return <Script
        url="https://hifi-spatial-audio-api.s3-us-west-2.amazonaws.com/releases/latest/HighFidelityAudio-latest.js"
        onLoad={() => hifiProxy.loadedScript = true}/>
}

type HifiUserData = {
    providedUserID: string,
}

enum HifiConnectionState {
    Connected = 'Connected',
    Disconnected = 'Disconnected',
    Failed = 'Failed',
    Unavailable = 'Unavailable',
}

const customConnectionRetryConfig = {
    autoRetryInitialConnection: true,
    autoRetryOnDisconnect: true
}

export const HifiConnection: React.FC<{
    channelId: string,
    isPrimaryConnection?: boolean,
    spaceId: string,
    micEnabled?: boolean,
    childCommunicator?: any,
    defaultApiState?: any,
    isGlobalChannel?: boolean,
    forceRetry?: () => void,
}> = ({
          channelId,
          spaceId,
          micEnabled = true,
          isPrimaryConnection = false,
          childCommunicator,
          isGlobalChannel = false,
          defaultApiState,
            forceRetry
      }) => {


    const isMicMuted = useIsMicMuted()
    const muted = useIsMuted()

    const sourceAudioStream = useAudioStream()

    const [audioStream, setAudioStream] = useState<MediaStream | null>(null)

    useEffect(() => {
        if (sourceAudioStream) {
            setAudioStream(sourceAudioStream.clone())
        }
    }, [sourceAudioStream])

    const [jwt, setJwt] = useState('')
    const [audio] = useState(() => new Audio())
    const loaded = useProxy(hifiProxy).loadedScript
    const [communicator, setCommunicator] = useState<any>(null)
    const [connected, setConnected] = useState(false)
    const [connectionError, setConnectionError] = useState(false)
    const unmountedRef = useRef(false)

    useEffect(() => {

        if (isPrimaryConnection) {
            setHasConnectionError(connectionError)
        } else {
            setHasNonPrimaryConnectionError(connectionError)
        }

    }, [connectionError])

    const onConnectionChangedRef = useRef((state: HifiConnectionState) => {
        console.log(`Hifi connection state: ${state}`)
        if (state === HifiConnectionState.Connected) {
            setConnected(true)
            setConnectionError(false)
            if (isPrimaryConnection) {
                setHifiConnecting(false)
            }
        } else {
            if (state === HifiConnectionState.Failed || state === HifiConnectionState.Unavailable || state === HifiConnectionState.Disconnected) {
                Sentry.captureMessage(`Hifi connection state: ${state}.`)
                setConnected(false)
                setConnectionError(true)
            } else {
                setConnectionError(false)
            }
        }
    })

    useEffect(() => {
        if (isPrimaryConnection) {
            setHifiConnecting(true)
        }
        return () => {
            setChannelConnected(channelId, false, isGlobalChannel)
            setHifiSpaceConnected(spaceId, false)
            setLocalStateChannelConnected(channelId, false)
            if (isPrimaryConnection) {
                setHifiConnecting(false)
            }
            unmountedRef.current = true
            onConnectionChangedRef.current = () => {
            }
            if (isGlobalChannel) {
                deleteGlobalHifiSpaceConnectedData(channelId)
                setGlobalHifiSpaceConnected(channelId, false)
            }
        }
    }, [])

    useEffect(() => {
        setHifiSpaceConnected(spaceId, connected)
        setChannelConnected(channelId, connected, isGlobalChannel)
        setLocalStateChannelConnected(channelId, connected)
        if (isGlobalChannel) {
            setGlobalHifiSpaceConnected(channelId, connected)
        }
        if (connected) {

            const ref = getConnectedChannelRef(channelId, isGlobalChannel)

            ref.onDisconnect().update({
                [`users/${getCurrentUserId()}/connected`]: false,
            })

            return () => {
                ref.off()
            }
        }
    }, [spaceId, connected])

    const inputMuted = isMicMuted || !micEnabled

    useEffect(() => {
        if (!communicator) return
        communicator.setInputAudioMuted(inputMuted)
    }, [communicator, inputMuted])

    useEffect(() => {
        audio.volume = muted ? 0 : 1
    }, [audio, muted])

    useEffect(() => {
        if (!spaceId) return
        const get = async () => {
            const hifiJwt = await getEventHifiJwt(getEventId(), spaceId)
            if (!unmountedRef.current) {
                setJwt(hifiJwt.jwt)
            }
        }
        get()
    }, [spaceId])

    useEffect(() => {
        if (!jwt) return
        if (!loaded) return

        const initialHiFiAudioAPIData = new HighFidelityAudio.HiFiAudioAPIData({
            ...(defaultApiState ?? getHifiApiDataBaseState()),
            position: new HighFidelityAudio.Point3D({"x": 0, "y": 0, "z": 0}), // todo - get player original position
        });

        const hifiCommunicatorParams: any = {
            initialHiFiAudioAPIData: initialHiFiAudioAPIData,
            onConnectionStateChanged: (state: HifiConnectionState) => {
                onConnectionChangedRef.current(state)
            },
            connectionRetryAndTimeoutConfig: customConnectionRetryConfig,
        }

        if (isPrimaryConnection) {
            hifiCommunicatorParams['onUsersDisconnected'] = (disconnectedUsers: HifiUserData[]) => {
                disconnectedUsers.forEach(({providedUserID}) => {
                    setSpaceUserConnected(spaceId, providedUserID, false)
                })
            }
        }

        // Set up our `HiFiCommunicator` object, supplying our media stream and initial user data.
        const hifiCommunicator = new HighFidelityAudio.HiFiCommunicator(hifiCommunicatorParams);

        if (isPrimaryConnection) {
            hifiProxy.hifiCommunicator = ref(hifiCommunicator)
        }

        let unmounted = false

        let retryCount = 0

        const handleRetry = () => {
            if (retryCount >= 5) {
                console.log('Reached maximum retry attempts for hifi connectToHiFiAudioAPIServer')
                setConnectionError(true)
            } else {
                Sentry.captureMessage(`Retrying hifi connectToHiFiAudioAPIServer`)
                retryCount += 1
                connect()
            }
        }

        const connect = async () => {
            try {
                await hifiCommunicator.connectToHiFiAudioAPIServer(jwt, "api-pro.highfidelity.com")
            } catch (error) {
                console.log('Hifi connectToHiFiAudioAPIServer error')
                console.error(error)
                Sentry.captureMessage('Hifi connectToHiFiAudioAPIServer error')
                Sentry.captureException(error);
                handleRetry()
            }
            if (unmounted) return
            setCommunicator(hifiCommunicator)
        }

        try {
            connect()
        } catch (error) {
            Sentry.captureMessage('Hifi connectToHiFiAudioAPIServer error')
            Sentry.captureException(error);
            console.warn('connect error caught')
            console.error(error)
            handleRetry()
        }

        return () => {
            unmounted = true
            hifiCommunicator.onUsersDisconnected = () => {
            }
            hifiCommunicator.onConnectionStateChanged = () => {
            }
        }

    }, [audio, jwt, loaded])

    useEffect(() => {
        const hifiCommunicator = communicator
        if (!hifiCommunicator) return

        if (isPrimaryConnection) {
            hifiProxy.connected = true
        }

        if (isPrimaryConnection) {
            const newUserDataSubscription = new HighFidelityAudio.UserDataSubscription({
                "providedUserID": null,
                "components": [HighFidelityAudio.AvailableUserDataSubscriptionComponents.VolumeDecibels],
                "callback": (receivedHiFiAudioAPIDataArray: {
                    volumeDecibels: number,
                    providedUserID: string,
                }[]) => {
                    receivedHiFiAudioAPIDataArray.forEach(({providedUserID, volumeDecibels}) => {
                        setSpaceUserConnected(spaceId, providedUserID, true)
                        if (!hifiApi.playersData[providedUserID]) {
                            hifiApi.playersData[providedUserID] = {
                                volume: volumeDecibels,
                            }
                        } else {
                            hifiApi.playersData[providedUserID].volume = volumeDecibels
                        }
                    })
                }
            });

            hifiCommunicator.addUserDataSubscription(newUserDataSubscription);
        }

        audio.srcObject = hifiCommunicator.getOutputAudioMediaStream();
        audio.play()

        if (isPrimaryConnection) {
            hifiApi.updatePlayerPosition = (x: number, z: number, angleInDegrees: number) => {
                try {
                    const data = new HighFidelityAudio.HiFiAudioAPIData({
                        ...getHifiApiDataBaseState(),
                        position: new HighFidelityAudio.Point3D({"x": x / 10, "y": 0, "z": z / 10}),
                    });
                    hifiCommunicator.updateUserDataAndTransmit(data)
                } catch (error) {
                    console.error(error)
                }
            }
        }

        return () => {
            hifiCommunicator.disconnectFromHiFiAudioAPIServer();
            if (isPrimaryConnection) {
                hifiProxy.connected = false
                hifiProxy.hifiCommunicator = null
                hifiApi.updatePlayerPosition = undefined
                hifiApi.playersData = {}
            }
        }

    }, [communicator])

    useEffect(() => {
        if (!communicator || !audioStream) return
        communicator.setInputAudioMediaStream(audioStream);
    }, [communicator, audioStream])

    if (communicator && childCommunicator) {
        const Child = childCommunicator
        return <Child communicator={communicator}/>
    }

    return null

}

const EventHifiConnection: React.FC<{
    channelId: string,
    spaceId: string,
    forceRetry: () => void,
}> = ({spaceId, channelId, forceRetry}) => {

    const insideStage = useIsPlayerInsideAnyStage()

    return <HifiConnection channelId={channelId} micEnabled={!insideStage} spaceId={spaceId} isPrimaryConnection/>

}

const RetryAttempter: React.FC<{
    onMount: () => void,
}> = ({onMount}) => {

    useEffect(() => {
        onMount()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return null
}

/*

Added this hacky retry behaviour because the hifi api seems to be occasionally throwing errors
and right now I don't have time to investigate and make things more stable.
But this is definitely supposed to be temporary.

 */

const EventHifiConnectionWrapper: React.FC<{
    channelId: string,
    spaceId: string,
}> = ({channelId, spaceId}) => {

    const [retryCount, setRetryCount] = useState(0)
    const retry = useCallback(() => {
        if (retryCount < 5) {
            setRetryCount(count => count + 1)
        }
    }, [retryCount, setRetryCount])

    const forceRetry = useCallback(() => {

        setRetryCount(count => {
            if (count < 5) {
                return count + 1
            }
            return count
        })

    }, [setRetryCount])

    useEffect(() => {

        if (retryCount >= 5) {
            // todo - show error message to the user...
        }

    }, [retryCount])

    return (
        <ErrorBoundary fallback={<RetryAttempter onMount={retry}/>} key={retryCount.toString()}>
            <EventHifiConnection forceRetry={forceRetry} channelId={channelId} spaceId={spaceId} key={retryCount.toString()}/>
        </ErrorBoundary>
    )
}

export const useDoesCurrentRoomContainOtherUsers = () => {
    const activeUsers = useUsersList()
    return activeUsers.length >= 1
}

const shouldForceConnect = () => {
    const parsed = queryString.parse(window.location.search);
    return !!parsed['forceConnect'] ?? false
}

export const EventHifiAudioHandler: React.FC = () => {

    useMicMuteHandler()

    const {
        channelId,
    } = useProxy(channelStateProxy)
    const currentChannelSpaceId = useCurrentChannelHifiSpace()
    const containsOtherUsers = useDoesCurrentRoomContainOtherUsers()
    const [forceConnect] = useState(() => shouldForceConnect())

    const isAudioDisabled = useIsEventAudioDisabled()

    if (isAudioDisabled) return null

    if (!containsOtherUsers && !forceConnect) return null

    if (!currentChannelSpaceId) return null

    return (
        <EventHifiConnectionWrapper channelId={channelId} spaceId={currentChannelSpaceId} key={currentChannelSpaceId}/>
    )
}
