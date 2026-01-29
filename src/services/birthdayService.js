import api from '../api/axios'

export const createBirthday = async payload => {
  const response = await api.post('/api/v1/birthdays', payload)
  return response.data
}

export const getBirthdays = async (params = {}) => {
  const response = await api.get('/api/v1/birthdays', { params })
  return response.data
}

export const deleteBirthday = async (month, name) => {
  const response = await api.delete(
    `/api/v1/birthdays/${encodeURIComponent(month)}/${encodeURIComponent(name)}`,
  )
  return response.data
}
