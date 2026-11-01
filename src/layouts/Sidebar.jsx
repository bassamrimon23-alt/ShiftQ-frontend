import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS } from '../constants/roles'
import routesConfig from '../routes/routesConfig'

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()

  const links = routesConfig.filter(
    (r) => r.showInSidebar && r.allowedRoles.includes(user.role)
  )

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">workforce</div>

        <div className="sidebar-org">
          <span>Northstar Studio</span>
          <span>{ROLE_LABELS[user.role]} workspace</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink key={link.path} to={link.path} onClick={onClose}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <span>{user.name}</span>
          <span>{ROLE_LABELS[user.role]}</span>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
