import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

interface CreateOfferEventRequest {
    clientId: string,
    eventId: string;
    offerAmount: number;
    offerTime: string;
}

interface OfferEvent {
    id: string;
    eventId: string;
    offerAmount: number;
    offerTime: string;
    clientOfferId: string;
    createdAt: string;
}

export const createOfferEventService = async (
    {
        clientId,
        eventId,
        offerAmount,
        offerTime
    }:
        CreateOfferEventRequest) => {

    try {
        const dynamodb = new DynamoDB.DocumentClient();
        const offerEvent: OfferEvent = {
            id: uuidv4(),
            clientOfferId: clientId,
            eventId,
            offerAmount,
            offerTime,
            createdAt: new Date().toISOString(),
        };

        await dynamodb.put({
            TableName: String(process.env.TABLE),
            Item: offerEvent,
        }).promise();

    } catch (error) {
        return error
    }
}