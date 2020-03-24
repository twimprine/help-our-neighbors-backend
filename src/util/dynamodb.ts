import { DynamoDB } from 'aws-sdk'

export const storeItem = async (tableName: string, item: any, logger: any) => {
    const DDB = new DynamoDB.DocumentClient()
    try {
        const dbParams: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: tableName,
            Item: item,
        }
        const response = await DDB.put(dbParams).promise()
        logger.info({response, item}, "Stored item in DynamoDB")
    } catch (error) {
        logger.error({error}, "Error storing item in DynamoDB");
    }
}

export const getItem = async (tableName: string, itemId: string, logger: any) => {
    const DDB = new DynamoDB.DocumentClient()
    const dbParams: DynamoDB.DocumentClient.GetItemInput = {
        TableName: tableName,
        Key: {
            "id": itemId
        }
    };
    try {
        const data = await DDB.get(dbParams).promise();
        logger.info('Successfully got item:', data.Item);
        return data.Item;
      } catch (error) {
        logger.error({error}, "Error retrieving item from DynamoDB");
    }
}

export const deleteItem = async (tableName: string, itemId: string) => {
    const DDB = new DynamoDB.DocumentClient()
    const dbParams: DynamoDB.DocumentClient.DeleteItemInput = {
        TableName: tableName,
        Key: {
            "id": itemId
        }
    };
    return await DDB.delete(dbParams).promise();
}

export const queryListingsByType = async (tableName: string, listingType: string, logger: any, stateFilter?: string, nextToken?: any) => {
    const DDB = new DynamoDB.DocumentClient()
    const dbParams: DynamoDB.DocumentClient.QueryInput = {
        TableName: tableName,
        IndexName: "gsi_listingType",
        Limit: 1,
        KeyConditionExpression: 'listingType = :key',
        ExpressionAttributeValues: {':key': listingType}
    };

    if (nextToken) {
        dbParams.ExclusiveStartKey = nextToken
    }

    if (stateFilter) {
        dbParams.FilterExpression = 'listingState = :listingState',
        dbParams.ExpressionAttributeValues![':listingState'] = stateFilter
    }
    logger.info({dbParams})
    return await DDB.query(dbParams).promise();
}
