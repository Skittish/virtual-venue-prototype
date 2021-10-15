import styled from "styled-components";
import {THEME} from "../../../ui/theme";
import React, {useEffect, useState} from "react";
import {useHtmlRoot} from "../../../state/misc";
import {Html} from "@react-three/drei";
import Linkify from "react-linkify";
import {linkComponentDecorator} from "../EventUI/EventChatMessages";
import {getEventUserBadgeInfoRef, getUserBadgeInfoRef} from "../../../firebase/refs";
import {getEventId} from "../../../state/event/event";
import {DEFAULT_AVATAR_IMAGE} from "../../../data/config";

const StyledBadgeContainer = styled.div`
  width: 240px;
  padding: ${THEME.spacing.$1b}px;
  background-color: ${THEME.colors.shade};
  border-radius: 4px;
  border: 2px solid rgb(76, 129, 56);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`

const StyledBadgeContent = styled.div`
    display: grid;
    grid-template-rows: auto auto;
    grid-row-gap: ${THEME.spacing.$1b}px;
`

const StyledBadgeAvatar = styled.div<{
    image: string,
}>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgb(76, 129, 56);
  background-size: cover;
  background-position: center;
  background-image: url(${props => props.image ?? ''});
`

const StyledBadgeTop = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: ${THEME.spacing.$1b}px;
`

const StyledBadgeEventName = styled.div`
  margin-top: 8px;
  font-size: 0.9rem;
`

const StyledBadgeUserName = styled.div`
  margin-top: 4px;
`

const StyledBio = styled.div`
  font-size: 0.9rem;
  
  a {
    color: white;
  }
  
`

const storedUserBadgeInfo: Record<string, {
    lastUpdated: number,
    info: UserBadgeInfo,
}> = {}

const storeUserBadgeInfo = (userId: string, info: UserBadgeInfo) => {
    storedUserBadgeInfo[userId] = {
        lastUpdated: Date.now(),
        info,
    }
}

const fetchCachedUserBadgeInfo = (userId: string, requireFreshData: boolean = false) => {
    if (storedUserBadgeInfo[userId]) {
        if (requireFreshData && storedUserBadgeInfo[userId].lastUpdated < Date.now() - 30 * 1000) {
            // data is over 30 seconds old, dont return it
            return null
        }
        return storedUserBadgeInfo[userId].info
    }
    return null
}

const fetchEventUserBadgeInfo = (userId: string): Promise<UserBadgeInfo | null> => {
    const ref = getEventUserBadgeInfoRef(getEventId(), userId)
    return ref.once('value').then(snapshot => {
        return snapshot.val() ?? null
    })
}

const fetchUserDefaultBadgeInfo  = (userId: string): Promise<UserBadgeInfo | null> => {
    const ref = getUserBadgeInfoRef(userId)
    return ref.once('value').then(snapshot => {
        return snapshot.val() ?? null
    })
}

export const fetchUserBadgeInfo = async (userId: string): Promise<UserBadgeInfo | null> => {

    const freshCachedInfo = fetchCachedUserBadgeInfo(userId, true)

    if (freshCachedInfo) {
        return Promise.resolve(freshCachedInfo)
    }

    const eventBadgeInfo = await fetchEventUserBadgeInfo(userId)

    if (eventBadgeInfo) {
        storeUserBadgeInfo(userId, eventBadgeInfo)
        return Promise.resolve(eventBadgeInfo)
    }

    const defaultBadgeInfo = await fetchUserDefaultBadgeInfo(userId)

    if (defaultBadgeInfo) {
        storeUserBadgeInfo(userId, defaultBadgeInfo)
    }

    return defaultBadgeInfo
}

type UserBadgeInfo = {
    name: string,
    bio: string,
    avatar: string,
}

export const useUserBadgeInfo = (userId: string) => {

    const [loading, setLoading] = useState(true)
    const [info, setInfo] = useState<UserBadgeInfo | null>(() => fetchCachedUserBadgeInfo(userId))

    useEffect(() => {
        fetchUserBadgeInfo(userId)
            .then((badgeInfo) => {
                setInfo(badgeInfo)
                setLoading(false)
            })
            .catch((error) => {
                console.error(error)
                setLoading(false)
            })
    }, [])

    return {
        loaded: !!info,
        loading,
        name: info ? info.name : '',
        avatar: info ? info.avatar : DEFAULT_AVATAR_IMAGE,
        bio: info ? info.bio : '',
    }
}

const StyledHtml = styled.div`
  margin-top: 10px;
  position: relative;
  width: 240px;
`

export const UserBadgeUI: React.FC<{
    name: string,
    userId: string,
    setHovered: (hovered: boolean) => void,
}> = ({name, userId, setHovered}) => {
    const htmlRef = useHtmlRoot()
    const {
        loaded,
        loading,
        name: profileName,
        avatar,
        bio,
    } = useUserBadgeInfo(userId)
    return (
        <StyledHtml as={Html} center portal={htmlRef}>
            <StyledBadgeContainer onMouseEnter={() => {
                setHovered(true)
            }} onMouseLeave={() => setHovered(false)}>
                {
                    (loading && !loaded) ? (
                        <div>
                            loading badge for {name}
                        </div>
                    ) : (
                        <StyledBadgeContent>
                            <StyledBadgeTop>
                                <StyledBadgeAvatar image={avatar}/>
                                <div>
                                    <StyledBadgeEventName>
                                        {name}
                                    </StyledBadgeEventName>
                                    <StyledBadgeUserName>
                                        {profileName}
                                    </StyledBadgeUserName>
                                </div>
                            </StyledBadgeTop>
                            <StyledBio>
                                <Linkify componentDecorator={linkComponentDecorator}>
                                    {bio}
                                </Linkify>
                            </StyledBio>
                        </StyledBadgeContent>
                    )
                }
            </StyledBadgeContainer>
        </StyledHtml>
    )
}

export const UserBadgeUIWrapper: React.FC<{
    showBadge: boolean,
    name: string,
    userId: string,
}> = ({showBadge, name, userId}) => {
    const [hovered, setHovered] = useState(false)
    if (showBadge || hovered) {
        return <UserBadgeUI name={name} userId={userId} setHovered={setHovered}/>
    }
    return null
}
