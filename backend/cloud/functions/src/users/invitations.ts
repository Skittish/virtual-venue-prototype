/* eslint-disable no-void */
import {v4 as uuidv4} from 'uuid';
import {getFirestoreEmailSignupInvitesRef, getFirestoreUserRef} from "../firestore/refs";
import {isUserVirtualVenueAdmin} from "../events/admin";
import * as admin from "firebase-admin";
import {EmailSignupInvitesDocument, StoredEmailInviteData, USER_ROLES} from "../firestore/types";
import {sendEmailSignUpInvites} from "../email/invitations";
import {fetchFirestoreUser} from "../firestore/users";

/*

allow admin to enter a list of invited email addresses
when this list is updated, get all email addresses that haven't already been invited
for each email, generate a unique token
then send an email invite with the token included in the sign up url
store in db that this email has a url already generated
when the user signs up, they pass the token to the back-end, if the token is already used, it's ignored
store that the token has been used, create the user

 */

export const fetchEmailSignUpInvites = (): Promise<EmailSignupInvitesDocument | null> => {

    const ref = getFirestoreEmailSignupInvitesRef()
    return ref.get().then(snapshot => snapshot.data() ?? null)

}

export const fetchEmailSignUpInvite = async (code: string): Promise<StoredEmailInviteData | null> => {

    const {invites = {}} = await fetchEmailSignUpInvites() ?? {}

    if (!invites) return null

    return invites[code] ?? null

}

export const getExistingEmailInvitationCodes = async (): Promise<StoredEmailInviteData[]> => {

    const data = await fetchEmailSignUpInvites() ?? {}

    const {
        invites = {},
    } = data

    return Object.values(invites)

}

export const getAlreadyInvitedEmails = (invitationCodes: StoredEmailInviteData[]): string[] => {
    return invitationCodes.map(({email}) => email)
}

export const generateInvitationCode = () => {
    return uuidv4()
}

export const generateEmailInvitation = (email: string): StoredEmailInviteData => {
    return {
        email,
        code: generateInvitationCode(),
        created: Date.now(),
        expires: '2_weeks',
    }
}

export const generateEmailInvitationCodes = async (emails: string[]) => {

    const existingInvitationCodes = await getExistingEmailInvitationCodes()
    const alreadyInvitedEmails = getAlreadyInvitedEmails(existingInvitationCodes)
    const emailsWithoutInvitations = emails.filter(email => !alreadyInvitedEmails.includes(email))

    const newInvitations: Record<string, StoredEmailInviteData> = {}

    emailsWithoutInvitations.forEach((email) => {
        const invite = generateEmailInvitation(email)
        newInvitations[invite.code] = invite
    })

    const ref = getFirestoreEmailSignupInvitesRef()

    if (Object.entries(newInvitations).length === 0) {
        return
    }

    return ref.set({
        invites: newInvitations,
    }, {
        merge: true,
    })

}

export const handleGenerateEmailInvitationCodes = async (req: any, res: any) => {

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    const {
        emails,
    } = req.body as {
        emails: string[],
    }

    const isAdmin = await isUserVirtualVenueAdmin(userId)

    if (!isAdmin) {
        return res.status(403).send({
            code: 'admin_only',
        })
    }

    await generateEmailInvitationCodes(emails)

    return res.send({
        success: true,
    })

}

export const deleteInvitation = async (inviteCode: string) => {

    const ref = getFirestoreEmailSignupInvitesRef()

    return ref.update({
        [`invites.${inviteCode}`]: admin.firestore.FieldValue.delete(),
    })

}

export const handleDeleteInvitation = async (req: any, res: any) => {

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    const {
        inviteCode,
    } = req.body as {
        inviteCode: string,
    }

    const isAdmin = await isUserVirtualVenueAdmin(userId)

    if (!isAdmin) {
        return res.status(403).send({
            code: 'admin_only',
        })
    }

    await deleteInvitation(inviteCode)

    return res.send({
        success: true,
    })

}

export const sendEmailInvitations = async (invites: StoredEmailInviteData[]) => {

    const ref = getFirestoreEmailSignupInvitesRef()

    const update: Record<string, any> = {}

    invites.forEach(invite => {
        update[`invites.${invite.code}.emailSent`] = true
        update[`invites.${invite.code}.emailSentTimestamp`] = Date.now()
    })

    void ref.update(update)

    await sendEmailSignUpInvites(invites)

}

export const sendInvitation = async (inviteCode: string) => {

    const {
        invites = {},
    } = await fetchEmailSignUpInvites() ?? {}

    const invite = invites[inviteCode]

    if (!invite) {
        throw new Error(`No invite found for ${inviteCode}`)
    }

    if (invite.emailSent) {
        // already sent email
        return
    }

    return sendEmailInvitations([invite])

}

export const handleSendInvitation = async (req: any, res: any) => {

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    const {
        inviteCode,
    } = req.body as {
        inviteCode: string,
    }

    const isAdmin = await isUserVirtualVenueAdmin(userId)

    if (!isAdmin) {
        return res.status(403).send({
            code: 'admin_only',
        })
    }

    await sendInvitation(inviteCode)

    return res.send({
        success: true,
    })

}

export const sendAllPendingInvites = async () => {

    const existingInvitationCodes = await getExistingEmailInvitationCodes()

    const pendingInvitations = existingInvitationCodes.filter(invite => {
        return !invite.emailSent
    })

    return sendEmailInvitations(pendingInvitations)

}

export const handleSendAllPendingInvites = async (req: any, res: any) => {

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    const isAdmin = await isUserVirtualVenueAdmin(userId)

    if (!isAdmin) {
        return res.status(403).send({
            code: 'admin_only',
        })
    }

    await sendAllPendingInvites()

    return res.send({
        success: true,
    })

}

export const redeemInvitationCode = async (code: string, userId: string) => {

    const ref = getFirestoreEmailSignupInvitesRef()

    await ref.update({
        [`invites.${code}.redeemedBy`]: userId,
        [`invites.${code}.redeemedTimestamp`]: Date.now(),
    })

    const userRef = getFirestoreUserRef(userId)

    return userRef.set({
        roles: {
            [USER_ROLES.createEvents]: true,
        },
        // @ts-ignore
        redeemedTokens: admin.firestore.FieldValue.arrayUnion(code),
    }, {
        merge: true,
    })

}

export const attemptToRedeemInvitationCode = async (code: string, userId: string) => {

    const invitation = await fetchEmailSignUpInvite(code)

    if (!invitation) {
        throw new Error(`No invitation found for code ${code}`)
    }

    if (!!invitation.redeemedBy) {
        return {
            success: false,
            reason: 'code_already_redeemed',
        }
    }

    const user = await fetchFirestoreUser(userId) ?? {}

    const {
        roles = {},
    } = user

    if (roles[USER_ROLES.createEvents]) {
        return {
            success: true,
            reason: 'already_has_permission',
        }
    }

    await redeemInvitationCode(code, userId)

    return {
        success: true,
        reason: 'code_redeemed',
    }

}

export const handleRedeemInvitationCode = async (req: any, res: any) => {

    const {
        user_id: userId,
    } = req.user as {
        user_id: string,
    }

    const {
        inviteCode,
    } = req.body as {
        inviteCode: string,
    }

    const response = await attemptToRedeemInvitationCode(inviteCode, userId)

    return res.send(response)

}
