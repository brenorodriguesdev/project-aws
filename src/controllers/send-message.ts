import { APIGatewayProxyHandler } from "aws-lambda";
import { validateRequiredFields } from "../utils/validate-required-fields";
import { badRequest, noContent } from "../utils/http-helper";
import { sendMessageService } from "../services/send-message";

export const sendMessageController: APIGatewayProxyHandler = async (event) => {

    const requiredFieldsError = validateRequiredFields(event, [
        'text',
        'toClientId',
      ], 'body')
    
      if (requiredFieldsError) {
        return requiredFieldsError
      }

      const body = event.body ? JSON.parse(event.body) : {};
      const fromClientId =  event.requestContext.authorizer?.claims?.sub
      const error = await sendMessageService({ ...body, fromClientId })
      if (error instanceof Error) {
        return badRequest(error.message)
      }
    
      return noContent();
}