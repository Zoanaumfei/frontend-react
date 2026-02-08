const CLIENT_BUG_EVENT = 'oryzem:client-bug'
const CLIENT_BUG_STORE_KEY = '__ORYZEM_CLIENT_BUGS__'

export function reportClientBug(code, details = {}) {
  const payload = {
    code,
    details,
    timestamp: new Date().toISOString(),
  }

  if (typeof window === 'undefined') return

  const existing = Array.isArray(window[CLIENT_BUG_STORE_KEY])
    ? window[CLIENT_BUG_STORE_KEY]
    : []
  window[CLIENT_BUG_STORE_KEY] = [...existing, payload]
  window.dispatchEvent(new CustomEvent(CLIENT_BUG_EVENT, { detail: payload }))
}
