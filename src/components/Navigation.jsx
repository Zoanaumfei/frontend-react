import { NavLink } from 'react-router-dom'

const getLinkClass = ({ isActive }) =>
  `nav__link${isActive ? ' nav__link--active' : ''}`

function Navigation() {
  return (
    <header className="nav">
      <div className="nav__brand">Oryzem</div>
      <nav className="nav__links">
        <NavLink to="/" className={getLinkClass}>
          Início
        </NavLink>
        <NavLink to="/users" className={getLinkClass}>
          Usuários
        </NavLink>
        <NavLink to="/mission" className={getLinkClass}>
          Nossa missão
        </NavLink>
        <NavLink to="/support" className={getLinkClass}>
          Suporte
        </NavLink>
      </nav>
    </header>
  )
}

export default Navigation
