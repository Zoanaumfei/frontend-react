import api from '../api/axios'
import { API_PATHS } from '../constants'

const createIdempotencyKey = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }

  // RFC4122 v4 bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`
}

export const createProject = async (payload, idempotencyKey = createIdempotencyKey()) => {
  const response = await api.post(API_PATHS.projects, payload, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  })
  return response.data
}

export const getProject = async projectId => {
  const response = await api.get(API_PATHS.projectById(projectId))
  return response.data
}

export const getProjects = async () => {
  const response = await api.get(API_PATHS.projects)
  return response.data
}

export const updateProject = async (
  projectId,
  payload,
  idempotencyKey = createIdempotencyKey(),
) => {
  const response = await api.put(API_PATHS.projectById(projectId), payload, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  })
  return response.data
}

export const getDueEventsByDate = async date => {
  if (!date) return { items: [] }
  const response = await api.get(API_PATHS.dueByDate(date))
  return response.data
}
