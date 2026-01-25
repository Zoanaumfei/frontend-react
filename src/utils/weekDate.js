export const weekYearToDate = value => {
  if (!value || typeof value !== 'string') return null

  const match = value.trim().match(/^(\d{2})\/(\d{2})$/)
  if (!match) return null

  const week = Number(match[1])
  const year = 2000 + Number(match[2])

  if (!Number.isInteger(week) || week < 1 || week > 53) return null
  if (!Number.isInteger(year)) return null

  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const week1Monday = new Date(jan4)
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1))

  const date = new Date(week1Monday)
  date.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7)

  return date
}

export const dateToWeekYear = value => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
  const day = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day)

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7)
  const year = utcDate.getUTCFullYear()

  return `${String(week).padStart(2, '0')}/${String(year).slice(-2)}`
}

export const dateToYmd = value => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}/${month}/${day}`
}

export const ymdToDate = value => {
  if (!value || typeof value !== 'string') return null

  const match = value.trim().match(/^(\d{4})\/(\d{2})\/(\d{2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  return new Date(Date.UTC(year, month - 1, day))
}
