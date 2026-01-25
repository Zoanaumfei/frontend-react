import { NavLink } from 'react-router-dom'

const getLinkClass = ({ isActive }) =>
  `nav__link${isActive ? ' nav__link--active' : ''}`

function Navigation() {
  return (
    <header className="nav">
      <div className="nav__brand">Oryzem</div>
      <nav className="nav__links">
        <NavLink to="/" className={getLinkClass}>
          Home
        </NavLink>
        <NavLink to="/users" className={getLinkClass}>
          Users
        </NavLink>
      </nav>
    </header>
  )
}

export default Navigation
