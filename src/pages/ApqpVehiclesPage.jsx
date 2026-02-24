import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ApqpLayout from '../components/apqp/ApqpLayout'
import { APQP_STATUS } from '../constants/apqpMockData'
import {
  getApqpTemplates,
  getApqpVehicleParts,
  getApqpVehicles,
} from '../services/apqpService'

const STATUS_OPTIONS = Object.values(APQP_STATUS)

const toDateLabel = value => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('en-US')
}

function ApqpVehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [templates, setTemplates] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      try {
        const [vehicleList, templateList] = await Promise.all([
          getApqpVehicles(),
          getApqpTemplates(),
        ])

        const perVehicle = await Promise.all(
          vehicleList.map(async vehicle => {
            const parts = await getApqpVehicleParts(vehicle.id)
            const template = templateList.find(item => item.id === vehicle.templateId)
            const finalStageId = template?.stages?.[template.stages.length - 1]?.id
            const total = parts.length
            const inFinal = parts.filter(item => item.currentStageId === finalStageId).length
            const percent = total > 0 ? Math.round((inFinal / total) * 100) : 0

            return [vehicle.id, { total, inFinal, percent }]
          }),
        )

        if (!isMounted) return

        setVehicles(vehicleList)
        setTemplates(templateList)
        setProgressMap(Object.fromEntries(perVehicle))
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()
    return vehicles.filter(vehicle => {
      if (statusFilter !== 'all' && vehicle.status !== statusFilter) return false
      if (!normalizedSearch) return true

      const haystack = [
        vehicle.name,
        vehicle.customer,
        vehicle.platform,
        vehicle.status,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [searchValue, statusFilter, vehicles])

  return (
    <ApqpLayout title="Vehicles">
      <section className="apqp-page apqp-vehicles" aria-labelledby="apqp-vehicles-title">
        <header className="apqp-page__header">
          <div>
            <p className="apqp-page__eyebrow">Portfolio</p>
            <h2 id="apqp-vehicles-title" className="apqp-page__title">
              Vehicles
            </h2>
            <p className="apqp-page__lead">
              Manage vehicle programs and track APQP progress by part completion.
            </p>
          </div>
          <button type="button" className="apqp-btn apqp-btn--primary">
            Create Vehicle
          </button>
        </header>

        <div className="apqp-page__filters">
          <label className="apqp-filter">
            <span>Search</span>
            <input
              type="search"
              value={searchValue}
              onChange={event => setSearchValue(event.target.value)}
              placeholder="Vehicle, customer, platform..."
            />
          </label>
          <label className="apqp-filter">
            <span>Status</span>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="apqp-loading-grid" aria-live="polite">
            <div className="apqp-loading-row" />
            <div className="apqp-loading-row" />
            <div className="apqp-loading-row" />
          </div>
        ) : null}

        {!isLoading && filteredVehicles.length === 0 ? (
          <article className="apqp-empty-state">
            <h3>No vehicles found</h3>
            <p>Try adjusting filters or create the first vehicle program.</p>
          </article>
        ) : null}

        {!isLoading && filteredVehicles.length > 0 ? (
          <div className="apqp-table-wrap">
            <table className="apqp-table">
              <thead>
                <tr>
                  <th>Vehicle Name</th>
                  <th>Customer</th>
                  <th>Platform</th>
                  <th>SOP Date</th>
                  <th>Status</th>
                  <th>APQP Template</th>
                  <th>Progress</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map(vehicle => {
                  const template = templates.find(item => item.id === vehicle.templateId)
                  const progress = progressMap[vehicle.id] || { percent: 0, inFinal: 0, total: 0 }

                  return (
                    <tr key={vehicle.id}>
                      <td>{vehicle.name}</td>
                      <td>{vehicle.customer}</td>
                      <td>{vehicle.platform}</td>
                      <td>{toDateLabel(vehicle.sopDate)}</td>
                      <td>
                        <span className="apqp-badge apqp-badge--neutral">{vehicle.status}</span>
                      </td>
                      <td>{template?.name || '--'}</td>
                      <td>
                        <div className="apqp-progress">
                          <div
                            className="apqp-progress__bar"
                            style={{ width: `${progress.percent}%` }}
                          />
                          <span className="apqp-progress__meta">
                            {progress.percent}% ({progress.inFinal}/{progress.total})
                          </span>
                        </div>
                      </td>
                      <td>
                        <Link className="apqp-btn apqp-btn--ghost" to={`/apqp/vehicles/${vehicle.id}`}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </ApqpLayout>
  )
}

export default ApqpVehiclesPage

