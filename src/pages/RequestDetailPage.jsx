import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getItemByKey } from '../services/itemService'
import { dateToWeekYear, ymdToDate } from '../utils/weekDate'

function RequestDetailPage() {
  const { supplierID, partNumberVersion } = useParams()
  const [item, setItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const fetchItem = async () => {
      try {
        const data = await getItemByKey(supplierID, partNumberVersion)
        if (isActive) {
          setItem(data)
        }
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load request.'
        if (isActive) {
          setError(message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    fetchItem()

    return () => {
      isActive = false
    }
  }, [supplierID, partNumberVersion])

  return (
    <section className="card">
      <div className="page-header">
        <div>
          <p className="dashboard__eyebrow">Request details</p>
          <h1>
            {supplierID} / {partNumberVersion}
          </h1>
          <p className="dashboard__lead">
            Review all submitted fields for this request.
          </p>
        </div>
        <Link className="request-card__action" to="/internal-dashboard">
          Back to dashboard
        </Link>
      </div>

      {isLoading ? (
        <p className="request-card__meta">Loading request...</p>
      ) : error ? (
        <p className="login-form__error" role="alert">
          {error}
        </p>
      ) : item ? (
        <div className="detail-grid">
          <div className="detail-item">
            <span>Part number</span>
            <strong>{item.partNumberVersion}</strong>
          </div>
          <div className="detail-item">
            <span>Supplier</span>
            <strong>{item.supplierID}</strong>
          </div>
          <div className="detail-item">
            <span>Process number</span>
            <strong>{item.processNumber || '—'}</strong>
          </div>
          <div className="detail-item">
            <span>Part description</span>
            <strong>{item.partDescription || '—'}</strong>
          </div>
          <div className="detail-item">
            <span>TBT-VFF</span>
            <strong>
              {dateToWeekYear(ymdToDate(item.tbtVffDate)) || '—'}
            </strong>
            <small className="detail-item__hint">
              {item.tbtVffDate || 'YYYY-MM-DD'}
            </small>
          </div>
          <div className="detail-item">
            <span>TBT-PVS</span>
            <strong>
              {dateToWeekYear(ymdToDate(item.tbtPvsDate)) || '—'}
            </strong>
            <small className="detail-item__hint">
              {item.tbtPvsDate || 'YYYY-MM-DD'}
            </small>
          </div>
          <div className="detail-item">
            <span>TBT-0S</span>
            <strong>
              {dateToWeekYear(ymdToDate(item.tbt0sDate)) || '—'}
            </strong>
            <small className="detail-item__hint">
              {item.tbt0sDate || 'YYYY-MM-DD'}
            </small>
          </div>
          <div className="detail-item">
            <span>SOP</span>
            <strong>{dateToWeekYear(ymdToDate(item.sopDate)) || '—'}</strong>
            <small className="detail-item__hint">
              {item.sopDate || 'YYYY-MM-DD'}
            </small>
          </div>
          <div className="detail-item">
            <span>Status</span>
            <strong>{item.status}</strong>
          </div>
          <div className="detail-item">
            <span>Created at</span>
            <strong>{item.createdAt}</strong>
          </div>
          <div className="detail-item">
            <span>Updated at</span>
            <strong>{item.updatedAt}</strong>
          </div>
        </div>
      ) : (
        <p className="request-card__meta">No request found.</p>
      )}
    </section>
  )
}

export default RequestDetailPage




