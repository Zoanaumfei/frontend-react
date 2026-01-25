import api from '../api/axios'

const storeTokens = (tokens, remember) => {
  const storage = remember ? localStorage : sessionStorage

  if (tokens.accessToken) storage.setItem('accessToken', tokens.accessToken)
  if (tokens.refreshToken) storage.setItem('refreshToken', tokens.refreshToken)
  if (tokens.idToken) storage.setItem('idToken', tokens.idToken)
}

export const login = async ({ email, password, remember }) => {
  const response = await api.post('/auth/login', { email, password })
  const data = response.data || {}

  storeTokens(
    {
      accessToken: data.accessToken || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token,
      idToken: data.idToken || data.id_token,
    },
    remember,
  )

  return data
}
