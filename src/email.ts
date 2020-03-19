'use strict'

import bunyan from 'bunyan'
import Mailgun from 'mailgun-js'
import { getItem, storeItem } from "./util/dynamodb"
import { getEmailTemplate } from "./util/emailTemplate"

const MAIL_GUN_API_KEY = process.env.MAIL_GUN_API_KEY ||  ""
const DOMAIN = process.env.DOMAIN || ""
const EMAIL_DDB_TABLE = process.env.EMAIL_DDB_TABLE || ''
const LISTING_DDB_TABLE = process.env.LISTING_DDB_TABLE || ''
const HELPFUL_NEIGHBOURS_EMAIL = "info@helpfulneighbours.com.au"

const logger = bunyan.createLogger({name: "email-lambda"})

// Needed for CORS with Proxy-lambda integration
const corsHeaders = {
    "Access-Control-Allow-Origin": "*"
}

interface EmailPostData {
    listingId: string,
    fromEmail: string,
    name?: string,
    message: string,
}

export const handler = async (event: any) => {
    logger.info({event}, "Email lambda event");

    const body = JSON.parse(event.body) as EmailPostData

    if (!body.fromEmail || !body.listingId || !body.message) {
        return {
            statusCode: 400,
            body: JSON.stringify({error: "Missing fields"}),
            headers: corsHeaders
        };
    }

    const listing = await getItem(LISTING_DDB_TABLE, body.listingId, logger)
    logger.info({listing}, "Retrieved Listing");
    if (!listing) {
        return {
            statusCode: 404,
            body: JSON.stringify({"message": `No listing found for listingId: ${body.listingId}`}),
            headers: corsHeaders
        };
    };
    
    const mailgun = new Mailgun({
        apiKey: MAIL_GUN_API_KEY,
        domain: DOMAIN
    });
    logger.info({mailgun}, `Mailgun initialized. Sending email to: ${listing.email}`);

    const formattedEmail = getEmailTemplate(body.name, listing.name, body.message, body.fromEmail)

    var data = {
        from: `Helpful Neighbours <${HELPFUL_NEIGHBOURS_EMAIL}>`,
        to: listing.email,
        subject: 'Helpful Neighbours',
        html: formattedEmail
    }

    try {
        const mailgunResponse = await mailgun.messages().send(data);
        logger.info({response: mailgunResponse}, "Mailgun response");

        const emailEvent = {
            listingId: body.listingId,
            to_email: listing.email,
            from_email: body.fromEmail,
            message: body.message,
            name: body.name ? body.name : "",
            timestamp: new Date().getTime(),
            mailgun_id: mailgunResponse.id,
            mailgun_message: mailgunResponse.message,
        }
        // Save email event in DynamoDB
        await storeItem(EMAIL_DDB_TABLE, emailEvent, logger)

        return {
            statusCode: 200,
            body: JSON.stringify(emailEvent),
            headers: corsHeaders
        };
    } catch (error) {
        logger.error({error}, `Error sending email to: ${listing.email}`);
        return {
            statusCode: 500,
            body: JSON.stringify({error}),
            headers: corsHeaders
        };
    }
}