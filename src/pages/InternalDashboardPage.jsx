import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllItems, getItemsByStatus } from '../services/itemService'

function InternalDashboardPage() {
  const [pendingExternal, setPendingExternal] = useState([])
  const [pendingInternal, setPendingInternal] = useState([])
  const [totalRequests, setTotalRequests] = useState(0)
  const [supplierFilter, setSupplierFilter] = useState('')
  const [internalSupplierFilter, setInternalSupplierFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const fetchPending = async () => {
      try {
        const [allItems, pendingItems, internalItems] = await Promise.all([
          getAllItems(),
          getItemsByStatus('SAVED'),
          getItemsByStatus('SENT'),
        ])
        if (isActive) {
          setTotalRequests(Array.isArray(allItems) ? allItems.length : 0)
          setPendingExternal(Array.isArray(pendingItems) ? pendingItems : [])
          setPendingInternal(Array.isArray(internalItems) ? internalItems : [])
        }
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load external pendencies.'
        if (isActive) {
          setError(message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    fetchPending()

    return () => {
      isActive = false
    }
  }, [])

  const summaryStats = [
    { label: 'Total requests', value: totalRequests },
    { label: 'In review', value: pendingInternal.length },
    { label: 'Completed', value: 9 },
    { label: 'Overdue', value: 5 },
  ]

  const filteredPendencies = pendingExternal.filter(item => {
    if (!supplierFilter.trim()) return true
    return item.supplierID
      ?.toLowerCase()
      .includes(supplierFilter.trim().toLowerCase())
  })

  const filteredInternalPendencies = pendingInternal.filter(item => {
    if (!internalSupplierFilter.trim()) return true
    return item.supplierID
      ?.toLowerCase()
      .includes(internalSupplierFilter.trim().toLowerCase())
  })

  const formatDate = value => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-GB')
  }
  const splitPartNumberVersion = value => {
    if (!value) return { partNumber: 'N/A', version: 'N/A' }
    const [partNumber, version] = value.split('#')
    return {
      partNumber: partNumber || 'N/A',
      version: version || 'N/A',
    }
  }

  return (
    <section className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Internal operations</p>
          <h1>Customer timing plans</h1>
          <p className="dashboard__lead">
            Track progress across supplier requests, monitor fulfillment, and
            resolve external pendencies before they impact delivery.
          </p>
        </div>
        <div className="dashboard__actions">
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Open pendencies</span>
            <span className="dashboard__stat-value">
              {pendingInternal.length}
            </span>
          </div>
          <Link className="request-card__action" to="/internal-requests/new">
            New request
          </Link>
        </div>
      </header>

      <section className="dashboard__summary">
        {summaryStats.map(stat => (
          <div key={stat.label} className="summary-card">
            <span className="summary-card__label">{stat.label}</span>
            <span className="summary-card__value">{stat.value}</span>
          </div>
        ))}
      </section>

      <div className="dashboard__body">
        <div className="request-stack">
          <section className="request-panel">
            <div className="request-panel__header">
              <div>
                <h2>Internal pendencies</h2>
                <span className="request-panel__count">
                  {filteredInternalPendencies.length} pending
                </span>
              </div>
              <div className="request-panel__filters">
                <label
                  className="request-panel__label"
                  htmlFor="internalSupplierFilter"
                >
                  Supplier filter
                </label>
                <input
                  id="internalSupplierFilter"
                  className="request-panel__input"
                  type="text"
                  placeholder="Search supplier ID"
                  value={internalSupplierFilter}
                  onChange={event => setInternalSupplierFilter(event.target.value)}
                />
              </div>
            </div>
            <div className="request-list__header request-list__header--table">
              <span>Part number</span>
              <span>Version</span>
              <span>Supplier</span>
              <span>Status</span>
              <span>Updated</span>
            </div>
            <div className="request-list request-list--table">
              {isLoading ? (
                <p className="request-card__meta">Loading pendencies...</p>
              ) : error ? (
                <p className="login-form__error" role="alert">
                  {error}
                </p>
              ) : filteredInternalPendencies.length === 0 ? (
                <p className="request-card__meta">No pendencies found.</p>
              ) : (
                filteredInternalPendencies.map(item => {
                  const { partNumber, version } = splitPartNumberVersion(
                    item.partNumberVersion,
                  )
                  return (
                    <Link
                      key={`${item.partNumberVersion}-${item.supplierID}`}
                      className="request-card request-card--table request-card--link"
                      to={`/requests/${encodeURIComponent(item.supplierID)}/${encodeURIComponent(item.partNumberVersion)}`}
                    >
                      <span className="request-card__id">{partNumber}</span>
                      <span className="request-card__meta">{version}</span>
                      <span className="request-card__meta">{item.supplierID}</span>
                      <span className="request-card__meta">{item.status}</span>
                      <span className="request-card__meta">
                        {formatDate(item.updatedAt)}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>
          </section>

          <section className="request-panel">
            <div className="request-panel__header">
              <div>
                <h2>External pendencies</h2>
                <span className="request-panel__count">
                  {filteredPendencies.length} pending
                </span>
              </div>
              <div className="request-panel__filters">
                <label className="request-panel__label" htmlFor="supplierFilter">
                  Supplier filter
                </label>
                <input
                  id="supplierFilter"
                  className="request-panel__input"
                  type="text"
                  placeholder="Search supplier ID"
                  value={supplierFilter}
                  onChange={event => setSupplierFilter(event.target.value)}
                />
              </div>
            </div>
            <div className="request-list__header request-list__header--table">
              <span>Part number</span>
              <span>Version</span>
              <span>Supplier</span>
              <span>Status</span>
              <span>Updated</span>
            </div>
            <div className="request-list request-list--table">
              {isLoading ? (
                <p className="request-card__meta">Loading pendencies...</p>
              ) : error ? (
                <p className="login-form__error" role="alert">
                  {error}
                </p>
              ) : filteredPendencies.length === 0 ? (
                <p className="request-card__meta">No pendencies found.</p>
              ) : (
                filteredPendencies.map(item => {
                  const { partNumber, version } = splitPartNumberVersion(
                    item.partNumberVersion,
                  )
                  return (
                    <Link
                      key={`${item.partNumberVersion}-${item.supplierID}`}
                      className="request-card request-card--table request-card--link"
                      to={`/requests/${encodeURIComponent(item.supplierID)}/${encodeURIComponent(item.partNumberVersion)}`}
                    >
                      <span className="request-card__id">{partNumber}</span>
                      <span className="request-card__meta">{version}</span>
                      <span className="request-card__meta">{item.supplierID}</span>
                      <span className="request-card__meta">{item.status}</span>
                      <span className="request-card__meta">
                        {formatDate(item.updatedAt)}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>
          </section>
        </div>

        <aside className="dashboard__side card">
          <h3>Status overview</h3>
          <ul className="dashboard__bullets">
            <li>28 requests completed this quarter.</li>
            <li>9 timing plans are under internal review.</li>
            <li>5 requests are currently overdue.</li>
          </ul>
          <p className="dashboard__note">
            Use the requests list to follow up with suppliers and clear
            blockers.
          </p>
        </aside>
      </div>
    </section>
  )
}

export default InternalDashboardPage







