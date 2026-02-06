import { Link } from 'react-router-dom'

function ProjectManagementPage() {
  return (
    <section className="card" aria-labelledby="project-management-title">
      <p className="dashboard__eyebrow">Area interna</p>
      <h1 id="project-management-title">ProjectManagement</h1>
      <p className="dashboard__lead">
        Central page for project management workflows and follow-up actions.
      </p>
      <div className="dashboard__actions">
        <Link className="request-card__action" to="/new-project-creation">
          Create a new project
        </Link>
        <Link className="request-card__action" to="/project-dashboard">
          Open project dashboard
        </Link>
      </div>
    </section>
  )
}

export default ProjectManagementPage
