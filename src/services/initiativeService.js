import api from '../api/axios'
import { API_PATHS } from '../constants'

export const createInitiativeIdempotencyKey = () => {
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

  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`
}

export const getInitiatives = async (params = {}) => {
  const response = await api.get(API_PATHS.initiatives, { params })
  return response.data
}

const initiativesCache = new Map()

const getCacheKey = params => JSON.stringify(params || {})

export const getInitiativesCacheSnapshot = (
  params = {},
  maxAgeMs = 3600000,
) => {
  const cacheKey = getCacheKey(params)
  const cached = initiativesCache.get(cacheKey)
  if (!cached) {
    return { data: null, isFresh: false, ageMs: null }
  }
  const ageMs = Date.now() - cached.timestamp
  return {
    data: cached.data,
    isFresh: ageMs < maxAgeMs,
    ageMs,
  }
}

export const refreshInitiativesCache = async (params = {}) => {
  const data = await getInitiatives(params)
  initiativesCache.set(getCacheKey(params), { data, timestamp: Date.now() })
  return data
}

export const getInitiativesCached = async (params = {}, maxAgeMs = 3600000) => {
  const snapshot = getInitiativesCacheSnapshot(params, maxAgeMs)
  if (snapshot.data && snapshot.isFresh) return snapshot.data
  return refreshInitiativesCache(params)
}

export const clearInitiativesCache = () => {
  initiativesCache.clear()
}

export const createInitiative = async (
  payload,
  idempotencyKey = createInitiativeIdempotencyKey(),
) => {
  const response = await api.post(API_PATHS.initiatives, payload, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  })
  clearInitiativesCache()
  return response.data
}

export const updateInitiative = async payload => {
  const response = await api.put(API_PATHS.initiatives, payload)
  clearInitiativesCache()
  return response.data
}

export const deleteInitiative = async initiativeId => {
  const response = await api.delete(API_PATHS.initiativeById(initiativeId))
  clearInitiativesCache()
  return response.data
}
