import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ApqpLayout from '../components/apqp/ApqpLayout'
import { getApqpTemplate } from '../services/apqpService'

function ApqpTemplateDetailPage() {
  const { templateId } = useParams()
  const [template, setTemplate] = useState(null)
  const [selectedStageId, setSelectedStageId] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      const data = await getApqpTemplate(templateId)
      if (!isMounted) return
      setTemplate(data)
      setSelectedStageId(data?.stages?.[0]?.id || '')
      setIsLoading(false)
    }

    load()
    return () => {
      isMounted = false
    }
  }, [templateId])

  const selectedStage = useMemo(
    () => template?.stages?.find(stage => stage.id === selectedStageId) || null,
    [selectedStageId, template],
  )

  const moveStage = (stageId, direction) => {
    setTemplate(current => {
      if (!current) return current
      const index = current.stages.findIndex(stage => stage.id === stageId)
      if (index < 0) return current

      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= current.stages.length) return current

      const nextStages = [...current.stages]
      const [stage] = nextStages.splice(index, 1)
      nextStages.splice(target, 0, stage)

      return { ...current, stages: nextStages }
    })
  }

  if (isLoading) {
    return (
      <ApqpLayout title="Template Detail">
        <section className="apqp-page">
          <div className="apqp-loading-grid">
            <div className="apqp-loading-row" />
            <div className="apqp-loading-row" />
          </div>
        </section>
      </ApqpLayout>
    )
  }

  if (!template) {
    return (
      <ApqpLayout title="Template Detail">
        <section className="apqp-empty-state">
          <h2>Template not found</h2>
          <Link className="apqp-btn apqp-btn--primary" to="/apqp/templates">
            Back to Templates
          </Link>
        </section>
      </ApqpLayout>
    )
  }

  return (
    <ApqpLayout title={template.name}>
      <section className="apqp-page">
        <header className="apqp-page__header">
          <div>
            <p className="apqp-page__eyebrow">Template Detail</p>
            <h2 className="apqp-page__title">{template.name}</h2>
            <p className="apqp-page__lead">{template.description}</p>
          </div>
          <Link className="apqp-btn apqp-btn--ghost" to="/apqp/templates">
            Back
          </Link>
        </header>

        <div className="apqp-detail-grid">
          <section className="apqp-block">
            <header className="apqp-section-header">
              <h3>Stages</h3>
              <button type="button" className="apqp-btn apqp-btn--primary">
                Add Stage
              </button>
            </header>

            <ul className="apqp-stage-list">
              {template.stages.map(stage => (
                <li key={stage.id} className="apqp-stage-list__item">
                  <button
                    type="button"
                    className={`apqp-stage-list__main${selectedStageId === stage.id ? ' apqp-stage-list__main--active' : ''}`}
                    onClick={() => setSelectedStageId(stage.id)}
                  >
                    <span
                      className="apqp-stage-list__dot"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span>{stage.name}</span>
                    <span>WIP: {stage.wipLimit}</span>
                  </button>
                  <div className="apqp-stage-list__actions">
                    <button type="button" className="apqp-btn apqp-btn--ghost" onClick={() => moveStage(stage.id, 'up')}>
                      Up
                    </button>
                    <button type="button" className="apqp-btn apqp-btn--ghost" onClick={() => moveStage(stage.id, 'down')}>
                      Down
                    </button>
                    <button type="button" className="apqp-btn apqp-btn--ghost">
                      Edit
                    </button>
                    <button type="button" className="apqp-btn apqp-btn--ghost">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="apqp-block">
            <header className="apqp-section-header">
              <h3>Deliverables by Stage</h3>
              <button type="button" className="apqp-btn apqp-btn--primary" disabled={!selectedStage}>
                Add Deliverable
              </button>
            </header>

            {!selectedStage ? (
              <article className="apqp-empty-state">
                <p>Select a stage to view deliverables.</p>
              </article>
            ) : (
              <>
                <p className="apqp-section-subtitle">{selectedStage.name}</p>
                <div className="apqp-table-wrap">
                  <table className="apqp-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStage.deliverables.map(deliverable => (
                        <tr key={deliverable.id}>
                          <td>{deliverable.name}</td>
                          <td>{deliverable.type}</td>
                          <td>{deliverable.required ? 'Yes' : 'No'}</td>
                          <td>
                            <div className="apqp-row-actions">
                              <button type="button" className="apqp-btn apqp-btn--ghost">
                                Edit
                              </button>
                              <button type="button" className="apqp-btn apqp-btn--ghost">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </ApqpLayout>
  )
}

export default ApqpTemplateDetailPage

