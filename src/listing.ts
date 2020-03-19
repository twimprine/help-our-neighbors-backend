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
    timestamp: number,
    type: string,
}

interface ListingPostData {
    email: string,
    message: string,
    latitude: string,
    longitude: string,
    postcode: string,
    state: string,
    type: string,
    name: string,
}

// Needed for CORS with Proxy-lambda integration
const corsHeaders = {
    "Access-Control-Allow-Origin": "*"
}

const postListing = async (body: ListingPostData) => {
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

const getListings = async () => {
    const items = await allItems(LISTING_DDB_TABLE, logger)

    // TODO: don't return emails

    return {
        statusCode: 200,
        body: JSON.stringify(items),
        headers: corsHeaders
    };
}

export const handler = async (event: any) => {
    logger.info({event}, "Listing lambda event");
    const httpMethod: HttpMethod = event.httpMethod

    switch(httpMethod) {
        case "GET":
            return  await getListings()
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