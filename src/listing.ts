'use strict'

import bunyan from 'bunyan'
import { queryListingsByType, scanAllItems, storeItem } from "./util/dynamodb"
import { v4 as uuidv4 } from 'uuid';

const LISTING_DDB_TABLE = process.env.LISTING_DDB_TABLE || ''

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
    logger.info({body}, "Posting Listing")
    const listingItem: Listing = {
        ...body,
        id: uuidv4(),
        secretToken: uuidv4(),
        timestamp: new Date().getTime(),   
    }
    await storeItem(LISTING_DDB_TABLE, listingItem, logger)

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
        items = await queryListingsByType(LISTING_DDB_TABLE, qs.type_filter, logger, qs.state_filter)
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
    const state_filter = qs ? qs.state_filter : undefined
    const items = await queryListingsByType(LISTING_DDB_TABLE, listingType, logger, state_filter)

    if (items) {
        // don't return emails and address for security reasons
        const cleanedItems = items.map((item: any) => { return cleanListing(item) })

        const paginatedResponse = {
            items: cleanedItems,
            nextToken: null 
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
    logger.info({event}, "Deleting listing")
    const deletedListing = {}
    const cleanedListing = cleanListing(deletedListing as Listing)
    return {
        statusCode: 200,
        body: JSON.stringify(cleanedListing),
        headers: corsHeaders
    };
    // } else {
    //     return {
    //         statusCode: 500,
    //         body: JSON.stringify({"error": "error fetching listings"}),
    //         headers: corsHeaders
    //     };
    // }
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