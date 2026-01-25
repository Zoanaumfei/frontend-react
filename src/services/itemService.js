import api from '../api/axios'

export const createItemRequest = async payload => {
  const response = await api.post('/api/v1/items', payload)
  return response.data
}

export const getItemsByStatus = async status => {
  const response = await api.get(`/api/v1/items/status/${status}`)
  return response.data
}

export const getAllItems = async () => {
  const response = await api.get('/api/v1/items')
  return response.data
}

export const getItemByKey = async (supplierID, partNumberVersion) => {
  const response = await api.get(
    `/api/v1/items/${encodeURIComponent(supplierID)}/${encodeURIComponent(
      partNumberVersion,
    )}`,
  )
  return response.data
}

