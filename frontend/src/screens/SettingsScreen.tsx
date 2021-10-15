import React, {useEffect, useMemo, useRef, useState} from "react"
import AuthWrapper from "../event/components/AuthWrapper";
import {StyledAvatar} from "./landing/LandingScreen";
import styled from "styled-components";
import {THEME} from "../ui/theme";
import { StyledHeading } from "../ui/typography/headings";
import {cssResetButton, StyledSmallRoundButton} from "../ui/buttons";
import {StyledInput} from "../ui/inputs";
import {updateUserBadgeAvatar, updateUserBadgeInfo} from "../firebase/users";
import {getCurrentUserId, useCurrentUserId} from "../state/auth";
import {getDatabaseRef, getUserBadgeInfoRef, getUserImagesStorageRef} from "../firebase/refs";
import AuthRequiredWrapper from "../components/AuthRequiredWrapper";
import {FaImage} from "react-icons/all";
import Upload from "rc-upload";
import {UploadProps} from "rc-upload/lib/interface";
import { Link } from "react-router-dom";

const StyledContent = styled.div`
  background-color: ${THEME.colors.shade};
  padding: ${THEME.spacing.$5}px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  border-radius: ${THEME.radii.$3}px;
  margin-top: ${THEME.spacing.$5}px;
`

const StyledHeader = styled.header`
  text-align: center;
`

const StyledMain = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: ${THEME.spacing.$2}px;
  margin-top: ${THEME.spacing.$3}px;
  margin-bottom: ${THEME.spacing.$2}px;
`

const StyledBottom = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const StyledInputWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: ${THEME.spacing.$1}px;
`

const StyledInputLabelWrapper = styled.div`
  min-width: 50px;
  
  label {
    padding-top: 10px;
    display: block;
  }
  
`

const StyledName = styled(StyledInputWrapper)`
  margin-top: ${THEME.spacing.$1b}px;
  margin-bottom: ${THEME.spacing.$1}px;
`

const StyledTextarea = styled(StyledInput).attrs({
    as: 'textarea'
})`
  padding: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  height: 120px;
  resize: none;
`

const StyledFooter = styled.div`
  font-size: 0.9rem;
  text-align: center;
  color: white;
  margin-top: ${THEME.spacing.$2}px;
  
  a {
    opacity: 0.5;
    color: inherit;
    text-decoration: underline;
    
    &:hover, &:focus {
      opacity: 1;
    }
    
  }
  
`

const useUserBadgeInfo = (userId: string) => {
    const [loading, setLoading] = useState(true)
    const [info, setInfo] = useState<null | {
        avatar?: string,
        name?: string,
        bio?: string,
    }>(null)

    useEffect(() => {
        const ref = getUserBadgeInfoRef(userId)
        ref.on('value', snapshot => {
            const data = snapshot.val()
            setInfo(data)
            setLoading(false)
        })
        return () => {
            ref.off('value')
        }
    }, [])

    return {
        loading,
        avatar: info?.avatar ?? '',
        name: info?.name ?? '',
        bio:  info?.bio ?? '',
    }

}

const StyledAvatarButton = styled(StyledAvatar)`
  ${cssResetButton};
  position: relative;
`

const StyledAvatarButtonIcon = styled.div<{
    forcedVisible?: boolean,
}>`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  opacity: ${props => props.forcedVisible ? 1 : 0};

  .rc-upload:hover &,
  .rc-upload:focus &,
  button:hover &,
  button:focus & {
    opacity: 1;
  }
  
`

const maxSizeInBytes = 2097152

export const UserDetailsForm: React.FC = () => {

    const userId = useCurrentUserId()
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    const unsavedChangesRef = useRef(unsavedChanges)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        unsavedChangesRef.current = unsavedChanges
    }, [unsavedChanges])

    const {
        loading,
        avatar,
        name: storedName,
        bio: storedBio,
    } = useUserBadgeInfo(userId)

    useEffect(() => {
        if (unsavedChangesRef.current) return
        setName(storedName)
    }, [storedName])

    useEffect(() => {
        if (unsavedChangesRef.current) return
        setBio(storedBio)
    }, [storedBio])

    const handleSubmit = () => {
        if (updating) return
        setUpdating(true)
        updateUserBadgeInfo(name, bio)
            .then(() => {
                setUnsavedChanges(false)
            })
            .finally(() => {
                setUpdating(false)
            })
    }

    const [uploadingImage, setUploadingImage] = useState(false)

    const uploadProps = useMemo<UploadProps>(() => (
        {
            accept: "image/*",
            beforeUpload: (file, fileList) => {
                if (file.size > maxSizeInBytes) {
                    return false
                }
                return true
            },
            customRequest: async ({file}) => {
                setUploadingImage(true)
                const ref = getUserImagesStorageRef(getCurrentUserId())
                const key = getDatabaseRef().push().key ?? ''
                ref.child(key).put(file as Blob).then(async (response) => {
                    const downloadUrl = await response.ref.getDownloadURL()
                    updateUserBadgeAvatar(downloadUrl)
                })
                    .finally(() => {
                        setUploadingImage(false)
                    })
            }
        }
    ), [])

    return (
        <form onSubmit={(event: any) => {
            event.preventDefault()
            handleSubmit()
        }}>
            <StyledHeader>
                <StyledHeading>
                    Your details
                </StyledHeading>
            </StyledHeader>
            {
                loading ? (
                    <div>
                        Loading...
                    </div>
                ) : (
                    <StyledMain>
                        <div>
                            <StyledAvatarButton as={Upload} {...uploadProps}>
                                {
                                    avatar && (
                                        <img src={avatar} alt="User avatar" />
                                    )
                                }
                                <StyledAvatarButtonIcon forcedVisible={!avatar}>
                                    <FaImage size={18}/>
                                </StyledAvatarButtonIcon>
                            </StyledAvatarButton>
                        </div>
                        <div>
                            <StyledName>
                                <StyledInputLabelWrapper>
                                    <label htmlFor="name">
                                        Name
                                    </label>
                                </StyledInputLabelWrapper>
                                <div>
                                    <StyledInput value={name} onChange={event => {
                                        setName(event.target.value.slice(0, 40))
                                        setUnsavedChanges(true)
                                    }} maxLength={50} id="name" slim type="text" smallerFont />
                                </div>
                            </StyledName>
                            <StyledInputWrapper>
                                <StyledInputLabelWrapper>
                                    <label htmlFor="bio">
                                        Bio
                                    </label>
                                </StyledInputLabelWrapper>
                                <StyledTextarea value={bio} onChange={(event: any) => {
                                    setBio(event.target.value.slice(0, 160))
                                    setUnsavedChanges(true)
                                }} maxLength={160} as="textarea" id="bio" slim smallerFont />
                            </StyledInputWrapper>
                        </div>
                    </StyledMain>
                )
            }
            {
                unsavedChanges && (
                    <StyledBottom>
                        <StyledSmallRoundButton type="submit">
                            {
                                updating ? "Updating..." : "Update details"
                            }
                        </StyledSmallRoundButton>
                    </StyledBottom>
                )
            }
        </form>
    )

}

const Content: React.FC = () => {

    return (
        <div>
            <StyledContent>
                <UserDetailsForm/>
            </StyledContent>
            <StyledFooter>
                <Link to="/">Return to dashboard</Link>
            </StyledFooter>
        </div>
    )
}

export const SettingsScreen: React.FC = () => {
    return (
        <AuthWrapper>
            <AuthRequiredWrapper>
                <Content/>
            </AuthRequiredWrapper>
        </AuthWrapper>
    )
}
