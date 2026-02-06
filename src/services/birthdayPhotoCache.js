const photoCache = new Map()

export const getCachedPhotoUrl = key => {
  if (!key) return null
  return photoCache.get(key) || null
}

export const setCachedPhotoUrl = (key, url) => {
  if (!key || !url) return
  photoCache.set(key, url)
}

export const clearBirthdayPhotoCache = () => {
  photoCache.clear()
}
