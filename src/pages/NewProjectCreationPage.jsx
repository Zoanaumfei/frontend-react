import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createProject } from '../services/projectService'
import { weekYearToDate } from '../utils/weekDate'

const MAX_ALS_FIELDS = 8
const WEEK_YEAR_PATTERN = '^(0[1-9]|[1-4][0-9]|5[0-3])\\/\\d{2}$'
const ALS_LAYOUT_ROWS = [
  {
    className: 'new-project-creation__als-row--four',
    fields: [
      { key: 'tbtVffZp5', label: 'TBT-VFF ZP5' },
      { key: 'tbtVffElet', label: 'TBT-VFF ELET' },
      { key: 'tbtVffZp7', label: 'TBT-VFF ZP7' },
      { key: 'vff', label: 'VFF' },
    ],
  },
  {
    className: 'new-project-creation__als-row--four',
    fields: [
      { key: 'tbtPvsZp5', label: 'TBT-PVS ZP5' },
      { key: 'tbtPvsElet', label: 'TBT-PVS ELET' },
      { key: 'tbtPvsZp7', label: 'TBT-PVS ZP7' },
      { key: 'pvs', label: 'PVS' },
    ],
  },
  {
    className: 'new-project-creation__als-row--four',
    fields: [
      { key: 'tbtS0Zp5', label: 'TBT-S0 ZP5' },
      { key: 'tbtS0Elet', label: 'TBT-S0 ELET' },
      { key: 'tbtS0Zp7', label: 'TBT-S0 ZP7' },
      { key: 's0', label: 'S0' },
    ],
  },
  {
    className: 'new-project-creation__als-row--four',
    fields: [
      { key: 'tppa', label: 'TPPA' },
      { key: 'sop', label: 'SOP' },
    ],
  },
]
const ALS_OPTIONAL_FIELDS = ALS_LAYOUT_ROWS.flatMap(row => row.fields)
const ALS_OPTIONAL_FIELD_KEYS = ALS_OPTIONAL_FIELDS.map(field => field.key)
const ALS_FIELD_LABELS = Object.fromEntries(
  ALS_OPTIONAL_FIELDS.map(field => [field.key, field.label]),
)
const GATES = ['ZP5', 'ELET', 'ZP7']
const PHASES = ['VFF', 'PVS', 'SO', 'TPPA', 'SOP']

const FIELD_BY_GATE_AND_PHASE = {
  ZP5: {
    VFF: 'tbtVffZp5',
    PVS: 'tbtPvsZp5',
    SO: 'tbtS0Zp5',
  },
  ELET: {
    VFF: 'tbtVffElet',
    PVS: 'tbtPvsElet',
    SO: 'tbtS0Elet',
  },
  ZP7: {
    VFF: 'tbtVffZp7',
    PVS: 'tbtPvsZp7',
    SO: 'tbtS0Zp7',
  },
}

const DEFAULT_FIELD_BY_PHASE = {
  VFF: 'vff',
  PVS: 'pvs',
  SO: 's0',
  TPPA: 'tppa',
  SOP: 'sop',
}

function createAlsEntry(index) {
  return ALS_OPTIONAL_FIELDS.reduce(
    (acc, field) => ({ ...acc, [field.key]: '' }),
    { als: `ALS${index}` }
  )
}

function buildGridDates(alsEntries) {
  return alsEntries.reduce((acc, entry, index) => {
    const alsKey = String(index + 1)

    const byGate = GATES.reduce((gatesAcc, gate) => {
      const byPhase = PHASES.reduce((phasesAcc, phase) => {
        const gateFieldKey = FIELD_BY_GATE_AND_PHASE[gate]?.[phase]
        const defaultFieldKey = DEFAULT_FIELD_BY_PHASE[phase]
        const gateValue = gateFieldKey ? (entry[gateFieldKey] || '').trim() : ''
        const fallbackValue = defaultFieldKey ? (entry[defaultFieldKey] || '').trim() : ''

        phasesAcc[phase] = gateValue || fallbackValue || ''
        return phasesAcc
      }, {})

      gatesAcc[gate] = byPhase
      return gatesAcc
    }, {})

    acc[alsKey] = byGate
    return acc
  }, {})
}

function NewProjectCreationPage() {
  const [formData, setFormData] = useState({
    projectID: '',
    projectName: '',
  })

  const [alsFields, setAlsFields] = useState([])
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
      const projectId = formData.projectID.trim()
      const projectName = formData.projectName.trim()

      if (!projectId || !projectName) {
        throw new Error('ProjectID and ProjectName are required.')
      }

      const normalizedAls = alsFields.map(entry => {
        const normalized = { als: entry.als }

        for (const key of ALS_OPTIONAL_FIELD_KEYS) {
          const value = (entry[key] || '').trim()
          if (!value) continue

          if (!weekYearToDate(value)) {
            throw new Error(
              `Invalid ${entry.als} ${ALS_FIELD_LABELS[key]} format. Use WW/YY.`,
            )
          }

          normalized[key] = value
        }

        return normalized
      })

      const result = await createProject({
        projectId,
        projectName,
        grid: {
          dates: buildGridDates(normalizedAls),
        },
      })

      setSuccessMessage(result?.message || 'Project created successfully.')
      setFormData({ projectID: '', projectName: '' })
      setAlsFields([])
    } catch (err) {
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
      return [...prev, createAlsEntry(prev.length + 1)]
    })
  }

  const handleAlsFieldChange = (entryIndex, fieldKey, value) => {
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
