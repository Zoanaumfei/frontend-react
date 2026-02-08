import api from '../api/axios'
import { API_PATHS } from '../constants'

export const getUsers = async () => {
  const response = await api.get(API_PATHS.users)
  return response.data
}
