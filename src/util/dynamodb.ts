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