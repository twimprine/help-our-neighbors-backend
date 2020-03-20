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

const buildListingsFilterExpr = (event: any) => {
    const qs = event.queryStringParameters
    if (qs) {
        if (qs.type_filter && !qs.state_filter) {
            logger.info({qs}, "Filter with type, no state")
            return {
                FilterExpression : 'listingType = :listingType',
                ExpressionAttributeValues : {':listingType' : qs.type_filter}
            }
        }
        // state but not type
        if (!qs.type_filter && qs.state_filter) {
            logger.info({qs}, "Filter with state, no type")
            return {
                FilterExpression : 'listingState = :listingState',
                ExpressionAttributeValues : {':listingState': qs.state_filter}
            }
        }
        // both type and state
        if (qs.type_filter && qs.state_filter) {
            logger.info({qs}, "Filter with type and state")
            return {
                FilterExpression : 'listingType = :listingType AND listingState = :listingState',
                ExpressionAttributeValues : {':listingType' : qs.type_filter, ':listingState': qs.state_filter}
            }
        }
    }
}

const getListings = async (event: any) => {

    // undefined when no 'queryStringParameters' passed 
    const filterExpr = buildListingsFilterExpr(event)
    if (filterExpr) {
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