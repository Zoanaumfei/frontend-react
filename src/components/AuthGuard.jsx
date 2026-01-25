import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../auth/auth.tokens.js'
import { hasGroup } from '../auth/auth.groups.js'

function AuthGuard({ allowedGroups, children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  if (allowedGroups?.length && !hasGroup(...allowedGroups)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AuthGuard
