import { decodeJwtPayload } from './auth.jwt.js'

const STORAGE_KEYS = {
  idToken: 'idToken',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
}

const readToken = key =>
  localStorage.getItem(key) || sessionStorage.getItem(key)

export function saveTokens({ idToken, accessToken, refreshToken }, remember) {
  const storage = remember ? localStorage : sessionStorage

  clearTokens()
  if (idToken) storage.setItem(STORAGE_KEYS.idToken, idToken)
  if (accessToken) storage.setItem(STORAGE_KEYS.accessToken, accessToken)
  if (refreshToken) storage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
}

export function getIdToken() {
  return readToken(STORAGE_KEYS.idToken)
}

export function clearTokens() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
}

export function isAuthenticated() {
  const token = getIdToken()
  if (!token) return false

  const payload = decodeJwtPayload(token)
  if (!payload) return false

  const now = Math.floor(Date.now() / 1000)
  return Boolean(payload.exp && payload.exp > now)
}
