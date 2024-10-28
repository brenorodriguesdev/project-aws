import { APIGatewayProxyResult } from "aws-lambda";

const badRequest = (message: string): APIGatewayProxyResult => ({
  statusCode: 400,
  body: JSON.stringify({ message }),
});

const unauthorized = (message: string): APIGatewayProxyResult => ({
  statusCode: 401,
  body: JSON.stringify({ message }),
});

const serverError = (message: string): APIGatewayProxyResult => ({
  statusCode: 500,
  body: JSON.stringify({ message }),
});

const noContent = (): APIGatewayProxyResult => ({
  statusCode: 204,
  body: '',
});

const ok = (data: any): APIGatewayProxyResult => ({
  statusCode: 200,
  body: JSON.stringify(data),
});

export { badRequest, unauthorized, serverError, noContent, ok };