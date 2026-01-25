import { GROUPS } from './auth.constants.js'
import { getIdToken } from './auth.tokens.js'

export function getUserGroups() {
  const token = getIdToken()
  if (!token) return []

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload['cognito:groups'] || []
  } catch {
    return []
  }
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
