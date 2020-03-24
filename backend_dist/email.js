'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan_1 = __importDefault(require("bunyan"));
const mailgun_js_1 = __importDefault(require("mailgun-js"));
const dynamodb_1 = require("./util/dynamodb");
const email_1 = require("./util/email");
const emailTemplates_1 = require("./util/emailTemplates");
const MAIL_GUN_API_KEY = process.env.MAIL_GUN_API_KEY || "";
const DOMAIN = process.env.DOMAIN || "";
const EMAIL_DDB_TABLE = process.env.EMAIL_DDB_TABLE || '';
const LISTING_DDB_TABLE = process.env.LISTING_DDB_TABLE || '';
const logger = bunyan_1.default.createLogger({ name: "email-lambda" });
// Needed for CORS with Proxy-lambda integration
const corsHeaders = {
    "Access-Control-Allow-Origin": "*"
};
exports.handler = async (event) => {
    logger.info({ event }, "Email lambda event");
    const body = JSON.parse(event.body);
    if (!body.fromEmail || !body.listingId || !body.message) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing fields" }),
            headers: corsHeaders
        };
    }
    const listing = await dynamodb_1.getItem(LISTING_DDB_TABLE, body.listingId, logger);
    logger.info({ listing }, "Retrieved Listing");
    if (!listing) {
        return {
            statusCode: 404,
            body: JSON.stringify({ "message": `No listing found for listingId: ${body.listingId}` }),
            headers: corsHeaders
        };
    }
    ;
    const mailgun = new mailgun_js_1.default({
        apiKey: MAIL_GUN_API_KEY,
        domain: DOMAIN
    });
    logger.info({ mailgun }, `Mailgun initialized. Sending email to: ${listing.email}`);
    const formattedEmail = emailTemplates_1.getReplyToOfferEmailTemplate(body.name, listing.name, body.message, body.fromEmail);
    var data = {
        from: `Helpful Neighbours <${email_1.HELPFUL_NEIGHBOURS_EMAIL}>`,
        to: listing.email,
        subject: 'Helpful Neighbours',
        html: formattedEmail
    };
    try {
        const mailgunResponse = await mailgun.messages().send(data);
        logger.info({ response: mailgunResponse }, "Mailgun response");
        const emailEvent = {
            listingId: body.listingId,
            to_email: listing.email,
            from_email: body.fromEmail,
            message: body.message,
            name: body.name ? body.name : "",
            timestamp: new Date().getTime(),
            mailgun_id: mailgunResponse.id,
            mailgun_message: mailgunResponse.message,
        };
        // Save email event in DynamoDB
        await dynamodb_1.storeItem(EMAIL_DDB_TABLE, emailEvent, logger);
        // Send confirmation email. Fail silently     
        try {
            const confirmationResponse = await email_1.sendOfferConfirmationEmail(mailgun, body.fromEmail, body.name, listing.name);
            logger.info({ response: confirmationResponse }, "Mailgun response for confirmation email");
        }
        catch (err) {
            logger.error({ error: err }, "Failed to send confirmation email");
        }
        return {
            statusCode: 200,
            body: JSON.stringify(emailEvent),
            headers: corsHeaders
        };
    }
    catch (error) {
        logger.error({ error }, `Error sending email to: ${listing.email}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ error }),
            headers: corsHeaders
        };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1haWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW1haWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7OztBQUVaLG9EQUEyQjtBQUMzQiw0REFBZ0M7QUFDaEMsOENBQW9EO0FBQ3BELHdDQUFtRjtBQUNuRiwwREFBb0U7QUFFcEUsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFLLEVBQUUsQ0FBQTtBQUM1RCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUE7QUFDdkMsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLElBQUksRUFBRSxDQUFBO0FBQ3pELE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLENBQUE7QUFFN0QsTUFBTSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxZQUFZLENBQUMsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFDLENBQUMsQ0FBQTtBQUUxRCxnREFBZ0Q7QUFDaEQsTUFBTSxXQUFXLEdBQUc7SUFDaEIsNkJBQTZCLEVBQUUsR0FBRztDQUNyQyxDQUFBO0FBU1ksUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQVUsRUFBRSxFQUFFO0lBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0lBRTNDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBa0IsQ0FBQTtJQUVwRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ3JELE9BQU87WUFDSCxVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FB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