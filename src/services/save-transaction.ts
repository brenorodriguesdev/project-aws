import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

interface SaveTransactionRequest {
    clientId: string,
    value: number;
    type: 'incoming' | 'expense';
    referenceDate: Date;
}

interface Transaction {
    id: string;
    clientId: string;
    value: number;
    type: 'incoming' | 'expense';
    createdAt: string;
    referenceDate: Date;
}

export const saveTransactionService = async (
    {
        clientId,
        value,
        type,
        referenceDate
    }:
        SaveTransactionRequest) => {

    const types = ['incoming', 'expense']

    if (!types.some(t => t === type)) {
        return new Error('type is invalid')
    }

    try {
        const dynamodb = new DynamoDB.DocumentClient();
        const transaction: Transaction = {
            id: uuidv4(),
            clientId,
            value,
            type,
            createdAt: new Date().toISOString(),
            referenceDate,
        };


        await dynamodb.put({
            TableName: String(process.env.TABLE),
            Item: transaction,
        }).promise();

    } catch (error) {
        return error
    }
}