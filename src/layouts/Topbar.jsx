import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS } from '../constants/roles'

function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <button className="menu-button" onClick={onMenuClick}>Menu</button>
      <div className="topbar-user">
        <span>{user.name}</span>
        <span className="role-badge">{ROLE_LABELS[user.role]}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </header>
  )
}

export default Topbar
