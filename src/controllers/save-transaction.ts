import { APIGatewayProxyHandler } from "aws-lambda";
import { validateRequiredFields } from "../utils/validate-required-fields";
import { badRequest, noContent } from "../utils/http-helper";
import { saveTransactionService } from "../services/save-transaction";

export const saveTransactionController: APIGatewayProxyHandler = async (event) => {

    const requiredFieldsError = validateRequiredFields(event, [
        'value',
        'type',
        'referenceDate'
      ], 'body')
    
      if (requiredFieldsError) {
        return requiredFieldsError
      }

      const body = event.body ? JSON.parse(event.body) : {};
      const clientId =  event.requestContext.authorizer?.claims?.sub
      const error = await saveTransactionService({ ...body, clientId })
      if (error instanceof Error) {
        return badRequest(error.message)
      }
    
      return noContent();
}