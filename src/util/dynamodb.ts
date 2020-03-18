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

export const allItems = async (tableName: string, logger: any) => {
    const DDB = new DynamoDB.DocumentClient()
    try {
        const dbParams: AWS.DynamoDB.DocumentClient.ScanInput = {
            TableName: tableName,
            Select: "ALL_ATTRIBUTES"
        }
        const response = await DDB.scan(dbParams).promise()
        logger.info({response}, "Scanned all items in DynamoDB")
        return response.Items
    } catch (error) {
        logger.error({error}, "Error retrieving items in DynamoDB");
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
