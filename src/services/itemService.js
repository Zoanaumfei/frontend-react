import api from '../api/axios'
import { API_PATHS } from '../constants'

export const createItemRequest = async payload => {
  const response = await api.post(API_PATHS.items, payload)
  return response.data
}

export const getItemsByStatus = async status => {
  const response = await api.get(API_PATHS.itemsByStatus(status))
  return response.data
}

export const getAllItems = async () => {
  const response = await api.get(API_PATHS.items)
  return response.data
}

export const getItemByKey = async (supplierID, partNumberVersion) => {
  const response = await api.get(API_PATHS.itemByKey(supplierID, partNumberVersion))
  return response.data
}

