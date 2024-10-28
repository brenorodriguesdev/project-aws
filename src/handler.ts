import { APIGatewayProxyHandler } from 'aws-lambda';
import { ok } from './utils/http-helper';
import { createUserController, authenticateController } from './controllers';

export const createUser: APIGatewayProxyHandler = createUserController
export const authenticate: APIGatewayProxyHandler = authenticateController

export const protectedRoute: APIGatewayProxyHandler = async (event) => {
  return ok({ 
    message: 'Hello World'
  });
};