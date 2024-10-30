import { APIGatewayProxyHandler } from "aws-lambda";
import { badRequest, noContent } from "../utils/http-helper";
import { onConnectService } from "../services/on-connect";

export const onConnectController: APIGatewayProxyHandler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    const token = event.queryStringParameters?.token;

      if (!connectionId) {
        return badRequest("connectionId is required")
      }

      if (!token) {
        return badRequest("token is required")
      }

      const error = await onConnectService({ connectionId, token })
      if (error instanceof Error) {
        return badRequest(error.message)
      }

      return noContent();
}