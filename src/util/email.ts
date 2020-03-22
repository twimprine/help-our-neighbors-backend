import { getListingConfirmationEmailTemplate, getReplyToOfferConfirmationEmailTemplate } from "./emailTemplates"

export const HELPFUL_NEIGHBOURS_EMAIL = "info@helpfulneighbours.com.au"

export const sendOfferConfirmationEmail = async (mailgun: any, fromEmail: string, senderName: string, recipientName: string) => {
    const formattedEmail = getReplyToOfferConfirmationEmailTemplate(senderName, recipientName)
    var data = {
        from: `Helpful Neighbours <${HELPFUL_NEIGHBOURS_EMAIL}>`,
        to: fromEmail,
        subject: 'Offer to Help Confirmation',
        html: formattedEmail
    }
    return await mailgun.messages().send(data);
}

export const sendListingConfirmationEmail = async (mailgun: any, email: string, name: string, secretToken: string) => {
    const formattedEmail = getListingConfirmationEmailTemplate(name, secretToken)
    var data = {
        from: `Helpful Neighbours <${HELPFUL_NEIGHBOURS_EMAIL}>`,
        to: email,
        subject: 'Listing Confirmation',
        html: formattedEmail
    }
    return await mailgun.messages().send(data);
}

 