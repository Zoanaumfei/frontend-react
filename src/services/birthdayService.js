import api from '../api/axios'

export const createBirthday = async payload => {
  const response = await api.post('/api/v1/birthdays', payload)
  return response.data
}

export const getBirthdays = async (params = {}) => {
  const response = await api.get('/api/v1/birthdays', { params })
  return response.data
}

const birthdaysCache = new Map()

const getCacheKey = params => JSON.stringify(params || {})

export const getBirthdaysCacheSnapshot = (params = {}, maxAgeMs = 3600000) => {
  const cacheKey = getCacheKey(params)
  const cached = birthdaysCache.get(cacheKey)
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

export const refreshBirthdaysCache = async (params = {}) => {
  const data = await getBirthdays(params)
  birthdaysCache.set(getCacheKey(params), { data, timestamp: Date.now() })
  return data
}

export const getBirthdaysCached = async (params = {}, maxAgeMs = 3600000) => {
  const snapshot = getBirthdaysCacheSnapshot(params, maxAgeMs)
  if (snapshot.data && snapshot.isFresh) return snapshot.data
  return refreshBirthdaysCache(params)
}

export const deleteBirthday = async (month, name) => {
  const response = await api.delete(
    `/api/v1/birthdays/${encodeURIComponent(month)}/${encodeURIComponent(name)}`,
  )
  return response.data
}
