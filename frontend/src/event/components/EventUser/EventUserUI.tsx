import React, {memo, useEffect} from "react";
import {Box, Html} from "@react-three/drei";
import {usePlayerState, useUserData} from "./context";
import {useProxy} from "valtio";
import {GiBirdTwitter, GiSpeaker, MdSignalCellularConnectedNoInternet0Bar} from "react-icons/all";
import {animated, useSpring} from "react-spring";
import styled, {css, keyframes} from "styled-components";
import {useIsConnected} from "../../../state/connections";
import {FaMicrophoneSlash, FaVolumeMute} from "react-icons/fa";
import {
    hifiApi,
    useIsHifiConnected,
    useIsHifiConnecting,
    useIsUserConnectedInSpace
} from "../../audio/EventHifiAudioHandler";
import {THEME} from "../../../ui/theme";
import {useUserReaction} from "../EventGlobalReactionsHandler";
import {useHtmlRoot} from "../../../state/misc";
import {UserBadgeUI, UserBadgeUIWrapper} from "./UserBadge";

const cssOffline = css`
  opacity: 0.5;
`

const StyledNameContainer = styled.div<{
    online: boolean,
}>`
  position: relative;
  transition: opacity 300ms ease;
  text-shadow: 0px 1px 2px rgb(0 0 0 / 19%);
  ${props => !props.online ? cssOffline : ''};
`;

const StyledName = styled.div<{
    notConnected?: boolean,
}>`
  font-size: 1.25rem;
  font-weight: 800;
  display: flex;
  justify-content: center;
  white-space: nowrap;
  align-items: center;

  > svg {
    margin-left: ${THEME.spacing.$1}px;
  }

`;

const StyledVolumeIndicator = styled.div`
  position: absolute;
  left: 100%;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 5px;

  svg {
    display: block;
  }

`;

const keyframesReactionExit = keyframes`

  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }

`

const keyframesReaction = keyframes`

  0% {
    opacity: 0;
    transform: scale(0)
  }

  75% {
    opacity: 1;
    transform: scale(1.5);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }

`

const StyledReactionIndicator = styled.div`
  position: absolute;
  right: 100%;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 5px;
  animation: ${keyframesReaction} 500ms ease forwards, ${keyframesReactionExit} 1000ms 2500ms ease forwards;
`;

const normalize = (value: number, max: number, min: number) => {
    if (value > max) {
        value = max
    } else if (value < min) {
        value = min
    }
    return (value - min) / (max - min)
}

export const useHifiVolumeListener = (userId: string, enabled: boolean, set: any) => {

    useEffect(() => {
        if (!enabled) return
        const interval = setInterval(() => {
            const volume = hifiApi.playersData[userId]?.volume ?? -50
            const normalized = normalize(volume, 0, -50)
            set({
                opacity: normalized
            })
        }, 100)
        return () => {
            clearInterval(interval)
        }
    }, [enabled, userId])

}

export const useUserVolumeIndicator = () => {
    const playerState = usePlayerState()
    const volume = useProxy(playerState).volume
    const adjustedVolume = Math.round(volume * 1000) / 100
    const min = 0.05
    const max = 1 + min
    let scaledVolume = adjustedVolume < min ? min : adjustedVolume < 0.25 ? 0.25 : adjustedVolume > max ? max : adjustedVolume
    scaledVolume -= min
    return scaledVolume
}

export const UserVolumeIndicator: React.FC<{
    userId: string,
    active: boolean,
}> = ({userId, active}) => {
    const [styles, set] = useSpring(() => ({opacity: 0,}))
    useHifiVolumeListener(userId, active, set)
    return (
        <animated.div style={styles}>
            <GiSpeaker size={20}/>
        </animated.div>
    )
}

const StyledContainer = styled.div`
  position: relative;
`

const EventUserUI: React.FC<{
    userId: string,
    self?: boolean,
    showBadge?: boolean,
}> = ({userId, self = false, showBadge = false}) => {

    const userData = useUserData()
    const name = userData.name ?? 'anonymous'
    const hifiConnected = useIsHifiConnected()
    const hifiConnecting = useIsHifiConnecting()
    const connectedInSpace = useIsUserConnectedInSpace(userId)
    const connected = !hifiConnecting && (self || connectedInSpace)

    const micMuted = userData.micMuted ?? false
    const volumeMuted = userData.volumeMuted ?? false
    const userReaction = useUserReaction(userId)

    return (
        <>
            <UserBadgeUIWrapper name={name} userId={userId} showBadge={showBadge}/>
            <Html center position={[0, 0, 3]}>
                <StyledNameContainer online={connected}>
                    {
                        userReaction && (
                            <StyledReactionIndicator key={userReaction.key}>
                                {userReaction.reaction}
                            </StyledReactionIndicator>
                        )
                    }
                    <StyledName notConnected={!connected}>
                        <span>
                            {name}
                        </span>
                        {
                            !connected && (
                                <MdSignalCellularConnectedNoInternet0Bar size={15}/>
                            )
                        }
                        {
                            micMuted && (
                                <FaMicrophoneSlash size={15}/>
                            )
                        }
                        {
                            volumeMuted && (
                                <FaVolumeMute size={15}/>
                            )
                        }
                    </StyledName>
                    <StyledVolumeIndicator>
                        <UserVolumeIndicator userId={userId} active={hifiConnected}/>
                    </StyledVolumeIndicator>
                </StyledNameContainer>
            </Html>
        </>
    );
};

export default memo(EventUserUI);
