import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { badRequest } from "./http-helper";

export const validateRequiredFields = (
    event: APIGatewayEvent,
    requiredFields: string[],
    whereValidate: 'body' | 'pathParameters' | 'queryStringParameters'
): APIGatewayProxyResult | void => {

    try {
        if (whereValidate === 'body' && !event[whereValidate]) {
            return badRequest('request body required.');
        }

        const data = whereValidate === 'body' ?
            JSON.parse(event[whereValidate] as string) :
            event[whereValidate]

        for (const requiredField of requiredFields) {
            if (!data[requiredField]) {
                return badRequest(`${requiredField} is required.`);
            }
        }
    } catch (error) {
        return badRequest(`${whereValidate} is invalid.`);
    }
    
};