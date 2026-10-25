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
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">ShiftQ</div>
      <nav>
        {links.map((link) => (
          <NavLink key={link.path} to={link.path} onClick={onClose}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-role">{ROLE_LABELS[user.role]}</div>
    </aside>
  )
}

export default Sidebar
