import { Link } from 'react-router-dom'

function InternalHomePage() {
  return (
    <section className="card" aria-labelledby="internal-home-title">
      <p className="dashboard__eyebrow">Área interna</p>
      <h1 id="internal-home-title">Bem-vindo ao portal interno para colaboradores</h1>
      <p className="dashboard__lead">
        Acesse rapidamente as principais interfaces.
      </p>
      <div className="dashboard__actions dashboard__actions--spaced internal-home__actions">
        <Link className="request-card__action internal-home__action" to="/internal-dashboard">
          Dashboard de acordos de timing
        </Link>
        <Link className="request-card__action internal-home__action" to="/initiatives-hub">
          Hub de iniciativas
        </Link>
        <Link className="request-card__action internal-home__action" to="/monthly-birthdays">
          Aniversariantes do mes
        </Link>
        <Link className="request-card__action internal-home__action" to="/project-dashboard">
          Project Dashboard
        </Link>
        <Link className="request-card__action internal-home__action" to="/project-management">
          ProjectManagement
        </Link>
      </div>
      <div className="dashboard__mode">
        <p className="dashboard__mode-label">Modo de exibicao</p>
        <Link className="request-card__action dashboard__mode-action" to="/dashboard-mode">
          Dashboard mode
        </Link>
      </div>
    </section>
  )
}

export default InternalHomePage
