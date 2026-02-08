import axios from 'axios'
import { clearTokens } from '../auth/auth.tokens.js'
import { API_PATHS } from '../constants'

const baseURL = import.meta.env.VITE_API_BASE_URL
const LOGIN_PATH = API_PATHS.auth.login

const api = axios.create({
  baseURL,
})

const toPathname = url => {
  if (!url || typeof url !== 'string') return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname
    } catch {
      return ''
    }
  }
  return url
}

const isLoginRequest = configUrl => {
  const pathname = toPathname(configUrl)
  return pathname === LOGIN_PATH || pathname.endsWith(LOGIN_PATH)
}

api.interceptors.request.use(config => {
  const token =
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status
    if (status === 401 && !isLoginRequest(error?.config?.url)) {
      clearTokens()
      if (window.location.pathname !== '/') {
        window.location.replace('/')
      }
    }
    if (status === 403 && !isLoginRequest(error?.config?.url)) {
      if (window.location.pathname !== '/no-access') {
        window.location.replace('/no-access')
      }
    }

    return Promise.reject(error)
  },
)

export default api
