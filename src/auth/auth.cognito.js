import { cognitoConfig } from './cognito.js'

const { AmazonCognitoIdentity } = window

if (!AmazonCognitoIdentity?.CognitoUserPool) {
  throw new Error('AmazonCognitoIdentity is not available on window.')
}

const poolData = {
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.clientId,
}

export const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData)
