import { NavLink, useNavigate } from 'react-router-dom'
import { GROUPS } from '../../auth/auth.constants'
import { hasGroup } from '../../auth/auth.groups'
import { clearTokens } from '../../auth/auth.tokens'

const getNavClass = ({ isActive }) =>
  `apqp-layout__nav-link${isActive ? ' apqp-layout__nav-link--active' : ''}`

function ApqpLayout({ title, children }) {
  const isAdmin = hasGroup(GROUPS.ADMIN)
  const navigate = useNavigate()

  const handleLogout = () => {
    clearTokens()
    navigate('/')
  }

  return (
    <div className="apqp-layout">
      <aside className="apqp-layout__sidebar">
        <div className="apqp-layout__system">
          <p className="apqp-layout__eyebrow">Internal Platform</p>
          <h1 className="apqp-layout__system-name">APQP Control Tower</h1>
        </div>
        <nav className="apqp-layout__nav" aria-label="APQP navigation">
          <NavLink to="/apqp/vehicles" className={getNavClass}>
            Vehicles
          </NavLink>
          {isAdmin ? (
            <NavLink to="/apqp/templates" className={getNavClass}>
              APQP Templates
            </NavLink>
          ) : null}
          <NavLink to="/apqp/notifications" className={getNavClass}>
            Notifications
          </NavLink>
          {isAdmin ? (
            <NavLink to="/users" className={getNavClass}>
              User Management
            </NavLink>
          ) : null}
          <NavLink to="/apqp/settings" className={getNavClass}>
            Settings
          </NavLink>
          <button
            type="button"
            className="apqp-layout__nav-link apqp-layout__nav-link--logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </aside>

      <div className="apqp-layout__main">
        <header className="apqp-layout__topbar">
          <div className="apqp-layout__title-wrap">
            <p className="apqp-layout__topbar-label">System</p>
            <h2 className="apqp-layout__title">{title}</h2>
          </div>
          <label className="apqp-layout__search" htmlFor="apqp-global-search">
            <span>Search</span>
            <input id="apqp-global-search" type="search" placeholder="Search vehicles, parts, templates..." />
          </label>
          <div className="apqp-layout__profile">
            <NavLink to="/apqp/notifications" className="apqp-layout__bell" aria-label="Open notifications">
              3
            </NavLink>
            <button type="button" className="apqp-layout__user">
              Internal User
            </button>
          </div>
        </header>
        <div className="apqp-layout__content">{children}</div>
      </div>
    </div>
  )
}

export default ApqpLayout
