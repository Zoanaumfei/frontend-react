import axios from 'axios'

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || 'https://oryzem-backend.onrender.com',
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
