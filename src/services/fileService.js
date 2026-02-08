import api from '../api/axios'
import { API_PATHS } from '../constants'

export const presignUpload = async payload => {
  const response = await api.post(API_PATHS.files.presignUpload, payload)
  return response.data
}

export const presignDownload = async key => {
  const response = await api.get(API_PATHS.files.presignDownload, {
    params: { key },
  })
  return response.data
}
