import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createProjectIdempotencyKey,
  getProject,
  getProjects,
  updateProject,
} from '../services/projectService'
import { dateToWeekYear, dateToYmd, weekYearToDate, ymdToDate } from '../utils/weekDate'
import { reportClientBug } from '../utils/clientBug'
import {
  ALS_FIELD_LABELS,
  ALS_LAYOUT_ROWS,
  ALS_OPTIONAL_FIELD_KEYS,
  DEFAULT_FIELD_BY_PHASE,
  FIELD_BY_GATE_AND_PHASE,
  GATES,
  MAX_ALS_FIELDS,
  PHASES,
  WEEK_YEAR_PATTERN,
  buildAlsDescriptions,
  buildGridDates,
  createAlsEntry,
} from '../utils/projectGrid'

const IDEMPOTENCY_REUSE_WINDOW_MS = 120000

const toWeekYear = value => {
  if (!value) return ''
  const parsed = ymdToDate(value)
  return dateToWeekYear(parsed || value) || ''
}

const getAlsNumber = entry => {
  const match = entry?.als?.match(/\d+$/)
  return match ? Number(match[0]) : null
}

const sortAlsEntries = entries =>
  [...entries].sort((left, right) => {
    const leftKey = getAlsNumber(left) ?? 0
    const rightKey = getAlsNumber(right) ?? 0
    return leftKey - rightKey
  })

const buildAlsEntriesFromGrid = grid => {
  if (!grid) return []
  const descriptions = grid.alsDescriptions || {}
  const dates = grid.dates || {}
  const keys = new Set([
    ...Object.keys(descriptions || {}),
    ...Object.keys(dates || {}),
  ])
  const sortedKeys = [...keys]
    .map(value => Number(value))
    .filter(value => Number.isFinite(value))
    .sort((a, b) => a - b)

  return sortedKeys.map(alsNumber => {
    const entry = createAlsEntry(alsNumber)
    entry.alsDescription =
      descriptions[alsNumber] ?? descriptions[String(alsNumber)] ?? ''

    const gateMap = dates[alsNumber] ?? dates[String(alsNumber)] ?? {}
    const phaseGateValues = PHASES.reduce((acc, phase) => {
      acc[phase] = {}
      return acc
    }, {})

    GATES.forEach(gate => {
      const phaseMap = gateMap?.[gate] || {}
      PHASES.forEach(phase => {
        const rawValue = phaseMap?.[phase]
        phaseGateValues[phase][gate] = toWeekYear(rawValue)
      })
    })

    PHASES.forEach(phase => {
      GATES.forEach(gate => {
        const fieldKey = FIELD_BY_GATE_AND_PHASE?.[gate]?.[phase]
        if (fieldKey) {
          entry[fieldKey] = phaseGateValues[phase][gate] || ''
        }
      })

      const defaultKey = DEFAULT_FIELD_BY_PHASE[phase]
      if (defaultKey) {
        const preferredGate = GATES.find(gate => phaseGateValues[phase][gate])
        entry[defaultKey] = preferredGate ? phaseGateValues[phase][preferredGate] : ''
      }
    })

    return entry
  })
}

function ManageProjectsPage() {
  const [filters, setFilters] = useState({ projectId: '' })
  const [project, setProject] = useState(null)
  const [alsFields, setAlsFields] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [projects, setProjects] = useState([])
  const [isListing, setIsListing] = useState(false)
  const [listError, setListError] = useState('')
  const [error, setError] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState('')
  const updateAttemptRef = useRef({
    key: '',
    signature: '',
    createdAt: 0,
  })

  const fetchProjects = async () => {
    setIsListing(true)
    setListError('')
    try {
      const data = await getProjects()
      const normalized = Array.isArray(data) ? data : []
      normalized.sort((left, right) =>
        String(left?.projectId || '').localeCompare(String(right?.projectId || '')),
      )
      setProjects(normalized)
    } catch {
      setListError('Failed to load projects. Please try again.')
    } finally {
      setIsListing(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleFilterChange = event => {
    const { name, value } = event.target
    updateAttemptRef.current = { key: '', signature: '', createdAt: 0 }
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const fetchProject = async projectId => {
    if (!projectId) {
      setError('ProjectID is required.')
      return
    }

    setIsLoading(true)
    setError('')
    setUpdateError('')
    setUpdateSuccess('')
    setProject(null)
    setAlsFields([])
    setIsEditing(false)
    updateAttemptRef.current = { key: '', signature: '', createdAt: 0 }

    try {
      const data = await getProject(projectId)
      setProject(data)
      setAlsFields(buildAlsEntriesFromGrid(data?.grid))
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to find the project.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async event => {
    event.preventDefault()
    const projectId = filters.projectId.trim()
    fetchProject(projectId)
  }

  const handleSelectProject = projectId => {
    if (!projectId) return
    setFilters(prev => ({ ...prev, projectId }))
    fetchProject(projectId)
  }

  const handleUpdate = async event => {
    event.preventDefault()
    if (!project?.projectId || isUpdating) return

    setIsUpdating(true)
    setUpdateError('')
    setUpdateSuccess('')

    try {
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

      const updatePayload = {
        grid: {
          alsDescriptions: buildAlsDescriptions(alsFields),
          dates: buildGridDates(normalizedAls),
        },
      }

      const now = Date.now()
      const updateSignature = JSON.stringify({
        projectId: project.projectId,
        payload: updatePayload,
      })
      const canReuseKey =
        updateAttemptRef.current.key &&
        updateAttemptRef.current.signature === updateSignature &&
        now - updateAttemptRef.current.createdAt < IDEMPOTENCY_REUSE_WINDOW_MS

      const idempotencyKey = canReuseKey
        ? updateAttemptRef.current.key
        : createProjectIdempotencyKey()

      updateAttemptRef.current = {
        key: idempotencyKey,
        signature: updateSignature,
        createdAt: now,
      }

      const result = await updateProject(
        project.projectId,
        updatePayload,
        idempotencyKey,
      )
      setProject(result)
      setAlsFields(buildAlsEntriesFromGrid(result?.grid))
      setUpdateSuccess('Project updated successfully.')
      setIsEditing(false)
      updateAttemptRef.current = { key: '', signature: '', createdAt: 0 }
    } catch (err) {
      const status = err?.response?.status
      const backendMessage = err?.response?.data?.message || err?.message || ''
      const isIdempotencyError =
        status === 400 && /idempotency[- ]key/i.test(backendMessage)

      if (isIdempotencyError) {
        reportClientBug('INVALID_IDEMPOTENCY_KEY', {
          screen: 'ManageProjectsPage',
          projectId: project?.projectId,
          status,
          backendMessage,
        })
        setUpdateError(
          'Unexpected request validation error. Please refresh and try again.',
        )
        return
      }

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to update the project.'
      setUpdateError(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddAlsField = () => {
    setAlsFields(prev => {
      if (prev.length >= MAX_ALS_FIELDS) return prev
      updateAttemptRef.current = { key: '', signature: '', createdAt: 0 }
      const existing = new Set(
        prev.map(getAlsNumber).filter(value => Number.isFinite(value)),
      )
      const nextNumber = Array.from(
        { length: MAX_ALS_FIELDS },
        (_, index) => index + 1,
      ).find(value => !existing.has(value))
      if (!nextNumber) return prev
      return sortAlsEntries([...prev, createAlsEntry(nextNumber)])
    })
  }

  const handleEdit = () => {
    const confirmEdit = window.confirm(
      'Do you have sure you want to edit this project?',
    )
    if (!confirmEdit) return
    setIsEditing(true)
    setUpdateError('')
    setUpdateSuccess('')
    updateAttemptRef.current = { key: '', signature: '', createdAt: 0 }
  }

  const handleAlsFieldChange = (entryIndex, fieldKey, value) => {
    updateAttemptRef.current = { key: '', signature: '', createdAt: 0 }
    setAlsFields(prev =>
      prev.map((entry, idx) => {
        if (idx !== entryIndex) return entry
        return { ...entry, [fieldKey]: value }
      }),
    )
  }

  return (
    <section className="card manage-projects" aria-labelledby="manage-projects-title">
      <p className="dashboard__eyebrow">Area interna</p>
      <h1 id="manage-projects-title">Manage projects</h1>
      <p className="dashboard__lead">
        Search for an existing project by ProjectID (PK: PROJECT#ProjectID, SK:
        META) and update its grid data.
      </p>

      <form className="login-form manage-projects__search" onSubmit={handleSearch}>
        <label className="login-form__field" htmlFor="projectIdFilter">
          ProjectID
          <input
            id="projectIdFilter"
            name="projectId"
            type="text"
            placeholder="PROJECT123"
            value={filters.projectId}
            onChange={handleFilterChange}
            required
          />
        </label>
        <div className="dashboard__actions dashboard__actions--spaced">
          <button type="submit" className="login-form__submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search project'}
          </button>
          <Link className="request-card__action" to="/project-management">
            Back to project management
          </Link>
        </div>
        {error ? <p className="login-form__error">{error}</p> : null}
      </form>

      <div className="manage-projects__results">
        {isLoading ? (
          <p className="manage-projects__status">Loading project data...</p>
        ) : null}
        {!isLoading && !project ? (
          <p className="manage-projects__status">
            Search for a ProjectID to view details.
          </p>
        ) : null}
        {project ? (
          <div className="manage-projects__panel">
            <div className="manage-projects__summary">
              <div className="manage-projects__stat">
                <p className="manage-projects__label">Project ID</p>
                <p className="manage-projects__value">{project.projectId}</p>
              </div>
              <div className="manage-projects__stat">
                <p className="manage-projects__label">Project Name</p>
                <p className="manage-projects__value">
                  {project.projectName || '--'}
                </p>
              </div>
              <div className="manage-projects__stat">
                <p className="manage-projects__label">Updated At</p>
                <p className="manage-projects__value">
                  {project.updatedAt || '--'}
                </p>
              </div>
            </div>

            <div className="dashboard__actions">
              <button
                type="button"
                className="request-card__action"
                onClick={handleEdit}
                disabled={isEditing || isUpdating}
              >
                Edit project
              </button>
              <button
                type="button"
                className="request-card__action"
                onClick={handleAddAlsField}
                disabled={
                  !isEditing || alsFields.length >= MAX_ALS_FIELDS || isUpdating
                }
              >
                + ALS
              </button>
            </div>

            <form className="login-form manage-projects__editor" onSubmit={handleUpdate}>
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
                          handleAlsFieldChange(
                            entryIndex,
                            'alsDescription',
                            event.target.value,
                          )
                        }
                        placeholder="Describe this ALS"
                        disabled={!isEditing || isUpdating}
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
                        <label
                          key={`${alsEntry.als}-${field.key}`}
                          className="login-form__field"
                        >
                          <span>{field.label}</span>
                          <input
                            type="text"
                            value={alsEntry[field.key]}
                            onChange={event =>
                              handleAlsFieldChange(
                                entryIndex,
                                field.key,
                                event.target.value,
                              )
                            }
                            placeholder="WW/YY"
                            pattern={WEEK_YEAR_PATTERN}
                            title="Use WW/YY format (example: 05/26)"
                            disabled={!isEditing || isUpdating}
                          />
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              ))}

              {updateError ? (
                <p className="login-form__error">{updateError}</p>
              ) : null}
              {updateSuccess ? (
                <p className="login-form__success">{updateSuccess}</p>
              ) : null}
              <button
                type="submit"
                className="login-form__submit"
                disabled={!isEditing || isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update project grid'}
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <section className="manage-projects__list" aria-labelledby="manage-projects-list-title">
        <div className="dashboard__header">
          <div>
            <p className="dashboard__eyebrow">Projects</p>
            <h2 id="manage-projects-list-title">All projects</h2>
            <p className="dashboard__lead">
              List based on META rows. Click to load a project into the editor.
            </p>
          </div>
          <div className="dashboard__actions">
            <button
              type="button"
              className="request-card__action"
              onClick={fetchProjects}
              disabled={isListing}
            >
              {isListing ? 'Refreshing...' : 'Refresh list'}
            </button>
          </div>
        </div>

        {listError ? <p className="login-form__error">{listError}</p> : null}
        {isListing ? (
          <p className="manage-projects__status">Loading projects...</p>
        ) : null}

        {!isListing && projects.length === 0 ? (
          <p className="manage-projects__status">No projects found.</p>
        ) : null}

        {projects.length > 0 ? (
          <div className="request-list">
            {projects.map(item => (
              <div key={item.projectId} className="request-card">
                <div>
                  <p className="request-card__id">{item.projectId}</p>
                  <strong>{item.projectName || '--'}</strong>
                  <p className="request-card__meta">Status: {item.status || '--'}</p>
                </div>
                <button
                  type="button"
                  className="request-card__action"
                  onClick={() => handleSelectProject(item.projectId)}
                  disabled={isLoading}
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  )
}

export default ManageProjectsPage
