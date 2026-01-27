import { Link } from 'react-router-dom'

function InternalHomePage() {
  return (
    <section className="card" aria-labelledby="internal-home-title">
      <p className="dashboard__eyebrow">Área interna</p>
      <h1 id="internal-home-title">Bem-vindo ao portal interno</h1>
      <p className="dashboard__lead">
        Acesse rapidamente os principais pontos de trabalho da área interna.
      </p>
      <div className="dashboard__actions">
        <Link className="request-card__action" to="/internal-dashboard">
          Ir para o dashboard interno
        </Link>
        <Link className="request-card__action" to="/initiatives-hub">
          Abrir o Initiatives Hub
        </Link>
        <Link className="request-card__action" to="/monthly-birthdays">
          This Month's Birthdays
        </Link>
      </div>
    </section>
  )
}

export default InternalHomePage
