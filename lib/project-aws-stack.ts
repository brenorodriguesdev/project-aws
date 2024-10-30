import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import { Construct } from 'constructs';

export class ProjectAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const billingsTable = new dynamodb.Table(this, 'BillingsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    billingsTable.addGlobalSecondaryIndex({
      indexName: 'ClientIdReferenceDateIndex',
      partitionKey: { name: 'clientId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'referenceDate', type: dynamodb.AttributeType.STRING },
    });

    const transactionsTable = new dynamodb.Table(this, 'TransactionsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    transactionsTable.addGlobalSecondaryIndex({
      indexName: 'ClientIdReferenceDateIndex',
      partitionKey: { name: 'clientId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'referenceDate', type: dynamodb.AttributeType.STRING },
    });

    const connectionsTable = new dynamodb.Table(this, 'ConnectionsTable', {
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    connectionsTable.addGlobalSecondaryIndex({
      indexName: 'ClientIdConnectAtIndex',
      partitionKey: { name: 'clientId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'connectAt', type: dynamodb.AttributeType.STRING },
    });


    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'MyUserPool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: { adminUserPassword: true },
    });

    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:AdminCreateUser', 'cognito-idp:AdminSetUserPassword', 'cognito-idp:AdminInitiateAuth'],
      resources: [userPool.userPoolArn],
    }));

    const createUserLambda = new lambda.Function(this, 'CreateUserLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      handler: 'handler.createUser',
      environment: { USER_POOL_ID: userPool.userPoolId },
      role: lambdaRole,
    });

    const authenticateLambda = new lambda.Function(this, 'AuthenticateLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      handler: 'handler.authenticate',
      environment: { USER_POOL_ID: userPool.userPoolId, USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId },
      role: lambdaRole,
    });

    const saveTransactionLambda = new lambda.Function(this, 'SaveTransactionLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.saveTransaction',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: {
        TABLE: transactionsTable.tableName,
      },
      role: lambdaRole,
    });

    const getTransactionsLambda = new lambda.Function(this, 'GetTransactionsLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.getTransactions',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: {
        TABLE: transactionsTable.tableName,
      },
      role: lambdaRole,
    });

    const getBillingsLambda = new lambda.Function(this, 'GetBillingsLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.getBillings',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: {
        TABLE: billingsTable.tableName,
      },
      role: lambdaRole,
    });

    const connectLambda = new lambda.Function(this, 'ConnectLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      handler: 'handler.onConnect',
      environment: {
        TABLE: connectionsTable.tableName,
      },
      role: lambdaRole,
    });

    const disconnectLambda = new lambda.Function(this, 'DisconnectLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      handler: 'handler.onDisconnect',
      environment: {
        TABLE: connectionsTable.tableName,
      },
      role: lambdaRole,
    });
    
    transactionsTable.grantWriteData(saveTransactionLambda);
    transactionsTable.grantReadData(getTransactionsLambda);
    billingsTable.grantReadData(getBillingsLambda);
    connectionsTable.grantWriteData(connectLambda);
    connectionsTable.grantWriteData(disconnectLambda);

    const api = new apigateway.RestApi(this, 'MeuApiGateway', {
      restApiName: 'MeuApiGateway',
      description: 'API para invocar a função Lambda.',
    });

    api.root.addResource('authenticate').addMethod('POST', new apigateway.LambdaIntegration(authenticateLambda));
    api.root.addResource('create-user').addMethod('POST', new apigateway.LambdaIntegration(createUserLambda));

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'APIGatewayAuthorizer', {
      cognitoUserPools: [userPool],
      identitySource: 'method.request.header.Authorization',
    });

    const resource = api.root.addResource('transaction')

    resource.addMethod('GET', new apigateway.LambdaIntegration(getTransactionsLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    })
    resource.addMethod('POST', new apigateway.LambdaIntegration(saveTransactionLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    api.root.addResource('billing').addMethod('GET', new apigateway.LambdaIntegration(getBillingsLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    })



    const webSocketApi = new apigatewayv2.WebSocketApi(this, 'WebSocketApi', {
      connectRouteOptions: {
        integration: new apigatewayv2_integrations.WebSocketLambdaIntegration('ConnectIntegration', connectLambda),
      },
      disconnectRouteOptions: {
        integration: new apigatewayv2_integrations.WebSocketLambdaIntegration('DisconnectIntegration', disconnectLambda),
      },
    });

    const webSocketStage = new apigatewayv2.WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true,
    });

    new cdk.CfnOutput(this, 'WebSocketUrl', {
      value: webSocketStage.url,
    });
  }
}