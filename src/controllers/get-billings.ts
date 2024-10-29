import { APIGatewayProxyHandler } from "aws-lambda";
import { badRequest, ok } from "../utils/http-helper";
import { getBillingsService } from "../services/get-billings";

export const getBillingsController: APIGatewayProxyHandler = async (event) => {
      const clientId =  event.requestContext.authorizer?.claims?.sub
      const transactions = await getBillingsService(clientId)
      if (transactions instanceof Error) {
        return badRequest(transactions.message)
      }
    
      return ok(transactions);
}