import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

interface CreateEventRequest {
    clientId: string,
    title: string;
    budget?: number;
    deadline?: string;
    description: string;
}

interface Event {
    id: string;
    clientId: string;
    title: string;
    budget?: number;
    deadline?: string;
    description: string;
    createdAt: string;
}

export const createEventService = async (
    {
        clientId,
        title,
        description,
        deadline,
        budget
    }:
        CreateEventRequest) => {

    try {
        const dynamodb = new DynamoDB.DocumentClient();
        const transaction: Event = {
            id: uuidv4(),
            clientId,
            title,
            description,
            budget,
            deadline,
            createdAt: new Date().toISOString(),
        };

        await dynamodb.put({
            TableName: String(process.env.TABLE),
            Item: transaction,
        }).promise();

    } catch (error) {
        return error
    }
}