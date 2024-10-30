import { DynamoDB, ApiGatewayManagementApi } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

interface SendMessageRequest {
    fromClientId: string;
    toClientId: string;
    text: string;
}

interface Message {
    id: string;
    fromClientId: string;
    toClientId: string;
    text: string;
    createdAt: string;
    recvAt?: Date;
    readAt?: Date;
}

export const sendMessageService = async (
    {
        fromClientId,
        toClientId,
        text
    }:
        SendMessageRequest) => {

    try {
        const dynamodb = new DynamoDB.DocumentClient();

        const message: Message = {
            id: uuidv4(),
            fromClientId,
            toClientId,
            text,
            createdAt: new Date().toISOString(),
        };


        await dynamodb.put({
            TableName: process.env.MESSAGES_TABLE!,
            Item: message,
        }).promise();

        const connectionResult = await dynamodb.query({
            TableName: process.env.CONNECTIONS_TABLE!,
            IndexName: 'ClientIdConnectAtIndex',
            KeyConditionExpression: 'clientId = :clientId',
            ExpressionAttributeValues: {
                ':clientId': toClientId,
            },
        }).promise();

        if (connectionResult.Items && connectionResult.Items.length > 0) {
            const connectionId = connectionResult.Items[0].connectionId;
            const apiGateway = new ApiGatewayManagementApi({
                endpoint: process.env.WEBSOCKET_ENDPOINT,
            });

            await apiGateway.postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify(message),
            }).promise();
        }

    } catch (error) {
        return error
    }
}