import { isAuthenticated } from './auth.tokens.js'
import { resolveUserGroup } from './auth.groups.js'
import { GROUPS } from './auth.constants.js'
import { redirectByGroup } from './auth.redirect.js'

export function bootstrapAuth() {
  if (!isAuthenticated()) {
    return false
  }

  const group = resolveUserGroup()

  switch (group) {
    case GROUPS.ADMIN:
      redirectByGroup(GROUPS.ADMIN)
      break
    case GROUPS.INTERNAL:
      redirectByGroup(GROUPS.INTERNAL)
      break
    case GROUPS.EXTERNAL:
      redirectByGroup(GROUPS.EXTERNAL)
      break
    default:
      return false
  }

  return true
}
