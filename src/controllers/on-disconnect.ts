import { APIGatewayProxyHandler } from "aws-lambda";
import { badRequest, noContent } from "../utils/http-helper";
import { onDisconnectService } from "../services/on-disconnect";

export const onDisconnectController: APIGatewayProxyHandler = async (event) => {
    const connectionId = event.requestContext.connectionId;

      if (!connectionId) {
        return badRequest("connectionId is required")
      }

      await onDisconnectService(connectionId)

      return noContent();
}