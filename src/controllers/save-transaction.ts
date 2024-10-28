import { APIGatewayProxyHandler } from "aws-lambda";
import { validateRequiredFields } from "../utils/validate-required-fields";
import { createUserService } from "../services/create-user";
import { badRequest, noContent, ok } from "../utils/http-helper";
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
      const error = await saveTransactionService(body)
      if (error instanceof Error) {
        return badRequest(error.message)
      }
    
      return noContent();
}