import { APIGatewayProxyHandler } from 'aws-lambda';
import {
    createUserController,
    authenticateController,
    saveTransactionController,
    getTransactionsController,
    getBillingsController
} from './controllers';

export const createUser: APIGatewayProxyHandler = createUserController
export const authenticate: APIGatewayProxyHandler = authenticateController
export const saveTransaction: APIGatewayProxyHandler = saveTransactionController
export const getTransactions: APIGatewayProxyHandler = getTransactionsController
export const getBillings: APIGatewayProxyHandler = getBillingsController