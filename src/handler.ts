import { APIGatewayProxyHandler } from 'aws-lambda';
import { ok } from './utils/http-helper';
import {
    createUserController,
    authenticateController,
    saveTransactionController
} from './controllers';

export const createUser: APIGatewayProxyHandler = createUserController
export const authenticate: APIGatewayProxyHandler = authenticateController
export const saveTransaction: APIGatewayProxyHandler = saveTransactionController