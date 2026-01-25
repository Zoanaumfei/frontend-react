import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getItemsByStatus } from '../services/itemService'

function ExternalDashboardPage() {
  const [pendingRequests, setPendingRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const fetchPending = async () => {
      try {
        const items = await getItemsByStatus('SAVED')
        if (isActive) {
          const normalized = Array.isArray(items) ? items : []
          setPendingRequests(
            normalized.filter(item => item?.status === 'SAVED'),
          )
        }
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load pending requests.'
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

  const pendingCount = pendingRequests.length

  const formatDate = value => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-GB')
  }

  const getRequestId = request =>
    request?.requestId || request?.id || request?.partNumberVersion || 'unknown'

  return (
    <section className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Supplier workspace</p>
          <h1>Timing plan requests</h1>
          <p className="dashboard__lead">
            Review customer requests, complete the timing plan, and submit your
            updates back to the requester.
          </p>
        </div>
        <div className="dashboard__stat">
          <span className="dashboard__stat-label">Open requests</span>
          <span className="dashboard__stat-value">{pendingCount}</span>
        </div>
      </header>

      <div className="dashboard__body">
        <section className="request-panel">
          <div className="request-panel__header">
            <h2>Pending requests</h2>
            <span className="request-panel__count">{pendingCount} pending</span>
          </div>
          <div className="request-list">
            {isLoading ? (
              <p className="request-card__meta">Loading requests...</p>
            ) : error ? (
              <p className="login-form__error" role="alert">
                {error}
              </p>
            ) : pendingRequests.length === 0 ? (
              <p className="request-card__meta">No pending requests.</p>
            ) : (
              pendingRequests.map(request => {
                const requestId = getRequestId(request)
                return (
                  <article key={requestId} className="request-card">
                    <div>
                      <p className="request-card__id">{requestId}</p>
                      <h3>Timing plan request</h3>
                      <p className="request-card__meta">
                        {request.supplierID || 'Supplier'} | Updated{' '}
                        {formatDate(request.updatedAt)}
                      </p>
                    </div>
                    <Link
                      className="request-card__action"
                      to={`/external-requests/${encodeURIComponent(requestId)}`}
                    >
                      Start request
                    </Link>
                  </article>
                )
              })
            )}
          </div>
        </section>

        <aside className="dashboard__side card">
          <h3>How it works</h3>
          <ol className="dashboard__steps">
            <li>Open a request to view the timing plan details.</li>
            <li>Complete the milestones and attach your evidence.</li>
            <li>Submit updates to notify the customer instantly.</li>
          </ol>
          <p className="dashboard__note">
            Data is stored securely in DynamoDB and synced to the customer view.
          </p>
        </aside>
      </div>
    </section>
  )
}

export default ExternalDashboardPage

