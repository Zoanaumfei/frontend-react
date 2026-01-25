import { isAuthenticated } from './auth.tokens.js'
import { getUserGroups } from './auth.groups.js'
import { ROUTES } from './auth.constants.js'

export function requireGroup(...allowedGroups) {
  if (!isAuthenticated()) {
    window.location.replace(ROUTES.LOGIN)
    return false
  }

  if (allowedGroups.length === 0) return true

  const userGroups = getUserGroups()
  const hasPermission = allowedGroups.some(group =>
    userGroups.includes(group),
  )

  if (!hasPermission) {
    window.location.replace(ROUTES.LOGIN)
    return false
  }

  return true
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.replace(ROUTES.LOGIN)
    return false
  }

  return true
}
