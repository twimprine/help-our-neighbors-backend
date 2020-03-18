'use strict'

import bunyan from 'bunyan'
import Mailgun from 'mailgun-js'
import { storeItem } from "./util/dynamodb"

const MAIL_GUN_API_KEY = process.env.MAIL_GUN_API_KEY ||  ""
const DOMAIN = process.env.DOMAIN || ""
const EMAIL_DDB_TABLE = process.env.EMAIL_DDB_TABLE || ''

const logger = bunyan.createLogger({name: "email-lambda"})

export const handler = async (event: any) => {
    logger.info({event}, "Email lambda event");

    // Needed for CORS with Proxy-lambda integration
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*"
    }

    const body = JSON.parse(event.body)
    const toEmailAddress = body.toEmail
    const fromEmailAddress = body.fromEmail
    const message = body.message

    if (!toEmailAddress || !fromEmailAddress || !message) {
        return {
            statusCode: 400,
            body: JSON.stringify({error: "Missing fields"}),
            headers: corsHeaders
        };
    }
    
    const mailgun = new Mailgun({
        apiKey: MAIL_GUN_API_KEY,
        domain: DOMAIN
    });
    logger.info({mailgun}, `Mailgun initialized. Sending email to: ${toEmailAddress}`);

    var data = {
        from: `Helpful Neighbours <${fromEmailAddress}>`,
        to: toEmailAddress,
        subject: 'Helpful Neighbours',
        html: ""
    }

    try {
        const mailgunResponse = await mailgun.messages().send(data);
        logger.info({response: mailgunResponse}, "Mailgun response");

        const emailEvent = {
            to_email: toEmailAddress,
            from_email: fromEmailAddress,
            message,
            timestamp: new Date().getTime(),
            mailgun_id: mailgunResponse.id,
            mailgun_message: mailgunResponse.message,
        }

        // Save email event in DynamoDB
        await storeItem(EMAIL_DDB_TABLE, emailEvent, logger)

        return {
            statusCode: 200,
            body: JSON.stringify(mailgunResponse),
            headers: corsHeaders
        };
    } catch (error) {
        logger.error({error}, `Error sending email to: ${toEmailAddress}`);
        return {
            statusCode: 500,
            body: JSON.stringify({error}),
            headers: corsHeaders
        };
    }
}