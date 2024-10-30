import { APIGatewayProxyHandler } from 'aws-lambda';
import {
    createUserController,
    authenticateController,
    saveTransactionController,
    getTransactionsController,
    getBillingsController,
    onDisconnectController,
    onConnectController,
    sendMessageController,
    readMessagesController
} from './controllers';

export const createUser: APIGatewayProxyHandler = createUserController
export const authenticate: APIGatewayProxyHandler = authenticateController
export const saveTransaction: APIGatewayProxyHandler = saveTransactionController
export const getTransactions: APIGatewayProxyHandler = getTransactionsController
export const getBillings: APIGatewayProxyHandler = getBillingsController
export const onDisconnect: APIGatewayProxyHandler = onDisconnectController
export const onConnect: APIGatewayProxyHandler = onConnectController
export const sendMessage: APIGatewayProxyHandler = sendMessageController
export const readMessages: APIGatewayProxyHandler = readMessagesController