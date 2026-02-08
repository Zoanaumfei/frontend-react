import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getItemsByStatus } from '../services/itemService'
import { ITEM_STATUS } from '../constants'
import { dateToWeekYear, weekYearToDate, ymdToDate } from '../utils/weekDate'

const EXTRA_FIELD_KEYS = [
  'externalField1',
  'externalField2',
  'externalField3',
  'externalField4',
  'externalField5',
]
const QUALITY_FIELDS = new Set([
  'externalField1',
  'externalField2',
  'externalField3',
  'externalField4',
])
const QUALITY_OPTIONS = [
  'Prototype',
  'Pre Off Tool',
  'Off Tool',
  'Off Tool Off Process',
]
const VFF_GREEN_OPTIONS = new Set([
  'Pre Off Tool',
  'Off Tool',
  'Off Tool Off Process',
])
const EXTRA_FIELD_LABELS = {
  externalField1: 'VFF Delivery',
  externalField2: 'PVS Delivery',
  externalField3: 'S0 Delivery',
  externalField4: 'SOP Delivery',
  externalField5: 'External field 5',
}
const WEEK_DATE_KEYS = new Set([
  'sopDate',
  'tbt0sDate',
  'tbtPvsDate',
  'tbtVffDate',
])

function ExternalRequestPage() {
  const { requestId } = useParams()
  const [request, setRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [extraFields, setExtraFields] = useState(() =>
    EXTRA_FIELD_KEYS.reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
  )
  const [qualitySelections, setQualitySelections] = useState(() =>
    EXTRA_FIELD_KEYS.reduce((acc, key) => {
      if (QUALITY_FIELDS.has(key)) {
        acc[key] = ''
      }
      return acc
    }, {}),
  )

  useEffect(() => {
    let isActive = true

    const fetchRequest = async () => {
      try {
        const items = await getItemsByStatus(ITEM_STATUS.SAVED)
        const normalized = Array.isArray(items) ? items : []
        const matched = normalized.find(item => {
          if (!item) return false
          return (
            item.requestId === requestId ||
            item.id === requestId ||
            item.partNumberVersion === requestId
          )
        })
        if (isActive) {
          setRequest(matched || null)
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

    fetchRequest()

    return () => {
      isActive = false
    }
  }, [requestId])

  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === '') return 'N/A'
    if (WEEK_DATE_KEYS.has(key)) {
      const weekYear = dateToWeekYear(ymdToDate(value))
      return weekYear || 'N/A'
    }
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    try {
      return JSON.stringify(value)
    } catch {
      return 'N/A'
    }
  }

  const formatDate = value => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-GB')
  }

  const requestEntries = request
    ? Object.entries(request).sort(([a], [b]) => a.localeCompare(b))
    : []

  const handleExtraChange = event => {
    const { name, value } = event.target
    setExtraFields(prev => ({ ...prev, [name]: value }))
  }

  const handleQualityChange = (fieldKey, option) => {
    setQualitySelections(prev => ({
      ...prev,
      [fieldKey]: option,
    }))
  }

  const getTrafficLight = fieldKey => {
    const selectedOption = qualitySelections[fieldKey]
    if (!selectedOption) return 'red'
    if (fieldKey === 'externalField1') {
      if (VFF_GREEN_OPTIONS.has(selectedOption)) {
        return 'green'
      }
      if (selectedOption === 'Prototype') {
        return 'yellow'
      }
    }
    if (fieldKey === 'externalField2') {
      if (selectedOption === 'Off Tool Off Process') {
        return 'green'
      }
      if (selectedOption === 'Off Tool') {
        return 'yellow'
      }
      if (selectedOption === 'Pre Off Tool' || selectedOption === 'Prototype') {
        return 'red'
      }
    }
    if (fieldKey === 'externalField3' || fieldKey === 'externalField4') {
      if (selectedOption === 'Off Tool Off Process') {
        return 'green'
      }
      return 'red'
    }
    return 'red'
  }

  const getTimingLight = fieldKey => {
    const timingKeyMap = {
      externalField1: 'tbtVffDate',
      externalField2: 'tbtPvsDate',
      externalField3: 'tbt0sDate',
      externalField4: 'sopDate',
    }
    const targetKey = timingKeyMap[fieldKey]
    if (!targetKey) return 'red'

    const deliveryValue = extraFields[fieldKey]
    const deliveryDate = weekYearToDate(deliveryValue)
    const targetDate = ymdToDate(request?.[targetKey])
    if (!deliveryDate || !targetDate) return 'red'
    return targetDate.getTime() > deliveryDate.getTime() ? 'green' : 'red'
  }

  return (
    <section className="card">
      <div className="page-header">
        <div>
          <p className="dashboard__eyebrow">External request</p>
          <h1>Timing plan request</h1>
          <p className="dashboard__lead">
            Review all fields for this request and complete any additional
            inputs requested.
          </p>
        </div>
        <div>
          <div className="dashboard__stat">
            <span className="dashboard__stat-label">Created date</span>
            <span className="dashboard__stat-value">
              {formatDate(request?.createdAt)}
            </span>
          </div>
          <div style={{ marginTop: '12px', textAlign: 'right' }}>
            <Link className="request-card__action" to="/external-dashboard">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>

      <section className="request-panel">
        <div className="request-panel__header">
          <div>
            <h2>Request fields</h2>
            <span className="request-panel__count">
              {requestEntries.length} fields
            </span>
          </div>
        </div>
        <div>
          {isLoading ? (
            <p className="request-card__meta">Loading request...</p>
          ) : error ? (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          ) : requestEntries.length === 0 ? (
            <p className="request-card__meta">No request found.</p>
          ) : (
            <div className="detail-grid">
              {requestEntries
                .filter(
                  ([key]) =>
                    key !== 'createdAt' &&
                    key !== 'updatedAt' &&
                    key !== 'message' &&
                    key !== 'status',
                )
                .map(([key, value]) => (
                  <div key={key} className="detail-item">
                    <span>{key}</span>
                    <strong>{formatValue(key, value)}</strong>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      <section className="request-panel" style={{ marginTop: '24px' }}>
        <div className="request-panel__header">
          <div>
            <h2>Additional fields (optional)</h2>
            <span className="request-panel__count">5 fields</span>
          </div>
        </div>
        <div className="login-form">
          {EXTRA_FIELD_KEYS.map((fieldKey, index) => (
            <div key={fieldKey} className="external-field-row">
              <label className="login-form__field">
                <span className="external-field__header">
                  <span>
                    {EXTRA_FIELD_LABELS[fieldKey] ||
                      `External field ${index + 1}`}
                  </span>
                  {QUALITY_FIELDS.has(fieldKey) ? (
                    <span
                      className={`traffic-light traffic-light--${getTimingLight(
                        fieldKey,
                      )}`}
                      aria-label="Timing status"
                      title="Timing status"
                    />
                  ) : null}
                </span>
                <input
                  type="text"
                  name={fieldKey}
                  placeholder="WW/YY"
                  value={extraFields[fieldKey]}
                  onChange={handleExtraChange}
                />
              </label>
              {QUALITY_FIELDS.has(fieldKey) ? (
                <label className="login-form__field">
                  <span className="external-quality__header">
                    <span>Quality part</span>
                    <span
                      className={`traffic-light traffic-light--${getTrafficLight(
                        fieldKey,
                      )}`}
                      aria-label="Quality status"
                      title="Quality status"
                    />
                  </span>
                  <select
                    name={`${fieldKey}-quality`}
                    value={qualitySelections[fieldKey]}
                    onChange={event =>
                      handleQualityChange(fieldKey, event.target.value)
                    }
                  >
                    <option value="">Select quality</option>
                    {QUALITY_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default ExternalRequestPage

