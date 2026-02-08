import { presignDownload, presignUpload } from '../services/fileService'

const FILE_SERVICE_UNAVAILABLE_MESSAGE =
  'File service is temporarily unavailable. Please try again later.'

const isServiceUnavailable = error => error?.response?.status === 503

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message || error?.message || fallbackMessage

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
  try {
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
  } catch (error) {
    if (isServiceUnavailable(error)) {
      throw new Error(FILE_SERVICE_UNAVAILABLE_MESSAGE)
    }
    throw new Error(getErrorMessage(error, errorMessage))
  }
}

export const getDownloadUrl = async key => {
  try {
    const { downloadUrl } = await presignDownload(key)
    return downloadUrl
  } catch (error) {
    if (isServiceUnavailable(error)) {
      return null
    }
    throw new Error(getErrorMessage(error, 'Failed to load file URL.'))
  }
}
