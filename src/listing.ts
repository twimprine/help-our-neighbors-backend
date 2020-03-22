'use strict'

import bunyan from 'bunyan'
import Mailgun from 'mailgun-js'
import { deleteItem, getItem, queryListingsByType, scanAllItems, storeItem } from "./util/dynamodb"
import { sendListingConfirmationEmail } from "./util/email"
import { getNextToken, parseNextToken } from "./util/pagination"
import { v4 as uuidv4 } from 'uuid';

const LISTING_DDB_TABLE = process.env.LISTING_DDB_TABLE || ''
const MAIL_GUN_API_KEY = process.env.MAIL_GUN_API_KEY ||  ""
const DOMAIN = process.env.DOMAIN || ""

const logger = bunyan.createLogger({name: "listing-lambda"})

type HttpMethod = "POST" | "GET" | "DELETE"

interface Listing {
    id: string,
    email: string,
    message: string,
    name: string,
    latitude: string,
    longitude: string,
    postcode: string,
    listingState: string,
    address: string,
    timestamp: number,
    listingType: string,
    secretToken: string,
}

interface ReadListing {
    id: string,
    message: string,
    name: string,
    latitude: string,
    longitude: string,
    postcode: string,
    listingState: string,
    timestamp: number,
    listingType: string,
}

interface PaginatedListings {
    items: ReadListing[],
    nextToken: string | null
}

interface ListingPostData {
    email: string,
    message: string,
    latitude: string,
    longitude: string,
    postcode: string,
    listingState: string,
    address: string,
    listingType: string,
    name: string,
}

// Needed for CORS with Proxy-lambda integration
const corsHeaders = {
    "Access-Control-Allow-Origin": "*"
}

const cleanListing = (listing: Listing): ReadListing => {
    if (listing.email) {
        delete listing.email
    }
    if (listing.address) {
        delete listing.address
    }
    if (listing.secretToken) {
        delete listing.secretToken
    }
    return listing
}

const postListing = async (body: ListingPostData) => {
    logger.info({body}, "Creating Listing")
    const listingItem: Listing = {
        ...body,
        id: uuidv4(),
        secretToken: uuidv4(),
        timestamp: new Date().getTime(),   
    }
    await storeItem(LISTING_DDB_TABLE, listingItem, logger)
    logger.info({listingItem}, "Created listing");

    // Send confirmation email
    try {
        const mailgun = new Mailgun({
            apiKey: MAIL_GUN_API_KEY,
            domain: DOMAIN
        });
        logger.info({mailgun}, `Mailgun initialized. Sending email to: ${listingItem.email}`);

        const mailgunResponse = await sendListingConfirmationEmail(mailgun, listingItem.id, listingItem.email, listingItem.name, listingItem.secretToken)
        logger.info({mailgunResponse}, "Successfully sent confirmation email for listing creation");
    } catch (error) {
        logger.error({error}, "Error sending confirmation email for listing creation");
    }

    return {
        statusCode: 201,
        body: JSON.stringify(listingItem),
        headers: corsHeaders
    };
}

const getListings = async (event: any) => {

    // Use Global Secondary Index when filter params given. Most requests filter by `listingType`
    let items
    const qs = event.queryStringParameters
    if (qs) {
        const data = await queryListingsByType(LISTING_DDB_TABLE, qs.type_filter, logger, qs.state_filter)
        logger.info({data}, "Queried listing by type")
        items = data.Items
    } else {
        logger.info("No Query Strings. Performing DDB scan")
        items = await scanAllItems(LISTING_DDB_TABLE, logger)
    }
    if (items) {
        // don't return emails and address for security reasons
        const cleanedItems = items.map((item: any) => { return cleanListing(item) })

        return {
            statusCode: 200,
            body: JSON.stringify(cleanedItems),
            headers: corsHeaders
        };
    } else {
        return {
            statusCode: 500,
            body: JSON.stringify({"error": "error fetching listings"}),
            headers: corsHeaders
        };
    }
}

const getListingsPaginated = async (event: any, listingType: string) => {
    const qs = event.queryStringParameters
    const stateFilter = qs ? qs.state_filter : undefined
    const nextToken = qs && qs.next_token ? parseNextToken(qs.next_token) : undefined

    const data = await queryListingsByType(LISTING_DDB_TABLE, listingType, logger, stateFilter, nextToken)
    logger.info({data}, "Queried listing by type")
    const items = data.Items

    if (items) {
        // don't return emails and address for security reasons
        const cleanedItems = items.map((item: any) => { return cleanListing(item) })

        const paginatedResponse: PaginatedListings = {
            items: cleanedItems,
            nextToken: getNextToken(data.LastEvaluatedKey) 
        }

        return {
            statusCode: 200,
            body: JSON.stringify(paginatedResponse),
            headers: corsHeaders
        };
    } else {
        return {
            statusCode: 500,
            body: JSON.stringify({"error": "error fetching listings"}),
            headers: corsHeaders
        };
    }
}

const deleteListing = async (event: any) => {
    // Assert ID provided
    if (!event.pathParameters) {
        return {
            statusCode: 400,
            body: JSON.stringify({"error": "no id to delete provided"}),
            headers: corsHeaders
        };
    }

    // Assert secret_token provided
    if (!event.queryStringParameters || !event.queryStringParameters.secret_token) {
        return {
            statusCode: 400,
            body: JSON.stringify({"error": "no secret_token provided"}),
            headers: corsHeaders
        };
    }

    const secretToken = event.queryStringParameters.secret_token
    const listingId = event.pathParameters.id

    const listing = await getItem(LISTING_DDB_TABLE, listingId, logger)
    logger.info({listing}, "Retrieved Listing");
    if (!listing) {
        return {
            statusCode: 404,
            body: JSON.stringify({"message": `No listing found for id: ${listingId}`}),
            headers: corsHeaders
        };
    };

    if (listing.secretToken && listing.secretToken !== secretToken) {
        return {
            statusCode: 400,
            body: JSON.stringify({"message": "Invalid secret_token value to delete listing"}),
            headers: corsHeaders
        };
    };

    await deleteItem(LISTING_DDB_TABLE, listingId)
    logger.info({listing}, "Deleted Listing");

    const cleanedListing = cleanListing(listing as Listing)
    return {
        statusCode: 200,
        body: JSON.stringify(cleanedListing),
        headers: corsHeaders
    };
}

export const handler = async (event: any) => {
    logger.info({event}, "Listing lambda event");
    const httpMethod: HttpMethod = event.httpMethod

    switch(httpMethod) {
        case "GET":
            if (event.path === "/listings") {
                return  await getListings(event)
            }
            if (event.path === "/listings/offer") {
                return  await getListingsPaginated(event, "offer")
            }
            if (event.path === "/listings/request") {
                return  await getListingsPaginated(event, "request")
            }
            return {
                statusCode: 500,
                body: JSON.stringify({"error": "method not supported"}),
                headers: corsHeaders
            };
        case "POST":
            const body = JSON.parse(event.body)
            return await postListing(body)
        case "DELETE":
            return await deleteListing(event)
        default:
            return {
                statusCode: 500,
                body: JSON.stringify({"error": "method not supported"}),
                headers: corsHeaders
            };
    }
}