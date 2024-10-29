import { APIGatewayProxyHandler } from "aws-lambda";
import { badRequest, ok } from "../utils/http-helper";
import { getTransactionsService } from "../services/get-transactions";

export const getTransactionsController: APIGatewayProxyHandler = async (event) => {
      const clientId =  event.requestContext.authorizer?.claims?.sub
      const transactions = await getTransactionsService(clientId)
      if (transactions instanceof Error) {
        return badRequest(transactions.message)
      }
    
      return ok(transactions);
}