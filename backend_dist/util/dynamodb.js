"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
exports.storeItem = async (tableName, item, logger) => {
    const DDB = new aws_sdk_1.DynamoDB.DocumentClient();
    try {
        const dbParams = {
            TableName: tableName,
            Item: item,
        };
        const response = await DDB.put(dbParams).promise();
        logger.info({ response, item }, "Stored item in DynamoDB");
    }
    catch (error) {
        logger.error({ error }, "Error storing item in DynamoDB");
    }
};
exports.getItem = async (tableName, itemId, logger) => {
    const DDB = new aws_sdk_1.DynamoDB.DocumentClient();
    const dbParams = {
        TableName: tableName,
        Key: {
            "id": itemId
        }
    };
    try {
        const data = await DDB.get(dbParams).promise();
        logger.info('Successfully got item:', data.Item);
        return data.Item;
    }
    catch (error) {
        logger.error({ error }, "Error retrieving item from DynamoDB");
    }
};
exports.deleteItem = async (tableName, itemId) => {
    const DDB = new aws_sdk_1.DynamoDB.DocumentClient();
    const dbParams = {
        TableName: tableName,
        Key: {
            "id": itemId
        }
    };
    return await DDB.delete(dbParams).promise();
};
exports.queryListingsByType = async (tableName, listingType, logger, stateFilter, nextToken) => {
    const DDB = new aws_sdk_1.DynamoDB.DocumentClient();
    const dbParams = {
        TableName: tableName,
        IndexName: "gsi_listingType",
        Limit: 1,
        KeyConditionExpression: 'listingType = :key',
        ExpressionAttributeValues: { ':key': listingType }
    };
    if (nextToken) {
        dbParams.ExclusiveStartKey = nextToken;
    }
    if (stateFilter) {
        dbParams.FilterExpression = 'listingState = :listingState',
            dbParams.ExpressionAttributeValues[':listingState'] = stateFilter;
    }
    logger.info({ dbParams });
    return await DDB.query(dbParams).promise();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1vZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbC9keW5hbW9kYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFrQztBQUVyQixRQUFBLFNBQVMsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxJQUFTLEVBQUUsTUFBVyxFQUFFLEVBQUU7SUFDekUsTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBUSxDQUFDLGNBQWMsRUFBRSxDQUFBO0lBQ3pDLElBQUk7UUFDQSxNQUFNLFFBQVEsR0FBNkM7WUFDdkQsU0FBUyxFQUFFLFNBQVM7WUFDcEIsSUFBSSxFQUFFLElBQUk7U0FDYixDQUFBO1FBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2xELE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLEVBQUUseUJBQXlCLENBQUMsQ0FBQTtLQUMzRDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFDLEtBQUssRUFBQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7S0FDM0Q7QUFDTCxDQUFDLENBQUE7QUFFWSxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxNQUFjLEVBQUUsTUFBVyxFQUFFLEVBQUU7SUFDNUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBUSxDQUFDLGNBQWMsRUFBRSxDQUFBO0lBQ3pDLE1BQU0sUUFBUSxHQUF5QztRQUNuRCxTQUFTLEVBQUUsU0FBUztRQUNwQixHQUFHLEVBQUU7WUFDRCxJQUFJLEVBQUUsTUFBTTtTQUNmO0tBQ0osQ0FBQztJQUNGLElBQUk7UUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ2xCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFDLEVBQUUscUNBQXFDLENBQUMsQ0FBQztLQUNoRTtBQUNMLENBQUMsQ0FBQTtBQUVZLFFBQUEsVUFBVSxHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO0lBQ2xFLE1BQU0sR0FBRyxHQUFHLElBQUksa0JBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtJQUN6QyxNQUFNLFFBQVEsR0FBNEM7UUFDdEQsU0FBUyxFQUFFLFNBQVM7UUFDcEIsR0FBRyxFQUFFO1lBQ0QsSUFBSSxFQUFFLE1BQU07U0FDZjtLQUNKLENBQUM7SUFDRixPQUFPLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNoRCxDQUFDLENBQUE7QUFFWSxRQUFBLG1CQUFtQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLFdBQW1CLEVBQUUsTUFBVyxFQUFFLFdBQW9CLEVBQUUsU0FBZSxFQUFFLEVBQUU7SUFDcEksTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBUSxDQUFDLGNBQWMsRUFBRSxDQUFBO0lBQ3pDLE1BQU0sUUFBUSxHQUF1QztRQUNqRCxTQUFTLEVBQUUsU0FBUztRQUNwQixTQUFTLEVBQUUsaUJBQWlCO1FBQzVCLEtBQUssRUFBRSxDQUFDO1FBQ1Isc0JBQXNCLEVBQUUsb0JBQW9CO1FBQzVDLHlCQUF5QixFQUFFLEVBQUMsTUFBTSxFQUFFLFdBQVcsRUFBQztLQUNuRCxDQUFDO0lBRUYsSUFBSSxTQUFTLEVBQUU7UUFDWCxRQUFRLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFBO0tBQ3pDO0lBRUQsSUFBSSxXQUFXLEVBQUU7UUFDYixRQUFRLENBQUMsZ0JBQWdCLEdBQUcsOEJBQThCO1lBQzFELFFBQVEsQ0FBQyx5QkFBMEIsQ0FBQyxlQUFlLENBQUMsR0FBRyxXQUFXLENBQUE7S0FDckU7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQTtJQUN2QixPQUFPLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMvQyxDQUFDLENBQUEifQ==