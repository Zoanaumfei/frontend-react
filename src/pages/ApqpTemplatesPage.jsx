import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ApqpLayout from '../components/apqp/ApqpLayout'
import { getApqpTemplates } from '../services/apqpService'

function ApqpTemplatesPage() {
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      const data = await getApqpTemplates()
      if (!isMounted) return
      setTemplates(data)
      setIsLoading(false)
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <ApqpLayout title="APQP Templates">
      <section className="apqp-page" aria-labelledby="apqp-templates-title">
        <header className="apqp-page__header">
          <div>
            <p className="apqp-page__eyebrow">Admin</p>
            <h2 id="apqp-templates-title" className="apqp-page__title">
              APQP Templates
            </h2>
            <p className="apqp-page__lead">
              Define flexible APQP stage models and their deliverables.
            </p>
          </div>
          <button type="button" className="apqp-btn apqp-btn--primary">
            Add Template
          </button>
        </header>

        {isLoading ? (
          <div className="apqp-loading-grid">
            <div className="apqp-loading-row" />
            <div className="apqp-loading-row" />
          </div>
        ) : null}

        {!isLoading && templates.length === 0 ? (
          <article className="apqp-empty-state">
            <h3>No templates found</h3>
            <p>Create your first APQP template.</p>
          </article>
        ) : null}

        {!isLoading && templates.length > 0 ? (
          <div className="apqp-table-wrap">
            <table className="apqp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Stages</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {templates.map(template => (
                  <tr key={template.id}>
                    <td>{template.name}</td>
                    <td>{template.description}</td>
                    <td>{template.stages.length}</td>
                    <td>
                      <div className="apqp-row-actions">
                        <Link className="apqp-btn apqp-btn--ghost" to={`/apqp/templates/${template.id}`}>
                          Edit
                        </Link>
                        <button type="button" className="apqp-btn apqp-btn--ghost">
                          Duplicate
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
        ) : null}
      </section>
    </ApqpLayout>
  )
}

export default ApqpTemplatesPage

