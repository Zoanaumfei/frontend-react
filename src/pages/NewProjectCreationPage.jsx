import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createProject,
  createProjectIdempotencyKey,
} from '../services/projectService'
import { dateToYmd, weekYearToDate } from '../utils/weekDate'
import { reportClientBug } from '../utils/clientBug'
import {
  ALS_FIELD_LABELS,
  ALS_LAYOUT_ROWS,
  ALS_OPTIONAL_FIELD_KEYS,
  MAX_ALS_FIELDS,
  WEEK_YEAR_PATTERN,
  buildAlsDescriptions,
  buildGridDates,
  createAlsEntry,
} from '../utils/projectGrid'

const IDEMPOTENCY_REUSE_WINDOW_MS = 120000

function NewProjectCreationPage() {
  const [formData, setFormData] = useState({
    projectID: '',
    projectName: '',
  })

  const [alsFields, setAlsFields] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const createAttemptRef = useRef({
    key: '',
    signature: '',
    createdAt: 0,
  })

  const handleChange = event => {
    const { name, value } = event.target
    createAttemptRef.current = { key: '', signature: '', createdAt: 0 }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (isLoading) return

    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const projectId = formData.projectID.trim()
      const projectName = formData.projectName.trim()

      if (!projectId || !projectName) {
        throw new Error('ProjectID and ProjectName are required.')
      }

      for (const entry of alsFields) {
        const description = (entry.alsDescription || '').trim()
        if (!description) {
          throw new Error(`${entry.als} description is required.`)
        }
      }

      const normalizedAls = alsFields.map(entry => {
        const normalized = { als: entry.als }

        for (const key of ALS_OPTIONAL_FIELD_KEYS) {
          const value = (entry[key] || '').trim()
          if (!value) continue

          const parsed = weekYearToDate(value)
          if (!parsed) {
            throw new Error(
              `Invalid ${entry.als} ${ALS_FIELD_LABELS[key]} format. Use WW/YY.`,
            )
          }

          const formatted = dateToYmd(parsed)
          if (!formatted) {
            throw new Error(
              `Invalid ${entry.als} ${ALS_FIELD_LABELS[key]} value.`,
            )
          }

          normalized[key] = formatted
        }

        return normalized
      })

      const payload = {
        projectId,
        projectName,
        grid: {
          alsDescriptions: buildAlsDescriptions(alsFields),
          dates: buildGridDates(normalizedAls),
        },
      }

      const now = Date.now()
      const createSignature = JSON.stringify(payload)
      const canReuseKey =
        createAttemptRef.current.key &&
        createAttemptRef.current.signature === createSignature &&
        now - createAttemptRef.current.createdAt < IDEMPOTENCY_REUSE_WINDOW_MS

      const idempotencyKey = canReuseKey
        ? createAttemptRef.current.key
        : createProjectIdempotencyKey()

      createAttemptRef.current = {
        key: idempotencyKey,
        signature: createSignature,
        createdAt: now,
      }

      const result = await createProject(payload, idempotencyKey)

      setSuccessMessage(result?.message || 'Project created successfully.')
      setFormData({ projectID: '', projectName: '' })
      setAlsFields([])
      createAttemptRef.current = { key: '', signature: '', createdAt: 0 }
    } catch (err) {
      const status = err?.response?.status
      const backendMessage = err?.response?.data?.message || err?.message || ''
      const isIdempotencyError =
        status === 400 && /idempotency[- ]key/i.test(backendMessage)

      if (isIdempotencyError) {
        reportClientBug('INVALID_IDEMPOTENCY_KEY', {
          screen: 'NewProjectCreationPage',
          projectId: formData.projectID,
          status,
          backendMessage,
        })
        setError(
          'Unexpected request validation error. Please refresh and try again.',
        )
        return
      }

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to create the project.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAlsField = () => {
    setAlsFields(prev => {
      if (prev.length >= MAX_ALS_FIELDS) return prev
      createAttemptRef.current = { key: '', signature: '', createdAt: 0 }
      return [...prev, createAlsEntry(prev.length + 1)]
    })
  }

  const handleAlsFieldChange = (entryIndex, fieldKey, value) => {
    createAttemptRef.current = { key: '', signature: '', createdAt: 0 }
    setAlsFields(prev =>
      prev.map((entry, idx) => {
        if (idx !== entryIndex) return entry
        return { ...entry, [fieldKey]: value }
      })
    )
  }

  return (
    <section className="card" aria-labelledby="new-project-creation-title">
      <p className="dashboard__eyebrow">Project management</p>
      <h1 id="new-project-creation-title">New project creation</h1>
      <p className="dashboard__lead">
        Start a new project by defining the core information and first milestones.
      </p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="login-form__field">
          <span>ProjectID *</span>
          <input
            type="text"
            name="projectID"
            value={formData.projectID}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </label>

        <label className="login-form__field">
          <span>ProjectName *</span>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </label>

        <div className="dashboard__actions">
          <button
            type="button"
            className="request-card__action"
            onClick={handleAddAlsField}
            disabled={alsFields.length >= MAX_ALS_FIELDS || isLoading}
          >
            + ALS
          </button>
        </div>

        {alsFields.map((alsEntry, entryIndex) => (
          <div key={alsEntry.als} className="new-project-creation__als-block">
            <div className="new-project-creation__als-row new-project-creation__als-row--one">
              <label className="login-form__field">
                <span>ALS</span>
                <input type="text" value={alsEntry.als} readOnly />
              </label>
            </div>
            <div className="new-project-creation__als-row new-project-creation__als-row--wide">
              <label className="login-form__field">
                <span>ALS Description *</span>
                <input
                  type="text"
                  value={alsEntry.alsDescription}
                  onChange={event =>
                    handleAlsFieldChange(entryIndex, 'alsDescription', event.target.value)
                  }
                  placeholder="Describe this ALS"
                  disabled={isLoading}
                  required
                />
              </label>
            </div>

            {ALS_LAYOUT_ROWS.map((row, rowIndex) => (
              <div
                key={`${alsEntry.als}-row-${rowIndex + 2}`}
                className={`new-project-creation__als-row ${row.className}`}
              >
                {row.fields.map(field => (
                  <label key={`${alsEntry.als}-${field.key}`} className="login-form__field">
                    <span>{field.label}</span>
                    <input
                      type="text"
                      value={alsEntry[field.key]}
                      onChange={event => handleAlsFieldChange(entryIndex, field.key, event.target.value)}
                      placeholder="WW/YY"
                      pattern={WEEK_YEAR_PATTERN}
                      title="Use WW/YY format (example: 05/26)"
                      disabled={isLoading}
                    />
                  </label>
                ))}
              </div>
            ))}
          </div>
        ))}

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

        <button type="submit" className="login-form__submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save project data'}
        </button>
      </form>

      <div className="dashboard__actions">
        <Link className="request-card__action" to="/project-management">
          Back to ProjectManagement
        </Link>
      </div>
    </section>
  )
}

export default NewProjectCreationPage
