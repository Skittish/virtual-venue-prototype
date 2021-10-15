import {StoredEmailInviteData} from "../firestore/types";
import * as sgMail from "@sendgrid/mail"
import {getEnvVariable, isStagingEnv} from "../utils/env";

sgMail.setApiKey(getEnvVariable('sendgrid.api_key'))

const siteUrl = isStagingEnv() ? `https://stage.example.com` : `https://prod.example.com`

export const sendEmailSignUpInvites = (invites: StoredEmailInviteData[]) => {

    const messages = invites.map(invite => {

        const inviteUrl = `${siteUrl}/signup?c=${invite.code}`

        return {
            to: invite.email,
            from: 'hi@example.com',
            templateId: '',
            dynamicTemplateData: {
                signup_url: `${inviteUrl}`,
            },
        }
    })

    return sgMail
        .send(messages)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })

}
