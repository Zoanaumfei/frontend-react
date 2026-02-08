import { Link } from 'react-router-dom'

function NoAccessPage() {
  return (
    <section className="card" aria-labelledby="no-access-title">
      <p className="dashboard__eyebrow">Access</p>
      <h1 id="no-access-title">You do not have access to this resource.</h1>
      <p className="dashboard__lead">
        Your account is authenticated but does not have permission for this action.
      </p>
      <div className="dashboard__actions">
        <Link className="request-card__action" to="/">
          Go to home
        </Link>
      </div>
    </section>
  )
}

export default NoAccessPage
