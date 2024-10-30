import { DynamoDB, ApiGatewayManagementApi } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

interface ReadMessagesRequest {
    clientId: string;
    chatClientId: string;
}


export const readMessagesService = async (
    {
        clientId,
        chatClientId,
    }:
    ReadMessagesRequest) => {

    try {
        const dynamodb = new DynamoDB.DocumentClient();

        const queryParams: DynamoDB.DocumentClient.QueryInput = {
            TableName: process.env.TABLE!,
            IndexName: 'ToClientIdIndex', 
            KeyConditionExpression: 'toClientId = :toClientId',
            FilterExpression: 'fromClientId = :fromClientId AND attribute_not_exists(readAt)',
            ExpressionAttributeValues: {
                ':toClientId': clientId,
                ':fromClientId': chatClientId,
            },
        };

        const result = await dynamodb.query(queryParams).promise()

        if (result.Items && result.Items.length > 0) {
            const updatePromises = result.Items.map((message) =>
                dynamodb.update({
                    TableName: process.env.TABLE!,
                    Key: { id: message.id },
                    UpdateExpression: 'SET readAt = :readAt',
                    ExpressionAttributeValues: {
                        ':readAt': new Date().toISOString(),
                    },
                }).promise()
            );
    
            await Promise.all(updatePromises);
        }



    } catch (error) {
        return error
    }
}