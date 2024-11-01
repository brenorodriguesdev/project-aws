import { DynamoDB } from 'aws-sdk';

export const payBillingService = async (billingId: string) => {
    try {
        const dynamodb = new DynamoDB.DocumentClient();
        await dynamodb.update({
            TableName: process.env.TABLE!,
            Key: { id: billingId },
            UpdateExpression: 'SET payAt = :payAt, #status = :status',
            ExpressionAttributeValues: {
                ':payAt': new Date().toISOString(),
                ':status': 'PAYED',
            },
            ExpressionAttributeNames: {
                '#status': 'status',
            },
        }).promise();
    } catch (error) {
        return error;
    }
};