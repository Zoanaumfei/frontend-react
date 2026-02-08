import { GROUPS } from './auth.constants.js'
import { decodeJwtPayload } from './auth.jwt.js'
import { getIdToken } from './auth.tokens.js'

export function getUserGroups() {
  const token = getIdToken()
  if (!token) return []

  const payload = decodeJwtPayload(token)
  const groups = payload?.['cognito:groups']
  return Array.isArray(groups) ? groups : []
}

export function resolveUserGroup() {
  const groups = getUserGroups()

  if (groups.includes(GROUPS.ADMIN)) return GROUPS.ADMIN
  if (groups.includes(GROUPS.INTERNAL)) return GROUPS.INTERNAL
  if (groups.includes(GROUPS.EXTERNAL)) return GROUPS.EXTERNAL

  return null
}

export function hasGroup(...allowedGroups) {
  const groups = getUserGroups()
  return allowedGroups.some(group => groups.includes(group))
}
