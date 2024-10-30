import { APIGatewayProxyHandler } from "aws-lambda";
import { validateRequiredFields } from "../utils/validate-required-fields";
import { badRequest, noContent } from "../utils/http-helper";
import { readMessagesService } from "../services/read-messages";

export const readMessagesController: APIGatewayProxyHandler = async (event) => {

    const requiredFieldsError = validateRequiredFields(event, [
        'chatClient',
      ], 'body')
    
      if (requiredFieldsError) {
        return requiredFieldsError
      }

      const body = event.body ? JSON.parse(event.body) : {};
      const clientId =  event.requestContext.authorizer?.claims?.sub
      const error = await readMessagesService({ ...body, clientId })
      if (error instanceof Error) {
        return badRequest(error.message)
      }
    
      return noContent();
}