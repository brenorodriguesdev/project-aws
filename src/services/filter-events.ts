import { DynamoDB } from 'aws-sdk';

export const filterEvents = async (title: string) => {
    try {
        const dynamodb = new DynamoDB.DocumentClient();
        const result = await dynamodb.scan({
            TableName: String(process.env.TABLE),
            FilterExpression: 'contains(title, :title)',
            ExpressionAttributeValues: {
                ':title': title,
            },
        }).promise();

        return result.Items;

    } catch (error) {
        return error;
    }
};