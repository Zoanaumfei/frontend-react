import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getInitiativesCacheSnapshot,
  refreshInitiativesCache,
  createInitiative,
  createInitiativeIdempotencyKey,
  deleteInitiative,
  getInitiatives,
  updateInitiative,
} from '../services/initiativeService'

const STATUS_OPTIONS = [
  'IN_PROGRESS',
  'COMPLETED',
  'PLANNING',
  'ON_HOLD',
  'CANCELLED',
]

const STATUS_LABELS = {
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluida',
  PLANNING: 'Planejamento',
  ON_HOLD: 'Em espera',
  CANCELLED: 'Cancelada',
}

const STATUS_CLASS_NAMES = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  PLANNING: 'planning',
  ON_HOLD: 'on-hold',
  CANCELLED: 'on-hold',
}

const EMPTY_FORM = {
  initiativeName: '',
  initiativeDescription: '',
  initiativeType: '',
  initiativeDueDate: '',
  initiativeStatus: 'IN_PROGRESS',
  leaderId: '',
  leaderName: '',
}

const YEAR_MIN = 2000
const YEAR_MAX = 2100
const DEFAULT_YEAR = new Date().getFullYear()
const IDEMPOTENCY_REUSE_WINDOW_MS = 120000
const createInitiativeId = () => createInitiativeIdempotencyKey()

const normalizeYear = value => {
  const parsed = Number.parseInt(String(value || '').trim(), 10)
  if (!Number.isFinite(parsed) || parsed < YEAR_MIN || parsed > YEAR_MAX) {
    return null
  }
  return parsed
}

const normalizeStatus = value => String(value || '').trim().toUpperCase()

const getStatusLabel = status => {
  const normalized = normalizeStatus(status)
  if (STATUS_LABELS[normalized]) return STATUS_LABELS[normalized]
  if (!normalized) return '--'
  const pretty = normalized.toLowerCase().replace(/_/g, ' ')
  return `${pretty[0]?.toUpperCase() || ''}${pretty.slice(1)}`
}

const getStatusClassName = status => {
  const normalized = normalizeStatus(status)
  return STATUS_CLASS_NAMES[normalized] || 'planning'
}

const getDisplayCode = initiative => initiative?.initiativeCode || '--'

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name) {
  if (!name) return 'NA'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const second = parts[1]?.[0] || ''
  return `${first}${second}`.toUpperCase()
}

const buildPayload = (formData, existingId = '') => {
  const name = formData.initiativeName.trim()
  const type = formData.initiativeType.trim()
  const dueDate = formData.initiativeDueDate.trim()
  const leaderId = formData.leaderId.trim()
  const initiativeStatus = normalizeStatus(formData.initiativeStatus)

  if (!name) throw new Error('Nome da iniciativa e obrigatorio.')
  if (!type) throw new Error('Tipo da iniciativa e obrigatorio.')
  if (!dueDate) throw new Error('Data da iniciativa e obrigatoria.')
  if (!leaderId) throw new Error('Leader ID e obrigatorio.')
  if (!initiativeStatus) throw new Error('Status da iniciativa e obrigatorio.')

  const payload = {
    initiativeName: name,
    initiativeDescription: formData.initiativeDescription.trim(),
    initiativeType: type,
    initiativeDueDate: dueDate,
    initiativeStatus,
    leaderId,
    leaderName: formData.leaderName.trim(),
  }

  if (existingId) payload.initiativeId = existingId

  return payload
}

function InitiativesHubPage({
  useCache = false,
  cacheTtlMs = 3600000,
  autoRefresh = true,
}) {
  const [yearInput, setYearInput] = useState(String(DEFAULT_YEAR))
  const [activeYear, setActiveYear] = useState(DEFAULT_YEAR)
  const [searchTerm, setSearchTerm] = useState('')
  const [initiatives, setInitiatives] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [listError, setListError] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingInitiativeId, setEditingInitiativeId] = useState('')
  const [formData, setFormData] = useState(EMPTY_FORM)
  const createAttemptRef = useRef({
    key: '',
    signature: '',
    createdAt: 0,
    initiativeId: '',
  })

  const loadInitiativesForYear = useCallback(
    async (year, { preferCache = true, showLoading = true } = {}) => {
      const params = { year }
      if (showLoading) setIsLoading(true)
      setListError('')

      try {
        if (useCache && preferCache) {
          const snapshot = getInitiativesCacheSnapshot(params, cacheTtlMs)
          const hasSnapshotData = Array.isArray(snapshot.data)

          if (hasSnapshotData) {
            setInitiatives(snapshot.data)
            if (snapshot.isFresh || !autoRefresh) {
              return snapshot.data
            }
            const refreshed = await refreshInitiativesCache(params)
            setInitiatives(Array.isArray(refreshed) ? refreshed : [])
            return refreshed
          }
        }

        const data = useCache
          ? await refreshInitiativesCache(params)
          : await getInitiatives(params)
        const rows = Array.isArray(data) ? data : []
        setInitiatives(rows)
        return rows
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Nao foi possivel carregar as iniciativas.'
        setListError(message)
        if (showLoading) setInitiatives([])
        return []
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [autoRefresh, cacheTtlMs, useCache],
  )

  useEffect(() => {
    loadInitiativesForYear(activeYear, { preferCache: true, showLoading: true })
  }, [activeYear, loadInitiativesForYear])

  useEffect(() => {
    if (!useCache || !autoRefresh) return

    const intervalId = setInterval(() => {
      loadInitiativesForYear(activeYear, {
        preferCache: false,
        showLoading: false,
      })
    }, cacheTtlMs)

    return () => clearInterval(intervalId)
  }, [activeYear, autoRefresh, cacheTtlMs, loadInitiativesForYear, useCache])

  const filteredInitiatives = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return initiatives

    return initiatives.filter(item => {
      const haystack = [
        item?.initiativeName,
        item?.initiativeDescription,
        item?.initiativeType,
        item?.leaderId,
        item?.leaderName,
        item?.initiativeStatus,
        getDisplayCode(item),
      ]
      return haystack.some(value =>
        String(value || '')
          .toLowerCase()
          .includes(query),
      )
    })
  }, [initiatives, searchTerm])

  const handleYearSubmit = async event => {
    event.preventDefault()
    const year = normalizeYear(yearInput)
    if (!year) {
      setListError('Informe um ano valido entre 2000 e 2100.')
      return
    }

    if (year === activeYear) {
      await loadInitiativesForYear(year, { preferCache: false, showLoading: true })
      return
    }

    setActiveYear(year)
  }

  const handleFormChange = event => {
    const { name, value } = event.target
    createAttemptRef.current = { key: '', signature: '', createdAt: 0, initiativeId: '' }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreate = () => {
    setFormError('')
    setFormSuccess('')
    setEditingInitiativeId('')
    createAttemptRef.current = { key: '', signature: '', createdAt: 0, initiativeId: '' }
    setFormData(EMPTY_FORM)
    setIsFormOpen(true)
  }

  const handleEdit = initiative => {
    setFormError('')
    setFormSuccess('')
    setEditingInitiativeId(initiative?.initiativeId || '')
    setFormData({
      initiativeName: initiative?.initiativeName || '',
      initiativeDescription: initiative?.initiativeDescription || '',
      initiativeType: initiative?.initiativeType || '',
      initiativeDueDate: initiative?.initiativeDueDate || '',
      initiativeStatus: normalizeStatus(initiative?.initiativeStatus || 'IN_PROGRESS'),
      leaderId: initiative?.leaderId || '',
      leaderName: initiative?.leaderName || '',
    })
    setIsFormOpen(true)
  }

  const handleCancelEdit = () => {
    setEditingInitiativeId('')
    createAttemptRef.current = { key: '', signature: '', createdAt: 0, initiativeId: '' }
    setFormData(EMPTY_FORM)
    setFormError('')
    setIsFormOpen(false)
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    setFormError('')
    setFormSuccess('')

    try {
      let payload
      const stableInitiativeId =
        createAttemptRef.current.initiativeId || createInitiativeId()

      if (editingInitiativeId) {
        payload = buildPayload(formData, editingInitiativeId)
      } else {
        payload = buildPayload(formData, stableInitiativeId)
      }

      const dueYear = normalizeYear(payload.initiativeDueDate.slice(0, 4))

      if (editingInitiativeId) {
        await updateInitiative(payload)
      } else {
        const now = Date.now()
        const createSignature = JSON.stringify(payload)
        const canReuseKey =
          createAttemptRef.current.key &&
          createAttemptRef.current.signature === createSignature &&
          now - createAttemptRef.current.createdAt < IDEMPOTENCY_REUSE_WINDOW_MS

        const idempotencyKey = canReuseKey
          ? createAttemptRef.current.key
          : createInitiativeIdempotencyKey()

        createAttemptRef.current = {
          key: idempotencyKey,
          signature: createSignature,
          createdAt: now,
          initiativeId: stableInitiativeId,
        }

        await createInitiative(payload, idempotencyKey)
      }

      setFormSuccess(
        editingInitiativeId
          ? 'Iniciativa atualizada com sucesso.'
          : 'Iniciativa criada com sucesso.',
      )
      setIsFormOpen(false)
      setEditingInitiativeId('')
      createAttemptRef.current = { key: '', signature: '', createdAt: 0, initiativeId: '' }
      setFormData(EMPTY_FORM)

      const targetYear = dueYear || activeYear
      setYearInput(String(targetYear))
      if (targetYear === activeYear) {
        await loadInitiativesForYear(targetYear, {
          preferCache: false,
          showLoading: false,
        })
      } else {
        setActiveYear(targetYear)
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Nao foi possivel salvar a iniciativa.'
      setFormError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async initiative => {
    const initiativeId = initiative?.initiativeId
    if (!initiativeId) return

    const confirmDelete = window.confirm(
      `Excluir ${initiative?.initiativeName || 'esta iniciativa'} (${getDisplayCode(initiative)})?`,
    )
    if (!confirmDelete) return

    setListError('')
    setFormError('')
    setFormSuccess('')

    try {
      await deleteInitiative(initiativeId)
      setInitiatives(prev =>
        prev.filter(item => item?.initiativeId !== initiativeId),
      )
      if (initiativeId === editingInitiativeId) {
        setEditingInitiativeId('')
        createAttemptRef.current = { key: '', signature: '', createdAt: 0, initiativeId: '' }
        setFormData(EMPTY_FORM)
        setIsFormOpen(false)
      }
      setFormSuccess('Iniciativa excluida com sucesso.')
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Nao foi possivel excluir a iniciativa.'
      setListError(message)
    }
  }

  return (
    <section className="initiatives-hub" aria-labelledby="initiatives-hub-title">
      <header className="initiatives-hub__hero">
        <div className="initiatives-hub__hero-main">
          <p className="initiatives-hub__eyebrow">Area interna</p>
          <h1 id="initiatives-hub-title" className="initiatives-hub__title">
            Initiatives Hub
          </h1>
          <p className="initiatives-hub__lead">
            Acompanhe e gerencie iniciativas por ano em um unico painel.
          </p>
        </div>
        <div className="initiatives-hub__controls">
          <button type="button" className="initiatives-hub__new" onClick={handleCreate}>
            Adicionar nova iniciativa
          </button>
          <label className="initiatives-hub__search" aria-label="Buscar iniciativas">
            <span className="initiatives-hub__search-icon" aria-hidden="true">
              Buscar
            </span>
            <input
              type="search"
              name="initiativeSearch"
              value={searchTerm}
              placeholder="Buscar iniciativas..."
              onChange={event => setSearchTerm(event.target.value)}
            />
          </label>
          <form className="initiatives-hub__year-filter" onSubmit={handleYearSubmit}>
            <label className="initiatives-hub__search" htmlFor="initiativesYear">
              <span className="initiatives-hub__search-icon" aria-hidden="true">
                Ano
              </span>
              <input
                id="initiativesYear"
                name="year"
                type="number"
                min={YEAR_MIN}
                max={YEAR_MAX}
                value={yearInput}
                onChange={event => setYearInput(event.target.value)}
              />
            </label>
            <button type="submit" className="initiatives-hub__new initiatives-hub__new--secondary">
              Carregar
            </button>
          </form>
        </div>
      </header>

      {formError ? <p className="login-form__error">{formError}</p> : null}
      {formSuccess ? <p className="login-form__success">{formSuccess}</p> : null}
      {listError ? <p className="login-form__error">{listError}</p> : null}

      {isFormOpen ? (
        <div className="initiatives-hub__card initiatives-hub__form-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form login-form--two-column initiatives-hub__form-grid">
              <label className="login-form__field" htmlFor="initiativeName">
                Nome *
                <input
                  id="initiativeName"
                  name="initiativeName"
                  type="text"
                  value={formData.initiativeName}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label className="login-form__field" htmlFor="initiativeType">
                Tipo *
                <input
                  id="initiativeType"
                  name="initiativeType"
                  type="text"
                  value={formData.initiativeType}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label className="login-form__field" htmlFor="initiativeDueDate">
                Data limite *
                <input
                  id="initiativeDueDate"
                  name="initiativeDueDate"
                  type="date"
                  value={formData.initiativeDueDate}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label className="login-form__field" htmlFor="initiativeStatus">
                Status *
                <select
                  id="initiativeStatus"
                  name="initiativeStatus"
                  value={formData.initiativeStatus}
                  onChange={handleFormChange}
                  required
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="login-form__field" htmlFor="leaderId">
                Leader ID *
                <input
                  id="leaderId"
                  name="leaderId"
                  type="text"
                  value={formData.leaderId}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label className="login-form__field" htmlFor="leaderName">
                Leader name (opcional)
                <input
                  id="leaderName"
                  name="leaderName"
                  type="text"
                  value={formData.leaderName}
                  onChange={handleFormChange}
                />
              </label>
            </div>

            <label className="login-form__field" htmlFor="initiativeDescription">
              Descricao
              <textarea
                id="initiativeDescription"
                name="initiativeDescription"
                value={formData.initiativeDescription}
                onChange={handleFormChange}
                rows={4}
              />
            </label>

            <div className="initiatives-hub__form-actions">
              <button type="submit" className="login-form__submit" disabled={isSaving}>
                {isSaving
                  ? 'Salvando...'
                  : editingInitiativeId
                    ? 'Atualizar iniciativa'
                    : 'Criar iniciativa'}
              </button>
              <button
                type="button"
                className="page-btn"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="initiatives-hub__card">
        <div className="initiatives-hub__table-wrap">
          <table className="initiatives-hub__table">
            <thead>
              <tr>
                <th scope="col">Iniciativa</th>
                <th scope="col">Lider</th>
                <th scope="col">Data limite</th>
                <th scope="col">Status</th>
                <th scope="col">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5}>Carregando iniciativas...</td>
                </tr>
              ) : null}
              {!isLoading && filteredInitiatives.length === 0 ? (
                <tr>
                  <td colSpan={5}>Nenhuma iniciativa encontrada.</td>
                </tr>
              ) : null}
              {!isLoading &&
                filteredInitiatives.map((item, index) => (
                  <tr
                    key={
                      item?.initiativeId ||
                      item?.initiativeCode ||
                      `${item?.initiativeName || 'initiative'}-${index}`
                    }
                  >
                    <td>
                      <div className="initiative-cell">
                        <span className="initiative-cell__icon" aria-hidden="true">
                          {(item?.initiativeName || '--').slice(0, 2).toUpperCase()}
                        </span>
                        <div className="initiative-cell__text">
                          <strong>{item?.initiativeName || '--'}</strong>
                          <span title={item?.initiativeId || ''}>{getDisplayCode(item)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="responsible-cell">
                        <span className="responsible-cell__avatar" aria-hidden="true">
                          {getInitials(item?.leaderName || item?.leaderId)}
                        </span>
                        <span>{item?.leaderName || item?.leaderId || '--'}</span>
                      </div>
                    </td>
                    <td>{formatDate(item?.initiativeDueDate)}</td>
                    <td>
                      <span
                        className={`status-pill status-pill--${getStatusClassName(item?.initiativeStatus)}`}
                      >
                        {getStatusLabel(item?.initiativeStatus)}
                      </span>
                    </td>
                    <td>
                      <div className="initiative-actions">
                        <button
                          type="button"
                          className="page-btn"
                          onClick={() => handleEdit(item)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="page-btn page-btn--danger"
                          onClick={() => handleDelete(item)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="initiatives-hub__footer">
          <p className="initiatives-hub__meta">
            Ano {activeYear}: mostrando {filteredInitiatives.length} de {initiatives.length}{' '}
            iniciativas
          </p>
          <div className="initiatives-hub__pagination" role="navigation" aria-label="Paginacao">
            <button type="button" className="page-btn" disabled>
              Anterior
            </button>
            <span className="page-btn page-btn--active" aria-current="page">
              1
            </span>
            <button type="button" className="page-btn" disabled>
              Proxima
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InitiativesHubPage

