import { DynamoDB } from 'aws-sdk';

export const onDisconnectService = async (connectionId: string) => {
    try {
        const dynamodb = new DynamoDB.DocumentClient();

        await dynamodb.delete({
            TableName: String(process.env.TABLE),
            Key: { connectionId },
          }).promise();

    } catch (error) {
        return error
    }
}