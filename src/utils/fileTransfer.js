import { FILE_UPLOAD_REFERENCES } from '../constants'
import { presignDownload, presignUpload } from '../services/fileService'

export const buildUploadPayload = (file, reference = {}) => ({
  originalFileName: file.name,
  contentType: file.type || 'application/octet-stream',
  sizeBytes: file.size,
  ...reference,
})

export const uploadFileWithPresign = async (
  file,
  reference,
  { errorMessage = 'Failed to upload file.' } = {},
) => {
  if (!file) return { key: null }
  const uploadPayload = buildUploadPayload(file, reference)
  const { uploadUrl, key } = await presignUpload(uploadPayload)
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': uploadPayload.contentType,
    },
    body: file,
  })
  if (!uploadResponse.ok) {
    throw new Error(errorMessage)
  }
  return { key, uploadUrl }
}

export const getDownloadUrl = async key => {
  const { downloadUrl } = await presignDownload(key)
  return downloadUrl
}
