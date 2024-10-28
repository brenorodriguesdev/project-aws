import { CognitoIdentityServiceProvider } from "aws-sdk";

interface CreateUserRequest {
    username: string;
    password: string;
    email: string;
}


export const createUserService = async (
    {
        username,
        password,
        email
    }:
        CreateUserRequest) => {


    const params = {
        UserPoolId: process.env.USER_POOL_ID!,
        Username: username,
        MessageAction: "SUPPRESS",
        UserAttributes: [
            {
                Name: "email",
                Value: email,
            },
            { Name: 'email_verified', Value: 'true' },
        ],
        DesiredDeliveryMediums: [],
    };

    try {
        const cognito = new CognitoIdentityServiceProvider();
        await cognito.adminCreateUser(params).promise();
        await cognito.adminSetUserPassword({
            UserPoolId: process.env.USER_POOL_ID!,
            Username: username,
            Password: password,
            Permanent: true
        }).promise();

    } catch (error: any) {
        return error
    }
}