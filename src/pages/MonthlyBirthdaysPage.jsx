import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getBirthdays,
  getBirthdaysCacheSnapshot,
  refreshBirthdaysCache,
} from '../services/birthdayService'
import { getCachedPhotoUrl, setCachedPhotoUrl } from '../services/birthdayPhotoCache'
import { getDownloadUrl } from '../utils/fileTransfer'

const getMonthLabel = value => {
  const month = Number(value)
  if (!month || month < 1 || month > 12) return '--'
  return new Date(new Date().getFullYear(), month - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '')
}

function getInitials(name) {
  if (!name) return 'NA'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const second = parts[1]?.[0] || ''
  return `${first}${second}`.toUpperCase()
}

function MonthlyBirthdaysPage({
  useCache = false,
  cacheTtlMs = 3600000,
  autoRefresh = true,
}) {
  const navigate = useNavigate()
  const [birthdays, setBirthdays] = useState([])
  const [photoUrls, setPhotoUrls] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fileServiceMessage, setFileServiceMessage] = useState('')
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const displayBirthdays = birthdays.flatMap(record => {
    const items = []
    const personalMonth = Number(record?.month)
    const corporateMonth = Number(record?.corporate_month)

    if (personalMonth === currentMonth) {
      items.push({
        ...record,
        type: 'personal',
        displayMonth: personalMonth,
        displayDay: record?.day ?? '--',
      })
    }

    if (corporateMonth === currentMonth) {
      const corporateYear = Number(record?.corporate_year)
      const tenure = Number.isFinite(corporateYear)
        ? currentYear - corporateYear
        : null
      items.push({
        ...record,
        type: 'corporate',
        displayMonth: corporateMonth,
        displayDay: '--',
        displayTenure: tenure,
      })
    }

    return items
  })

  useEffect(() => {
    let isMounted = true

    const applyBirthdays = data => {
      if (!isMounted) return
      setBirthdays(Array.isArray(data) ? data : [])
    }

    const refreshBirthdays = async ({ showLoading } = { showLoading: true }) => {
      if (showLoading) {
        setIsLoading(true)
      }
      setErrorMessage('')
      try {
        const data = useCache
          ? await refreshBirthdaysCache({})
          : await getBirthdays()
        applyBirthdays(data)
      } catch {
        if (!isMounted) return
        setErrorMessage('Nao foi possivel carregar os aniversariantes.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (useCache) {
      const snapshot = getBirthdaysCacheSnapshot({}, cacheTtlMs)
      const hasSnapshotData = Array.isArray(snapshot.data)
      if (snapshot.data) {
        applyBirthdays(snapshot.data)
      }
      setIsLoading(!hasSnapshotData)

      if (!hasSnapshotData) {
        refreshBirthdays({ showLoading: true })
      } else if (!snapshot.isFresh && autoRefresh) {
        refreshBirthdays({ showLoading: false })
      }

      let intervalId
      if (autoRefresh) {
        intervalId = setInterval(() => {
          refreshBirthdays({ showLoading: false })
        }, cacheTtlMs)
      }

      return () => {
        isMounted = false
        if (intervalId) clearInterval(intervalId)
      }
    }

    setIsLoading(true)
    refreshBirthdays()

    return () => {
      isMounted = false
    }
  }, [useCache, cacheTtlMs, autoRefresh])

  useEffect(() => {
    let isMounted = true
    const keys = Array.from(
      new Set(
        birthdays
          .map(record => record?.photo_key)
          .filter(key => typeof key === 'string' && key.length > 0),
      ),
    )
    const cachedEntries = useCache
      ? keys
          .map(key => [key, getCachedPhotoUrl(key)])
          .filter(([, url]) => typeof url === 'string' && url.length > 0)
      : []

    if (useCache && cachedEntries.length > 0) {
      const cacheUpdates = cachedEntries.filter(([key]) => !photoUrls[key])
      if (cacheUpdates.length > 0) {
        setPhotoUrls(prev => {
          const next = { ...prev }
          cacheUpdates.forEach(([key, url]) => {
            next[key] = url
          })
          return next
        })
      }
    }

    const missingKeys = keys.filter(key => {
      if (photoUrls[key]) return false
      if (useCache && getCachedPhotoUrl(key)) return false
      return true
    })

    if (missingKeys.length === 0) return () => {
      isMounted = false
    }

    const loadPhotos = async () => {
      try {
        const entries = await Promise.all(
          missingKeys.map(async key => {
            const downloadUrl = await getDownloadUrl(key)
            return [key, downloadUrl]
          }),
        )
        if (!isMounted) return
        const hasFileServiceUnavailable = entries.some(([, url]) => !url)
        setFileServiceMessage(
          hasFileServiceUnavailable
            ? 'File service is temporarily unavailable. Photos may not be displayed.'
            : '',
        )
        setPhotoUrls(prev => {
          const next = { ...prev }
          entries.forEach(([key, url]) => {
            if (url) next[key] = url
          })
          return next
        })
        if (useCache) {
          entries.forEach(([key, url]) => {
            if (url) setCachedPhotoUrl(key, url)
          })
        }
      } catch {
        setFileServiceMessage(
          'File service is temporarily unavailable. Photos may not be displayed.',
        )
      }
    }

    loadPhotos()

    return () => {
      isMounted = false
    }
  }, [birthdays, photoUrls, useCache])

  return (
    <section
      className="monthly-birthdays monthly-birthdays--playful"
      aria-labelledby="monthly-birthdays-title"
    >
      <div className="monthly-birthdays__content">
        <header className="monthly-birthdays__hero monthly-birthdays__hero--playful">
          <div>
            <p className="monthly-birthdays__eyebrow">Aniversariantes do mes</p>
            <h1 id="monthly-birthdays-title" className="monthly-birthdays__title">
              Monthly Birthdays
            </h1>
          </div>
          <div className="monthly-birthdays__controls">
            <button
              type="button"
              className="monthly-birthdays__new"
              onClick={() => navigate('/monthly-birthdays-management')}
            >
              Manage birthdays
            </button>
            <label className="monthly-birthdays__search" aria-label="Buscar aniversariantes">
              <span className="monthly-birthdays__search-icon" aria-hidden="true">
                Buscar
              </span>
              <input type="search" name="birthdaySearch" placeholder="Buscar aniversariantes..." />
            </label>
          </div>
        </header>

        <div className="monthly-birthdays__card monthly-birthdays__card--playful">
          <div className="monthly-birthdays__calendar" role="list">
            {isLoading && (
              <p className="monthly-birthdays__meta">Carregando aniversariantes...</p>
            )}
            {errorMessage && <p className="login-form__error">{errorMessage}</p>}
            {fileServiceMessage && (
              <p className="monthly-birthdays__meta">{fileServiceMessage}</p>
            )}
            {!isLoading && !errorMessage && displayBirthdays.length === 0 && (
              <p className="monthly-birthdays__meta">
                Nenhum aniversariante encontrado para este mes.
              </p>
            )}
            {displayBirthdays.map((person, index) => {
              const monthLabel = getMonthLabel(person.displayMonth)
              const monthLabelUpper =
                monthLabel === '--' ? monthLabel : monthLabel.toUpperCase()
              return (
                <article
                  key={`${person.type}-${person.displayMonth}-${person.name}`}
                  role="listitem"
                  className={`birthday-card birthday-card--tone-${index % 4}`}
                >
                  <div className="birthday-card__date" aria-hidden="true">
                    <span className="birthday-card__day">{monthLabelUpper}</span>
                    <span className="birthday-card__month">{person.displayDay}</span>
                  </div>
                  <div className="birthday-card__content">
                    <div className="birthday-card__avatar">
                      {person.photo_key && photoUrls[person.photo_key] ? (
                        <img src={photoUrls[person.photo_key]} alt={person.name} />
                      ) : (
                        getInitials(person.name)
                      )}
                    </div>
                    <div>
                      <h2 className="birthday-card__name">{person.name}</h2>
                      <p className="birthday-card__meta">
                        {person.type === 'corporate'
                          ? `Este mes esta fazendo ${
                              Number.isFinite(person.displayTenure)
                                ? `${person.displayTenure} anos de empresa`
                                : '--'
                            }`
                          : 'Este mes esta fazendo aniversario'}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="monthly-birthdays__footer monthly-birthdays__footer--playful">
            <p className="monthly-birthdays__meta">
              Mostrando {displayBirthdays.length} aniversariantes do mes
            </p>
            <div className="monthly-birthdays__pagination" role="navigation" aria-label="Paginacao">
              <button type="button" className="page-btn" disabled>
                Anterior
              </button>
              <span className="page-btn page-btn--active" aria-current="page">
                1
              </span>
              <button type="button" className="page-btn" disabled>
                Proxima
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MonthlyBirthdaysPage
