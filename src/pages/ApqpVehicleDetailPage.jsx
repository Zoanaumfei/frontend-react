import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { GROUPS } from '../auth/auth.constants'
import { hasGroup } from '../auth/auth.groups'
import ApqpLayout from '../components/apqp/ApqpLayout'
import {
  getApqpTemplate,
  getApqpVehicle,
  getApqpVehicleParts,
} from '../services/apqpService'

const PAGE_SIZE = 6

const dateLabel = value => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleDateString('en-US')
}

const tabs = ['bom', 'kanban', 'settings']

const getPartDeliverablesProgress = (part, stages = []) => {
  const stageDefinitions = stages.flatMap(stage => stage.deliverables || [])
  const total = stageDefinitions.length
  if (!total) return { percent: 0, done: 0, total: 0 }

  const done = stageDefinitions.filter(definition => {
    return stages.some(stage => {
      const stageEntries = part?.deliverablesByStage?.[stage.id] || []
      return stageEntries.some(
        entry =>
          (entry.id === definition.id || entry.name === definition.name) &&
          entry.status === 'Done',
      )
    })
  }).length

  const percent = Math.round((done / total) * 100)
  return { percent, done, total }
}

const getDeliverableCompletion = (part, stage) => {
  const required = (stage?.deliverables || []).filter(item => item.required)
  const entries = part?.deliverablesByStage?.[stage?.id] || []
  const done = required.filter(def =>
    entries.some(entry => (entry.id === def.id || entry.name === def.name) && entry.status === 'Done'),
  ).length
  const total = required.length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 100 }
}

const mergeDeliverables = (part, stage) => {
  const defs = stage?.deliverables || []
  const entries = part?.deliverablesByStage?.[stage?.id] || []
  return defs.map(def => {
    const entry = entries.find(item => item.id === def.id || item.name === def.name)
    return {
      ...def,
      status: entry?.status || 'Not Started',
      value: entry?.value ?? '',
    }
  })
}

function ApqpVehicleDetailPage() {
  const { vehicleId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [vehicle, setVehicle] = useState(null)
  const [template, setTemplate] = useState(null)
  const [parts, setParts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [draggingId, setDraggingId] = useState('')
  const [boardMessage, setBoardMessage] = useState('')
  const [kanbanView, setKanbanView] = useState('kanban')
  const [bomFilters, setBomFilters] = useState({
    search: '',
    supplier: 'all',
    family: 'all',
    stage: 'all',
    owner: 'all',
  })
  const [boardFilters, setBoardFilters] = useState({
    search: '',
    supplier: 'all',
    family: 'all',
    owner: 'all',
  })
  const [page, setPage] = useState(1)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      const currentVehicle = await getApqpVehicle(vehicleId)
      if (!currentVehicle) {
        if (isMounted) setIsLoading(false)
        return
      }

      const [currentTemplate, currentParts] = await Promise.all([
        getApqpTemplate(currentVehicle.templateId),
        getApqpVehicleParts(vehicleId),
      ])

      if (!isMounted) return
      setVehicle(currentVehicle)
      setTemplate(currentTemplate)
      setParts(currentParts)
      setIsLoading(false)
    }

    load()
    return () => {
      isMounted = false
    }
  }, [vehicleId])

  const updateQuery = updates => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) next.delete(key)
      else next.set(key, value)
    })
    setSearchParams(next, { replace: true })
  }

  const activeTab = tabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'bom'
  const selectedPartId = searchParams.get('part') || ''
  const selectedPart = parts.find(item => item.id === selectedPartId) || null
  const selectedStage = template?.stages?.find(item => item.id === selectedPart?.currentStageId)
  const selectedDeliverables = mergeDeliverables(selectedPart, selectedStage)

  const suppliers = useMemo(
    () => ['all', ...new Set(parts.map(item => item.supplier).filter(Boolean))],
    [parts],
  )
  const families = useMemo(
    () => ['all', ...new Set(parts.map(item => item.family).filter(Boolean))],
    [parts],
  )
  const owners = useMemo(
    () => ['all', ...new Set(parts.map(item => item.owner?.name).filter(Boolean))],
    [parts],
  )

  const filteredBomParts = useMemo(() => {
    const search = bomFilters.search.trim().toLowerCase()
    return parts.filter(item => {
      if (bomFilters.supplier !== 'all' && item.supplier !== bomFilters.supplier) return false
      if (bomFilters.family !== 'all' && item.family !== bomFilters.family) return false
      if (bomFilters.stage !== 'all' && item.currentStageId !== bomFilters.stage) return false
      if (bomFilters.owner !== 'all' && item.owner?.name !== bomFilters.owner) return false
      if (!search) return true
      return `${item.partNumber} ${item.description}`.toLowerCase().includes(search)
    })
  }, [bomFilters, parts])

  const filteredBoardParts = useMemo(() => {
    const search = boardFilters.search.trim().toLowerCase()
    return parts.filter(item => {
      if (boardFilters.supplier !== 'all' && item.supplier !== boardFilters.supplier) return false
      if (boardFilters.family !== 'all' && item.family !== boardFilters.family) return false
      if (boardFilters.owner !== 'all' && item.owner?.name !== boardFilters.owner) return false
      if (!search) return true
      return `${item.partNumber} ${item.description}`.toLowerCase().includes(search)
    })
  }, [boardFilters, parts])

  const pageCount = Math.max(1, Math.ceil(filteredBomParts.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedParts = filteredBomParts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [bomFilters])

  const validateMove = (part, targetStage) => {
    if (!part || !targetStage) return 'Invalid stage movement.'
    if (part.currentStageId === targetStage.id) return ''

    if (Number.isFinite(targetStage.wipLimit) && targetStage.wipLimit < 900) {
      const inTarget = filteredBoardParts.filter(item => item.currentStageId === targetStage.id && item.id !== part.id)
      if (inTarget.length + 1 > targetStage.wipLimit) {
        return `WIP limit exceeded for ${targetStage.name}.`
      }
    }

    const required = targetStage.deliverables.filter(item => item.required)
    const entries = part.deliverablesByStage?.[targetStage.id] || []
    const missing = required.filter(
      def => !entries.some(entry => (entry.id === def.id || entry.name === def.name) && entry.status === 'Done'),
    )
    if (missing.length) return `Blocked: incomplete required deliverables (${missing.map(item => item.name).join(', ')}).`
    return ''
  }

  const movePart = (partId, targetStageId) => {
    const part = parts.find(item => item.id === partId)
    const targetStage = template?.stages?.find(item => item.id === targetStageId)
    const error = validateMove(part, targetStage)
    if (error) {
      setBoardMessage(error)
      return
    }

    setParts(current =>
      current.map(item => {
        if (item.id !== partId) return item
        return {
          ...item,
          currentStageId: targetStageId,
          history: [
            ...(item.history || []),
            {
              id: `${item.id}-${Date.now()}`,
              fromStageId: item.currentStageId,
              toStageId: targetStageId,
              user: 'Current User',
              date: new Date().toISOString(),
            },
          ],
        }
      }),
    )
    setBoardMessage(`Part moved to ${targetStage?.name}.`)
  }

  const updateDeliverable = (partId, stageId, deliverableId, patch) => {
    setParts(current =>
      current.map(part => {
        if (part.id !== partId) return part
        const stageItems = part.deliverablesByStage?.[stageId] || []
        const index = stageItems.findIndex(item => item.id === deliverableId)
        const stageDefinition = template?.stages
          ?.find(stage => stage.id === stageId)
          ?.deliverables?.find(item => item.id === deliverableId)
        const updated =
          index >= 0
            ? stageItems.map(item => (item.id === deliverableId ? { ...item, ...patch } : item))
            : [
                ...stageItems,
                {
                  id: deliverableId,
                  name: stageDefinition?.name || deliverableId,
                  type: stageDefinition?.type || 'Text',
                  required: Boolean(stageDefinition?.required),
                  status: 'Not Started',
                  value: '',
                  ...patch,
                },
              ]
        return {
          ...part,
          deliverablesByStage: {
            ...(part.deliverablesByStage || {}),
            [stageId]: updated,
          },
        }
      }),
    )
  }

  if (isLoading) {
    return (
      <ApqpLayout title="Vehicle Detail">
        <section className="apqp-page">
          <div className="apqp-loading-grid">
            <div className="apqp-loading-row" />
            <div className="apqp-loading-row" />
            <div className="apqp-loading-row" />
          </div>
        </section>
      </ApqpLayout>
    )
  }

  if (!vehicle || !template) {
    return (
      <ApqpLayout title="Vehicle Detail">
        <section className="apqp-empty-state">
          <h2>Vehicle not found</h2>
          <Link className="apqp-btn apqp-btn--primary" to="/apqp/vehicles">
            Back to Vehicles
          </Link>
        </section>
      </ApqpLayout>
    )
  }

  const projectName = vehicle.projectName || vehicle.name || vehicle.id
  const projectCode = vehicle.projectId || vehicle.id
  const selectedPartDeliverablesProgress = getPartDeliverablesProgress(selectedPart, template.stages)

  return (
    <ApqpLayout title={projectName}>
      <section className="apqp-page">
        <header className="apqp-page__header">
          <div>
            <p className="apqp-page__eyebrow">Project</p>
            <h2 className="apqp-page__title">{projectName}</h2>
            <p className="apqp-page__lead">
              Project ID {projectCode} | {vehicle.customer} | {vehicle.platform} | SOP{' '}
              {dateLabel(vehicle.sopDate)}
            </p>
          </div>
          <div className="apqp-page__header-actions">
            <button type="button" className="apqp-btn apqp-btn--primary">Add Part</button>
            <button type="button" className="apqp-btn apqp-btn--ghost" onClick={() => updateQuery({ tab: 'kanban' })}>
              Open Kanban
            </button>
          </div>
        </header>

        <nav className="apqp-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              className={`apqp-tab${activeTab === tab ? ' apqp-tab--active' : ''}`}
              onClick={() => updateQuery({ tab })}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </nav>

        {activeTab === 'bom' ? (
          <section className="apqp-block">
            <div className="apqp-page__filters apqp-page__filters--wide">
              <label className="apqp-filter"><span>Search</span><input type="search" value={bomFilters.search} onChange={event => setBomFilters(current => ({ ...current, search: event.target.value }))} /></label>
              <label className="apqp-filter"><span>Supplier</span><select value={bomFilters.supplier} onChange={event => setBomFilters(current => ({ ...current, supplier: event.target.value }))}>{suppliers.map(item => <option key={item} value={item}>{item === 'all' ? 'All suppliers' : item}</option>)}</select></label>
              <label className="apqp-filter"><span>Family</span><select value={bomFilters.family} onChange={event => setBomFilters(current => ({ ...current, family: event.target.value }))}>{families.map(item => <option key={item} value={item}>{item === 'all' ? 'All families' : item}</option>)}</select></label>
              <label className="apqp-filter"><span>Current Stage</span><select value={bomFilters.stage} onChange={event => setBomFilters(current => ({ ...current, stage: event.target.value }))}><option value="all">All stages</option>{template.stages.map(stage => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label>
              <label className="apqp-filter"><span>Owner</span><select value={bomFilters.owner} onChange={event => setBomFilters(current => ({ ...current, owner: event.target.value }))}>{owners.map(item => <option key={item} value={item}>{item === 'all' ? 'All owners' : item}</option>)}</select></label>
            </div>

            {filteredBomParts.length === 0 ? <article className="apqp-empty-state"><h3>No parts found</h3><p>Adjust filters or add parts to this vehicle.</p></article> : null}
            {filteredBomParts.length > 0 ? (
              <>
                <div className="apqp-table-wrap">
                  <table className="apqp-table">
                    <thead>
                      <tr>
                        <th>Part Number</th>
                        <th>Description</th>
                        <th>Supplier</th>
                        <th>Family</th>
                        <th>Revision</th>
                        <th>Current Stage</th>
                        <th>Progress</th>
                        <th>Owner</th>
                        <th>Due Date</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {pagedParts.map(part => {
                        const stage = template.stages.find(item => item.id === part.currentStageId)
                        const deliverablesProgress = getPartDeliverablesProgress(part, template.stages)
                        return (
                          <tr key={part.id} className="apqp-table__row--clickable" onClick={() => updateQuery({ part: part.id })}>
                            <td>{part.partNumber}</td>
                            <td>{part.description}</td>
                            <td>{part.supplier}</td>
                            <td>{part.family}</td>
                            <td>{part.revision}</td>
                            <td><span className="apqp-stage-badge" style={{ '--stage-color': stage?.color || '#4d5b66' }}>{stage?.name || '--'}</span></td>
                            <td>
                              <div className="apqp-progress">
                                <div className="apqp-progress__bar" style={{ width: `${deliverablesProgress.percent}%` }} />
                                <span className="apqp-progress__meta">
                                  {deliverablesProgress.percent}% ({deliverablesProgress.done}/{deliverablesProgress.total} deliverables)
                                </span>
                              </div>
                            </td>
                            <td>{part.owner?.name}</td>
                            <td>{dateLabel(part.dueDate)}</td>
                            <td><button type="button" className="apqp-btn apqp-btn--ghost" onClick={event => { event.stopPropagation(); updateQuery({ part: part.id }) }}>Open</button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <footer className="apqp-pagination">
                  <p>Page {currentPage} of {pageCount}</p>
                  <div className="apqp-pagination__actions">
                    <button type="button" className="apqp-btn apqp-btn--ghost" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={currentPage === 1}>Previous</button>
                    <button type="button" className="apqp-btn apqp-btn--ghost" onClick={() => setPage(value => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount}>Next</button>
                  </div>
                </footer>
              </>
            ) : null}
          </section>
        ) : null}

        {activeTab === 'kanban' ? (
          <section className="apqp-block">
            <div className="apqp-page__filters apqp-page__filters--wide">
              <label className="apqp-filter"><span>Search</span><input type="search" value={boardFilters.search} onChange={event => setBoardFilters(current => ({ ...current, search: event.target.value }))} /></label>
              <label className="apqp-filter"><span>Supplier</span><select value={boardFilters.supplier} onChange={event => setBoardFilters(current => ({ ...current, supplier: event.target.value }))}>{suppliers.map(item => <option key={item} value={item}>{item === 'all' ? 'All suppliers' : item}</option>)}</select></label>
              <label className="apqp-filter"><span>Family</span><select value={boardFilters.family} onChange={event => setBoardFilters(current => ({ ...current, family: event.target.value }))}>{families.map(item => <option key={item} value={item}>{item === 'all' ? 'All families' : item}</option>)}</select></label>
              <label className="apqp-filter"><span>Owner</span><select value={boardFilters.owner} onChange={event => setBoardFilters(current => ({ ...current, owner: event.target.value }))}>{owners.map(item => <option key={item} value={item}>{item === 'all' ? 'All owners' : item}</option>)}</select></label>
              <div className="apqp-filter"><span>View</span><div className="apqp-toggle"><button type="button" className={`apqp-toggle__btn${kanbanView === 'kanban' ? ' apqp-toggle__btn--active' : ''}`} onClick={() => setKanbanView('kanban')}>Kanban</button><button type="button" className={`apqp-toggle__btn${kanbanView === 'list' ? ' apqp-toggle__btn--active' : ''}`} onClick={() => setKanbanView('list')}>List</button></div></div>
            </div>
            {boardMessage ? <p className={`apqp-inline-message${boardMessage.includes('Blocked') || boardMessage.includes('WIP') ? ' apqp-inline-message--error' : ' apqp-inline-message--success'}`}>{boardMessage}</p> : null}

            {kanbanView === 'list' ? (
              <div className="apqp-table-wrap">
                <table className="apqp-table">
                  <thead><tr><th>Part</th><th>Stage</th><th>Supplier</th><th>Owner</th><th>Completion</th><th /></tr></thead>
                  <tbody>
                    {filteredBoardParts.map(part => {
                      const stage = template.stages.find(item => item.id === part.currentStageId)
                      const completion = getDeliverableCompletion(part, stage)
                      return (
                        <tr key={part.id}>
                          <td><strong>{part.partNumber}</strong><p className="apqp-table__subtext">{part.description}</p></td>
                          <td><span className="apqp-stage-badge" style={{ '--stage-color': stage?.color || '#4d5b66' }}>{stage?.name}</span></td>
                          <td>{part.supplier}</td>
                          <td>{part.owner?.name}</td>
                          <td>{completion.done}/{completion.total}</td>
                          <td><button type="button" className="apqp-btn apqp-btn--ghost" onClick={() => updateQuery({ part: part.id })}>Open</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="apqp-board">
                {template.stages.map(stage => {
                  const stageParts = filteredBoardParts.filter(item => item.currentStageId === stage.id)
                  return (
                    <section key={stage.id} className="apqp-column" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (draggingId) movePart(draggingId, stage.id); setDraggingId('') }}>
                      <header className="apqp-column__header">
                        <h3><span className="apqp-column__dot" style={{ backgroundColor: stage.color }} />{stage.name}</h3>
                        <p className="apqp-column__meta">Parts: {stageParts.length}</p>
                        <p className="apqp-column__meta">WIP: {Number.isFinite(stage.wipLimit) && stage.wipLimit < 900 ? `${stageParts.length}/${stage.wipLimit}` : stageParts.length}</p>
                      </header>
                      <div className="apqp-column__body">
                        {stageParts.length === 0 ? <p className="apqp-column__empty">No parts in this stage</p> : null}
                        {stageParts.map(part => {
                          const completion = getDeliverableCompletion(part, stage)
                          return (
                            <article key={part.id} className="apqp-card" draggable onDragStart={() => setDraggingId(part.id)} onClick={() => updateQuery({ part: part.id })}>
                              <header className="apqp-card__header"><strong>{part.partNumber}</strong></header>
                              <p className="apqp-card__description">{part.description}</p>
                              <p className="apqp-card__meta">{part.supplier}</p>
                              <p className="apqp-card__meta">Owner: {part.owner?.name}</p>
                              <div className="apqp-card__progress"><div className="apqp-card__progress-bar" style={{ width: `${completion.percent}%` }} /><span>Deliverables {completion.done}/{completion.total}</span></div>
                            </article>
                          )
                        })}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === 'settings' ? (
          <section className="apqp-block">
            <header className="apqp-section-header">
              <div><h3>Vehicle Settings</h3><p>Template setup and stage order for this vehicle.</p></div>
              <button type="button" className="apqp-btn apqp-btn--primary">Change Template</button>
            </header>
            <article className="apqp-settings-card">
              <p className="apqp-settings-card__label">Selected APQP Template</p>
              <h4>{template.name}</h4>
              <p>{template.description}</p>
            </article>
            <ol className="apqp-stage-order">
              {template.stages.map(stage => (
                <li key={stage.id} className="apqp-stage-order__item">
                  <span className="apqp-stage-order__chip" style={{ '--stage-color': stage.color }}>{stage.name}</span>
                  <span>WIP Limit: {stage.wipLimit}</span>
                  <span>{stage.deliverables.length} deliverables</span>
                </li>
              ))}
            </ol>
            <button type="button" className="apqp-btn apqp-btn--ghost" disabled={!hasGroup(GROUPS.ADMIN)}>
              Customize Stages
            </button>
          </section>
        ) : null}
      </section>

      {selectedPart ? (
        <aside className="apqp-part-drawer">
          <header className="apqp-part-drawer__header">
            <div>
              <p className="apqp-page__eyebrow">Part Detail</p>
              <h3>{selectedPart.partNumber}</h3>
              <p>{selectedPart.description}</p>
            </div>
            <button type="button" className="apqp-btn apqp-btn--ghost" onClick={() => updateQuery({ part: null })}>Close</button>
          </header>

          <div className="apqp-part-drawer__meta">
            <span className="apqp-stage-badge" style={{ '--stage-color': selectedStage?.color || '#4d5b66' }}>{selectedStage?.name || '--'}</span>
            <div className="apqp-progress">
              <div className="apqp-progress__bar" style={{ width: `${selectedPartDeliverablesProgress.percent}%` }} />
              <span className="apqp-progress__meta">
                {selectedPartDeliverablesProgress.percent}% ({selectedPartDeliverablesProgress.done}/{selectedPartDeliverablesProgress.total} deliverables)
              </span>
            </div>
            <p>Owner: {selectedPart.owner?.name || '--'}</p>
            <p>Due Date: {dateLabel(selectedPart.dueDate)}</p>
          </div>

          <div className="apqp-part-drawer__actions">
            <label>
              Move Stage
              <select value={selectedPart.currentStageId} onChange={event => movePart(selectedPart.id, event.target.value)}>
                {template.stages.map(stage => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
              </select>
            </label>
          </div>

          <section className="apqp-part-drawer__section">
            <h4>Current Stage Deliverables</h4>
            {selectedDeliverables.map(deliverable => (
              <article key={deliverable.id} className={`apqp-deliverable${deliverable.required && deliverable.status !== 'Done' ? ' apqp-deliverable--required' : ''}`}>
                <header className="apqp-deliverable__header">
                  <strong>{deliverable.name}</strong>
                  <span>{deliverable.type}</span>
                  {deliverable.required ? <span className="apqp-required">Required</span> : null}
                </header>
                <div className="apqp-deliverable__controls">
                  <label>
                    Status
                    <select value={deliverable.status} onChange={event => updateDeliverable(selectedPart.id, selectedStage.id, deliverable.id, { status: event.target.value })}>
                      <option>Not Started</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </label>
                  <label>
                    Value
                    <input value={deliverable.value} onChange={event => updateDeliverable(selectedPart.id, selectedStage.id, deliverable.id, { value: event.target.value })} />
                  </label>
                </div>
              </article>
            ))}
          </section>

          <section className="apqp-part-drawer__section">
            <h4>Stage History</h4>
            <ol className="apqp-history">
              {(selectedPart.history || []).map(entry => (
                <li key={entry.id} className="apqp-history__item">
                  <p><strong>{entry.fromStageId}</strong> to <strong>{entry.toStageId}</strong></p>
                  <p>{entry.user} | {dateLabel(entry.date)}</p>
                  {entry.note ? <p>{entry.note}</p> : null}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      ) : null}
    </ApqpLayout>
  )
}

export default ApqpVehicleDetailPage
