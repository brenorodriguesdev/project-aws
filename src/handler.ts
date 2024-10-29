import { APIGatewayProxyHandler } from 'aws-lambda';
import {
    createUserController,
    authenticateController,
    saveTransactionController,
    getTransactionsController
} from './controllers';

export const createUser: APIGatewayProxyHandler = createUserController
export const authenticate: APIGatewayProxyHandler = authenticateController
export const saveTransaction: APIGatewayProxyHandler = saveTransactionController
export const getTransactions: APIGatewayProxyHandler = getTransactionsController