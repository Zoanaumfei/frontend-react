import { useEffect, useMemo, useState } from 'react'
import { dateToWeekYear, dateToYmd, ymdToDate } from '../utils/weekDate'
import {
  getProjectDashboardCache,
  setProjectDashboardCache,
} from '../services/projectDashboardCache'
import { getDueEventsByRange } from '../services/projectService'

const getStartOfIsoWeek = value => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
  const day = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() - (day - 1))
  return utcDate
}

const DUE_RANGE_DAYS = 21
const DUE_RANGE_LIMIT = 100

const normalizeEventDate = item => {
  const raw = item?.dueDate || item?.date
  if (!raw) return null
  return ymdToDate(raw)
}

function ProjectDashboardPage({ useCache = false }) {
  const [eventsByWeek, setEventsByWeek] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    if (useCache) {
      const cached = getProjectDashboardCache()
      if (cached?.eventsByWeek) {
        setEventsByWeek(cached.eventsByWeek)
        setErrorMessage('')
        setIsLoading(false)
        return () => {
          isMounted = false
        }
      }
    }

    const loadEvents = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const startDate = dateToYmd(getStartOfIsoWeek(new Date()))
        const response = await getDueEventsByRange({
          startDate,
          days: DUE_RANGE_DAYS,
          limit: DUE_RANGE_LIMIT,
        })
        const items = (Array.isArray(response?.dates) ? response.dates : []).flatMap(
          dayEntry => {
            if (!Array.isArray(dayEntry?.items)) return []
            return dayEntry.items.map(item => {
              if (item?.dueDate || item?.date || !dayEntry?.date) return item
              return { ...item, dueDate: dayEntry.date }
            })
          },
        )

        if (!isMounted) return

        const grouped = items.reduce((acc, item) => {
          const dueDate = normalizeEventDate(item)
          const weekKey = dueDate ? dateToWeekYear(dueDate) : 'N/A'
          const startDate = dueDate ? getStartOfIsoWeek(dueDate) : null

          if (!acc[weekKey]) {
            acc[weekKey] = {
              key: weekKey,
              startDate,
              items: [],
            }
          }

          acc[weekKey].items.push(item)
          return acc
        }, {})

        const groupedList = Object.values(grouped)
          .sort((a, b) => {
            const aTime = a.startDate ? a.startDate.getTime() : 0
            const bTime = b.startDate ? b.startDate.getTime() : 0
            if (aTime !== bTime) return aTime - bTime
            return String(a.key).localeCompare(String(b.key))
          })
          .map(group => {
            const sortedItems = [...group.items].sort((left, right) => {
              const leftDate = normalizeEventDate(left)?.getTime() ?? 0
              const rightDate = normalizeEventDate(right)?.getTime() ?? 0
              if (leftDate !== rightDate) return leftDate - rightDate
              return String(left?.projectName ?? '').localeCompare(
                String(right?.projectName ?? ''),
              )
            })

            return { ...group, items: sortedItems }
          })

        if (isMounted) {
          setEventsByWeek(groupedList)
          if (useCache) {
            setProjectDashboardCache({ eventsByWeek: groupedList })
          }
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Unable to load events right now.')
          setEventsByWeek([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadEvents()

    return () => {
      isMounted = false
    }
  }, [useCache])

  const totalEvents = useMemo(
    () => eventsByWeek.reduce((acc, group) => acc + group.items.length, 0),
    [eventsByWeek],
  )

  return (
    <section className="project-dashboard" aria-labelledby="project-dashboard-title">
      <header className="project-dashboard__hero">
        <div>
          <p className="project-dashboard__eyebrow">Area interna</p>
          <h1 id="project-dashboard-title" className="project-dashboard__title">
            Project Dashboard
          </h1>
          <p className="project-dashboard__lead">
            Weekly view for the current week and the next two weeks.
          </p>
        </div>
        <div className="project-dashboard__summary" role="list">
          <div className="project-dashboard__stat" role="listitem">
            <span className="project-dashboard__stat-label">Total events</span>
            <span className="project-dashboard__stat-value">{totalEvents}</span>
          </div>
        </div>
      </header>

      <div className="project-dashboard__content">
        {isLoading ? <p className="project-dashboard__status">Loading events...</p> : null}
        {errorMessage ? (
          <p className="project-dashboard__status project-dashboard__status--error">
            {errorMessage}
          </p>
        ) : null}
        {!isLoading && !errorMessage && eventsByWeek.length === 0 ? (
          <p className="project-dashboard__status">no events</p>
        ) : null}

        {!isLoading && eventsByWeek.length > 0 ? (
          <div className="project-dashboard__weeks">
            {eventsByWeek.map(group => (
              <section key={group.key} className="project-dashboard__week">
                <header className="project-dashboard__week-header">
                  <div>
                    <h2 className="project-dashboard__week-title">
                      Week {group.key}
                    </h2>
                  </div>
                  <span className="project-dashboard__week-count">
                    {group.items.length} events
                  </span>
                </header>

                <div className="project-dashboard__event-list">
                  {group.items.map((item, index) => (
                    <article
                      key={`${item.projectId || 'project'}-${item.dueDate || 'date'}-${index}`}
                      className="project-dashboard__event"
                    >
                      <div className="project-dashboard__event-row project-dashboard__event-row--primary">
                        <div className="project-dashboard__event-item">
                          <span className="project-dashboard__label">Project</span>
                          <span className="project-dashboard__value">
                            {item.projectName || '--'}
                          </span>
                        </div>
                        <div className="project-dashboard__event-item">
                          <span className="project-dashboard__label">Phase</span>
                          <span className="project-dashboard__value">
                            {item.phase || '--'}
                          </span>
                        </div>
                        <div className="project-dashboard__event-item">
                          <span className="project-dashboard__label">Gate</span>
                          <span className="project-dashboard__value">
                            {item.gate || '--'}
                          </span>
                        </div>
                      </div>
                      <div className="project-dashboard__event-row project-dashboard__event-row--secondary">
                        <div className="project-dashboard__event-item">
                          <span className="project-dashboard__label">Project ID</span>
                          <span className="project-dashboard__value">
                            {item.projectId || '--'}
                          </span>
                        </div>
                        <div className="project-dashboard__event-item">
                          <span className="project-dashboard__label">ALS</span>
                          <span className="project-dashboard__value">
                            {item.als ?? '--'}
                          </span>
                        </div>
                        <div className="project-dashboard__event-item">
                          <span className="project-dashboard__label">ALS Description</span>
                          <span className="project-dashboard__value">
                            {item.alsDescription || '--'}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default ProjectDashboardPage
