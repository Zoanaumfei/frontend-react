import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createItemRequest } from '../services/itemService'
import { dateToYmd, weekYearToDate } from '../utils/weekDate'

function InternalNewRequestPage() {
  const [formData, setFormData] = useState({
    partNumber: '',
    supplierID: '',
    processNumber: '',
    partDescription: '',
    tbtVff: '',
    tbtPvs: '',
    tbt0s: '',
    sop: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (isLoading) return

    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const weekFields = ['tbtVff', 'tbtPvs', 'tbt0s', 'sop']
      const datePayload = {}

      for (const field of weekFields) {
        const parsed = weekYearToDate(formData[field])
        if (!parsed) {
          throw new Error(`Invalid ${field} format. Use WW/YY.`)
        }
        const formatted = dateToYmd(parsed)
        if (!formatted) {
          throw new Error(`Invalid ${field} value.`)
        }
        datePayload[`${field}Date`] = formatted
      }

      const result = await createItemRequest({
        partNumber: formData.partNumber,
        supplierID: formData.supplierID,
        processNumber: formData.processNumber,
        partDescription: formData.partDescription,
        ...datePayload,
      })
      setSuccessMessage(result?.message || 'Request created successfully.')
      setFormData({
        partNumber: '',
        supplierID: '',
        processNumber: '',
        partDescription: '',
        tbtVff: '',
        tbtPvs: '',
        tbt0s: '',
        sop: '',
      })
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to create the request.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="card">
      <div className="page-header">
        <div>
          <p className="dashboard__eyebrow">Internal request</p>
          <h1>Create a new timing plan request</h1>
          <p className="dashboard__lead">
            Send a request to a supplier to start the timing plan workflow.
          </p>
        </div>
        <Link className="request-card__action" to="/internal-dashboard">
          Back to dashboard
        </Link>
      </div>

      <form className="login-form login-form--two-column" onSubmit={handleSubmit}>
        <label className="login-form__field">
          <span>Part number</span>
          <input
            type="text"
            name="partNumber"
            placeholder="PN-10021"
            value={formData.partNumber}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </label>
        <label className="login-form__field">
          <span>Supplier ID</span>
          <input
            type="text"
            name="supplierID"
            placeholder="SUP-009"
            value={formData.supplierID}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </label>
        <label className="login-form__field">
          <span>Process number</span>
          <input
            type="text"
            name="processNumber"
            placeholder="PR-2041"
            value={formData.processNumber}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </label>
        <label className="login-form__field">
          <span>Part description</span>
          <input
            type="text"
            name="partDescription"
            placeholder="Brake assembly housing"
            value={formData.partDescription}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </label>
        <label className="login-form__field">
          <span>TBT-VFF (WW/YY)</span>
          <input
            type="text"
            name="tbtVff"
            placeholder="03/26"
            value={formData.tbtVff}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <span className="login-form__hint">
            {dateToYmd(weekYearToDate(formData.tbtVff)) || 'YYYY-MM-DD'}
          </span>
        </label>
        <label className="login-form__field">
          <span>TBT-PVS (WW/YY)</span>
          <input
            type="text"
            name="tbtPvs"
            placeholder="06/26"
            value={formData.tbtPvs}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <span className="login-form__hint">
            {dateToYmd(weekYearToDate(formData.tbtPvs)) || 'YYYY-MM-DD'}
          </span>
        </label>
        <label className="login-form__field">
          <span>TBT-0S (WW/YY)</span>
          <input
            type="text"
            name="tbt0s"
            placeholder="12/26"
            value={formData.tbt0s}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <span className="login-form__hint">
            {dateToYmd(weekYearToDate(formData.tbt0s)) || 'YYYY-MM-DD'}
          </span>
        </label>
        <label className="login-form__field">
          <span>SOP (WW/YY)</span>
          <input
            type="text"
            name="sop"
            placeholder="20/26"
            value={formData.sop}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <span className="login-form__hint">
            {dateToYmd(weekYearToDate(formData.sop)) || 'YYYY-MM-DD'}
          </span>
        </label>

        {error ? (
          <p className="login-form__error" role="alert">
            {error}
          </p>
        ) : null}
        {successMessage ? (
          <p className="login-form__success" role="status">
            {successMessage}
          </p>
        ) : null}

        <button className="login-form__submit" type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create request'}
        </button>
      </form>
    </section>
  )
}

export default InternalNewRequestPage


