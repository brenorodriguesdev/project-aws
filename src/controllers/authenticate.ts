import { APIGatewayProxyHandler } from "aws-lambda";
import { validateRequiredFields } from "../utils/validate-required-fields";
import { badRequest, ok } from "../utils/http-helper";
import { authenticateService } from "../services/authenticate";

export const authenticateController: APIGatewayProxyHandler = async (event) => {

    const requiredFieldsError = validateRequiredFields(event, [
        'username',
        'password',
      ], 'body')
    
      if (requiredFieldsError) {
        return requiredFieldsError
      }

      const body = event.body ? JSON.parse(event.body) : {};
      const result = await authenticateService(body)
      if (result instanceof Error) {
        return badRequest(result.message)
      }
    
      return ok(result);
}