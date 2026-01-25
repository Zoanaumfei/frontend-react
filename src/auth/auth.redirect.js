import { GROUPS, ROUTES } from './auth.constants.js'

export function redirectByGroup(group) {
  switch (group) {
    case GROUPS.ADMIN:
      window.location.replace(ROUTES.ADMIN)
      break
    case GROUPS.INTERNAL:
      window.location.replace(ROUTES.INTERNAL)
      break
    case GROUPS.EXTERNAL:
      window.location.replace(ROUTES.EXTERNAL)
      break
    default:
      window.location.replace(ROUTES.LOGIN)
  }
}
