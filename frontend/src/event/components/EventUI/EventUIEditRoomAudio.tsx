import React, {useEffect, useRef, useState} from "react"
import styled from "styled-components";
import {THEME} from "../../../ui/theme";
import {uiProxy} from "../../../state/ui";
import {getHifiBaseState} from "../../audio/hifiAudio";
import {useCurrentRoomId} from "../../../state/event/users";
import {getRoomConfigAudioData, useRoom} from "../../../state/event/rooms";
import {setRoomConfigAudio} from "../../../firebase/rooms";

const StyledContainer = styled.div`
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: ${THEME.zIndices.$10};
`

const Inner: React.FC<{
    roomId: string,
}> = ({roomId}) => {


    const currentRoom = useRoom(roomId)

    const [initialState] = useState(getHifiBaseState(1, false))
    const [userAttenuation, setUserAttenuation] = useState(initialState.userAttenuation)
    const [userRolloff, setUserRolloff] = useState(initialState.userRolloff)

    const roomAudioConfig = currentRoom ? getRoomConfigAudioData(currentRoom) : undefined

    const roomUserAttenuation = roomAudioConfig ? roomAudioConfig.userAttenuation : undefined
    const roomUserRolloff = roomAudioConfig ? roomAudioConfig.userRolloff : undefined

    const reset = () => {
        setUserAttenuation(initialState.userAttenuation)
        setUserRolloff(initialState.userRolloff)
    }

    useEffect(() => {
        if (roomUserAttenuation != undefined) {
            setUserAttenuation(roomUserAttenuation)
        }
    }, [roomUserAttenuation])

    useEffect(() => {
        if (roomUserRolloff != undefined) {
            setUserRolloff(roomUserRolloff)
        }
    }, [roomUserRolloff])

    const firstRender = useRef(true)

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false
            return
        }
        setRoomConfigAudio(userAttenuation, userRolloff)
    }, [userAttenuation, userRolloff])

    return (
        <StyledContainer>
            <div>
                <label htmlFor="userAttenuation">
                    User Attenuation
                </label>
                <input value={userAttenuation} onChange={(event) => {
                    const value = parseFloat(event.target.value)
                    if (isNaN(value)) return
                    setUserAttenuation(value as number)
                }} id="userAttenuation" placeholder="User Attenuation" type="number" step="any"/>
            </div>
            <div>
                <label htmlFor="userRolloff">
                    User Rolloff
                </label>
                <input value={userRolloff} onChange={(event) => {
                    const value = parseFloat(event.target.value)
                    if (isNaN(value)) return
                    setUserRolloff(value as number)
                }} id="userRolloff" placeholder="User Rolloff" type="number" step="any"/>
            </div>
            <div>
                <button onClick={reset}>Reset to default</button>
            </div>
            <div>
                <button onClick={() => {
                    uiProxy.editRoomAudio = false
                }}>Close</button>
            </div>
        </StyledContainer>
    )
}

export const EventUIEditRoomAudio: React.FC = () => {

    const currentRoomId = useCurrentRoomId()

    return <Inner key={currentRoomId} roomId={currentRoomId}/>
}