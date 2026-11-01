import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS } from '../constants/roles'

function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn menu-button" onClick={onMenuClick}>Menu</button>
        <div>
          <p className="topbar-title">
            Northstar Studio / {ROLE_LABELS[user.role]} workspace
          </p>
          <p className="topbar-date">{today}</p>
        </div>
      </div>

      <div className="topbar-user">
        <span>{user.name}</span>
        <span className="role-badge">{ROLE_LABELS[user.role]}</span>
        <button className="btn" onClick={logout}>Logout</button>
      </div>
    </header>
  )
}

export default Topbar
