import {
    CognitoIdentityServiceProvider
} from 'aws-sdk';
import { DynamoDB } from 'aws-sdk';

interface OnConnectRequest {
    connectionId: string;
    token: string;
}


export const onConnectService = async ({ connectionId, token }: OnConnectRequest) => {
    try {

        const command = {
            AccessToken: token,
        };
        const cognito = new CognitoIdentityServiceProvider();
        const user = await cognito.getUser(command).promise();
        const clientId = user.Username;

        const dynamodb = new DynamoDB.DocumentClient();

        await dynamodb.put({
            TableName: String(process.env.TABLE),
            Item: {
                connectionId,
                clientId,
                connectAt: new Date().toISOString(),
            },
        }).promise();


    } catch (error) {
        return error
    }
}