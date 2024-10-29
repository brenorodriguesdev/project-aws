import { DynamoDB } from 'aws-sdk';
export const getTransactionsService = async (clientId: string) => {
    try {
        const dynamodb = new DynamoDB.DocumentClient();
        const result = await dynamodb.query({
            TableName: String(process.env.TABLE),
            IndexName: 'ClientIdReferenceDateIndex', 
            KeyConditionExpression: 'clientId = :clientId',
            ExpressionAttributeValues: {
                ':clientId': clientId,
            },
            ScanIndexForward: true, 
        }).promise();

        return result.Items;

    } catch (error) {
        return error
    }
}