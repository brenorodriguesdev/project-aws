import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import { Construct } from 'constructs';

export class ProjectAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    const protectedRouteLambda = new lambda.Function(this, 'ProtectedRouteLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      handler: 'handler.protectedRoute',
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

    transactionsTable.grant(saveTransactionLambda, 'dynamodb:PutItem');

    const tablePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:BatchWriteItem'],
      resources: [transactionsTable.tableArn],
      principals: [new iam.ArnPrincipal(lambdaRole.roleArn)],
    });

    transactionsTable.addToResourcePolicy(tablePolicy);

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

    api.root.addResource('protected').addMethod('GET', new apigateway.LambdaIntegration(protectedRouteLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    api.root.addResource('transaction').addMethod('POST', new apigateway.LambdaIntegration(saveTransactionLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }
}