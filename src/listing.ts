'use strict'

import bunyan from 'bunyan'
import { allItems, storeItem } from "./util/dynamodb"
import { v4 as uuidv4 } from 'uuid';

const LISTING_DDB_TABLE = process.env.LISTING_DDB_TABLE || ''

const logger = bunyan.createLogger({name: "listing-lambda"})

type HttpMethod = "POST" | "GET"

interface Listing {
    id: string,
    email: string,
    message: string,
    name: string,
    latitude: string,
    longitude: string,
    postcode: string,
    state: string,
    address: string,
    timestamp: number,
    listingType: string,
}

interface ListingPostData {
    email: string,
    message: string,
    latitude: string,
    longitude: string,
    postcode: string,
    state: string,
    address: string,
    listingType: string,
    name: string,
}

// Needed for CORS with Proxy-lambda integration
const corsHeaders = {
    "Access-Control-Allow-Origin": "*"
}

const postListing = async (body: ListingPostData) => {
    logger.info({body}, "Posting Listing")
    const listingItem: Listing = {
        ...body,
        id: uuidv4(),
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

    // Check if filter used
    let filterExpr
    if (event.queryStringParameters && event.queryStringParameters.type_filter) {
        filterExpr = {
            FilterExpression : 'listingType = :listingType',
            ExpressionAttributeValues : {':listingType' : event.queryStringParameters.type_filter}
        }
        logger.info({filterExpr}, "Applying filter expression to scan")
    }

    const items = await allItems(LISTING_DDB_TABLE, logger, filterExpr)

    if (items) {
        // don't return emails for security reasons
        const emailRemovedItems = items.map((item) => {
            delete item.email
            return item
        })

        return {
            statusCode: 200,
            body: JSON.stringify(emailRemovedItems),
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

export const handler = async (event: any) => {
    logger.info({event}, "Listing lambda event");
    const httpMethod: HttpMethod = event.httpMethod

    switch(httpMethod) {
        case "GET":
            return  await getListings(event)
        case "POST":
            const body = JSON.parse(event.body)
            return await postListing(body)
        default:
            return {
                statusCode: 500,
                body: JSON.stringify({"error": "method not supported"}),
                headers: corsHeaders
            };
    }
}