import api from '../api/axios'

export const presignUpload = async payload => {
  const response = await api.post('/api/v1/files/presign-upload', payload)
  return response.data
}

export const presignDownload = async key => {
  const response = await api.get('/api/v1/files/presign-download', {
    params: { key },
  })
  return response.data
}
