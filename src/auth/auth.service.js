import { userPool } from './auth.cognito.js'
import { saveTokens, clearTokens } from './auth.tokens.js'
import { ROUTES } from './auth.constants.js'

export function login(email, password, remember) {
  const { AmazonCognitoIdentity } = window
  if (!AmazonCognitoIdentity?.CognitoUser) {
    return Promise.reject(
      new Error('AmazonCognitoIdentity is not available on window.'),
    )
  }

  return new Promise((resolve, reject) => {
    const authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: email,
      Password: password,
    })

    const user = new AmazonCognitoIdentity.CognitoUser({
      Username: email,
      Pool: userPool,
    })

    user.authenticateUser(authDetails, {
      onSuccess: result => {
        saveTokens(
          {
            idToken: result.getIdToken().getJwtToken(),
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          },
          remember,
        )
        resolve(result)
      },
      onFailure: reject,
      newPasswordRequired: attributes => {
        sessionStorage.setItem(
          'FIRST_ACCESS',
          JSON.stringify({
            username: user.getUsername(),
            attributes,
            session: user.Session,
          }),
        )
        window.location.replace(ROUTES.FIRST_ACCESS)
      },
    })
  })
}

export function logout() {
  const user = userPool.getCurrentUser()

  if (!user) {
    clearSession()
    return
  }

  user.signOut()
  clearSession()
}

function clearSession() {
  clearTokens()
  window.location.replace(ROUTES.LOGIN)
}
