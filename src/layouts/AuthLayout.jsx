import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-logo">workforce</div>
      <div className="auth-card">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
