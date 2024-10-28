import { CognitoIdentityServiceProvider } from "aws-sdk";

interface AuthenticateRequest {
    username: string;
    password: string;
}


export const authenticateService = async (
    {
        username,
        password, 
    }:
        AuthenticateRequest) => {

    try {

        const params = {
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            UserPoolId: process.env.USER_POOL_ID!,
            ClientId: process.env.USER_POOL_CLIENT_ID!,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        };

        const cognito = new CognitoIdentityServiceProvider();
        const response = await cognito.adminInitiateAuth(params).promise();
        return response.AuthenticationResult
    } catch (error: any) {
        return error
    }
}