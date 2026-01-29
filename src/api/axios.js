import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL

if (!baseURL) {
  console.error(
    'VITE_API_BASE_URL is missing. Set it in the .env file to your backend URL.',
  )
}

const api = axios.create({
  baseURL,
})

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
  error => Promise.reject(error),
)

export default api
