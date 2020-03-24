'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan_1 = __importDefault(require("bunyan"));
const mailgun_js_1 = __importDefault(require("mailgun-js"));
const dynamodb_1 = require("./util/dynamodb");
const email_1 = require("./util/email");
const pagination_1 = require("./util/pagination");
const uuid_1 = require("uuid");
const LISTING_DDB_TABLE = process.env.LISTING_DDB_TABLE || '';
const MAIL_GUN_API_KEY = process.env.MAIL_GUN_API_KEY || "";
const DOMAIN = process.env.DOMAIN || "";
const logger = bunyan_1.default.createLogger({ name: "listing-lambda" });
// Needed for CORS with Proxy-lambda integration
const corsHeaders = {
    "Access-Control-Allow-Origin": "*"
};
const cleanListing = (listing) => {
    if (listing.email) {
        delete listing.email;
    }
    if (listing.address) {
        delete listing.address;
    }
    if (listing.secretToken) {
        delete listing.secretToken;
    }
    return listing;
};
const postListing = async (body) => {
    logger.info({ body }, "Creating Listing");
    const listingItem = Object.assign(Object.assign({}, body), { id: uuid_1.v4(), secretToken: uuid_1.v4(), timestamp: new Date().getTime() });
    await dynamodb_1.storeItem(LISTING_DDB_TABLE, listingItem, logger);
    logger.info({ listingItem }, "Created listing");
    // Send confirmation email
    try {
        const mailgun = new mailgun_js_1.default({
            apiKey: MAIL_GUN_API_KEY,
            domain: DOMAIN
        });
        logger.info({ mailgun }, `Mailgun initialized. Sending email to: ${listingItem.email}`);
        const mailgunResponse = await email_1.sendListingConfirmationEmail(mailgun, listingItem.id, listingItem.email, listingItem.name, listingItem.secretToken);
        logger.info({ mailgunResponse }, "Successfully sent confirmation email for listing creation");
    }
    catch (error) {
        logger.error({ error }, "Error sending confirmation email for listing creation");
    }
    return {
        statusCode: 201,
        body: JSON.stringify(listingItem),
        headers: corsHeaders
    };
};
const getListingsPaginated = async (event, listingType) => {
    const qs = event.queryStringParameters;
    const stateFilter = qs ? qs.state_filter : undefined;
    const nextToken = qs && qs.next_token ? pagination_1.parseNextToken(qs.next_token) : undefined;
    const data = await dynamodb_1.queryListingsByType(LISTING_DDB_TABLE, listingType, logger, stateFilter, nextToken);
    logger.info({ data }, "Queried listing by type");
    const items = data.Items;
    if (items) {
        // don't return emails and address for security reasons
        const cleanedItems = items.map((item) => { return cleanListing(item); });
        const paginatedResponse = {
            items: cleanedItems,
            nextToken: pagination_1.getNextToken(data.LastEvaluatedKey)
        };
        return {
            statusCode: 200,
            body: JSON.stringify(paginatedResponse),
            headers: corsHeaders
        };
    }
    else {
        return {
            statusCode: 500,
            body: JSON.stringify({ "error": "error fetching listings" }),
            headers: corsHeaders
        };
    }
};
const deleteListing = async (event) => {
    // Assert ID provided
    if (!event.pathParameters) {
        return {
            statusCode: 400,
            body: JSON.stringify({ "error": "no id to delete provided" }),
            headers: corsHeaders
        };
    }
    // Assert secret_token provided
    if (!event.queryStringParameters || !event.queryStringParameters.secret_token) {
        return {
            statusCode: 400,
            body: JSON.stringify({ "error": "no secret_token provided" }),
            headers: corsHeaders
        };
    }
    const secretToken = event.queryStringParameters.secret_token;
    const listingId = event.pathParameters.id;
    const listing = await dynamodb_1.getItem(LISTING_DDB_TABLE, listingId, logger);
    logger.info({ listing }, "Retrieved Listing");
    if (!listing) {
        return {
            statusCode: 404,
            body: JSON.stringify({ "message": `No listing found for id: ${listingId}` }),
            headers: corsHeaders
        };
    }
    ;
    if (listing.secretToken && listing.secretToken !== secretToken) {
        return {
            statusCode: 400,
            body: JSON.stringify({ "message": "Invalid secret_token value to delete listing" }),
            headers: corsHeaders
        };
    }
    ;
    await dynamodb_1.deleteItem(LISTING_DDB_TABLE, listingId);
    logger.info({ listing }, "Deleted Listing");
    const cleanedListing = cleanListing(listing);
    return {
        statusCode: 200,
        body: JSON.stringify(cleanedListing),
        headers: corsHeaders
    };
};
exports.handler = async (event) => {
    logger.info({ event }, "Listing lambda event");
    const httpMethod = event.httpMethod;
    switch (httpMethod) {
        case "GET":
            if (event.path === "/listings/offer") {
                return await getListingsPaginated(event, "offer");
            }
            if (event.path === "/listings/request") {
                return await getListingsPaginated(event, "request");
            }
            return {
                statusCode: 500,
                body: JSON.stringify({ "error": "method not supported" }),
                headers: corsHeaders
            };
        case "POST":
            const body = JSON.parse(event.body);
            return await postListing(body);
        case "DELETE":
            return await deleteListing(event);
        default:
            return {
                statusCode: 500,
                body: JSON.stringify({ "error": "method not supported" }),
                headers: corsHeaders
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9saXN0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7Ozs7QUFFWixvREFBMkI7QUFDM0IsNERBQWdDO0FBQ2hDLDhDQUFxRjtBQUNyRix3Q0FBMkQ7QUFDM0Qsa0RBQWdFO0FBQ2hFLCtCQUFvQztBQUVwQyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLElBQUksRUFBRSxDQUFBO0FBQzdELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSyxFQUFFLENBQUE7QUFDNUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFBO0FBRXZDLE1BQU0sTUFBTSxHQUFHLGdCQUFNLENBQUMsWUFBWSxDQUFDLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFDLENBQUMsQ0FBQTtBQWdENUQsZ0RBQWdEO0FBQ2hELE1BQU0sV0FBVyxHQUFHO0lBQ2hCLDZCQUE2QixFQUFFLEdBQUc7Q0FDckMsQ0FBQTtBQUVELE1BQU0sWUFBWSxHQUFHLENBQUMsT0FBZ0IsRUFBZSxFQUFFO0lBQ25ELElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUNmLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQTtLQUN2QjtJQUNELElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNqQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUE7S0FDekI7SUFDRCxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUU7UUFDckIsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFBO0tBQzdCO0lBQ0QsT0FBTyxPQUFPLENBQUE7QUFDbEIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLElBQXFCLEVBQUUsRUFBRTtJQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxF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