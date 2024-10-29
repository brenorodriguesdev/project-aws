import { APIGatewayProxyHandler } from "aws-lambda";
import { validateRequiredFields } from "../utils/validate-required-fields";
import { createUserService } from "../services/create-user";
import { badRequest, noContent } from "../utils/http-helper";

export const createUserController: APIGatewayProxyHandler = async (event) => {

    const requiredFieldsError = validateRequiredFields(event, [
        'username',
        'password',
        'email'
      ], 'body')
    
      if (requiredFieldsError) {
        return requiredFieldsError
      }

      const body = event.body ? JSON.parse(event.body) : {};
      const error = await createUserService(body)
      if (error instanceof Error) {
        return badRequest(error.message)
      }
    
      return noContent();
}